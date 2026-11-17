package com.amber.question;

import com.amber.ApiTestBase;
import com.amber.entity.Question;
import com.amber.repository.ProductRepository;
import com.amber.repository.QuestionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.time.Instant;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Who can ask and who can see product questions. */
class QuestionIntegrationTest extends ApiTestBase {

    @Autowired
    private ProductRepository products;

    @Autowired
    private QuestionRepository questions;

    private long productId;
    private String alice;
    private String bob;

    @BeforeEach
    void setUp() {
        productId = products.findBySlugAndActiveTrue("business-website").orElseThrow().getId();
        alice = tokenFor("t-alice", "uid-alice", "alice@test.dev", true);
        bob = tokenFor("t-bob", "uid-bob", "bob@test.dev", true);
    }

    private String url() {
        return "/api/products/" + productId + "/questions";
    }

    private long ask(String auth, String text) throws Exception {
        String json = mvc.perform(post(url()).header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"text\": \"" + text + "\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.mine").value(true))
                .andExpect(jsonPath("$.answer").isEmpty())
                .andReturn().getResponse().getContentAsString();
        return Long.parseLong(json.replaceAll(".*\"id\":(\\d+).*", "$1"));
    }

    @Test
    void unansweredQuestionIsVisibleOnlyToAuthorAndAdmin() throws Exception {
        String text = "Can you add a booking form? " + System.nanoTime();
        ask(alice, text);
        String filter = "$[?(@.text == '" + text + "')]";

        mvc.perform(get(url())).andExpect(status().isOk()).andExpect(jsonPath(filter).isEmpty());
        mvc.perform(get(url()).header("Authorization", bob)).andExpect(jsonPath(filter).isEmpty());
        mvc.perform(get(url()).header("Authorization", alice)).andExpect(jsonPath(filter).isNotEmpty());

        String admin = tokenFor("t-qadmin", "uid-qadmin", "admin@test.dev", true);
        mvc.perform(get(url()).header("Authorization", admin)).andExpect(jsonPath(filter).isNotEmpty());
    }

    @Test
    void answeredQuestionIsPublicWithFirstNameOnly() throws Exception {
        String text = "How long is support? " + System.nanoTime();
        long id = ask(alice, text);
        Question q = questions.findById(id).orElseThrow();
        q.setAnswer("One month after launch.");
        q.setAnsweredAt(Instant.now());
        questions.save(q);

        mvc.perform(get(url()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.text == '" + text + "')].answer").value("One month after launch."))
                .andExpect(jsonPath("$[?(@.text == '" + text + "')].authorName").value("Test"))
                .andExpect(jsonPath("$[?(@.text == '" + text + "')].mine").value(false));
    }

    @Test
    void askingNeedsSignIn() throws Exception {
        mvc.perform(post(url()).contentType(MediaType.APPLICATION_JSON).content("{\"text\": \"Hi\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void emptyQuestionIs400() throws Exception {
        mvc.perform(post(url()).header("Authorization", alice)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"text\": \"   \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.text").value("Please write your question"));
    }

    @Test
    void unknownProductIs404() throws Exception {
        mvc.perform(get("/api/products/999999/questions")).andExpect(status().isNotFound());
    }
}
