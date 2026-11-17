package com.amber.admin;

import com.amber.ApiTestBase;
import com.amber.entity.Product;
import com.amber.entity.ProductType;
import com.amber.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Admin tabs: add product, stock, questions, orders, summary. */
class AdminIntegrationTest extends ApiTestBase {

    @Autowired
    private ProductRepository products;

    private String admin;
    private String user;

    @BeforeEach
    void signIn() {
        admin = tokenFor("t-boss", "uid-boss", "admin@test.dev", true);
        user = tokenFor("t-client", "uid-client", "client@test.dev", true);
    }

    private MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder req, String auth, String body) {
        return req.header("Authorization", auth).contentType(MediaType.APPLICATION_JSON).content(body);
    }

    private Product newPackage(int stock) {
        Product p = new Product();
        p.setName("Admin test " + System.nanoTime());
        p.setSlug("admin-test-" + System.nanoTime());
        p.setShortDescription("Test");
        p.setType(ProductType.PACKAGE);
        p.setPrice(new BigDecimal("200.00"));
        p.setDeliveryDays(5);
        p.setStock(stock);
        return products.save(p);
    }

    private long placeOrder(long productId) throws Exception {
        String body = mvc.perform(json(post("/api/orders"), user,
                        "{\"items\": [{\"productId\": " + productId + ", \"quantity\": 1}]}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return Long.parseLong(body.replaceAll("^\\{\"id\":(\\d+).*", "$1"));
    }

    @Test
    void usersCannotUseAdminApi() throws Exception {
        mvc.perform(get("/api/admin/summary").header("Authorization", user)).andExpect(status().isForbidden());
        mvc.perform(json(post("/api/admin/products"), user, "{}")).andExpect(status().isForbidden());
        mvc.perform(get("/api/admin/orders")).andExpect(status().isUnauthorized());
    }

    @Test
    void createsPackageWithGeneratedSlugAndShowsItInCatalog() throws Exception {
        String name = "Café Menu Site " + System.nanoTime();
        mvc.perform(json(post("/api/admin/products"), admin, """
                        {"type": "PACKAGE", "name": "%s", "shortDescription": "Menu with QR code",
                         "price": 250, "deliveryDays": 5, "stock": 2, "features": ["QR code", " ", "Two languages"]}
                        """.formatted(name)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slug").value(org.hamcrest.Matchers.startsWith("cafe-menu-site-")))
                .andExpect(jsonPath("$.active").value(true));

        String slug = products.findAll().stream().filter(p -> p.getName().equals(name)).findFirst().orElseThrow().getSlug();
        mvc.perform(get("/api/products/" + slug))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.features.length()").value(2));
    }

    @Test
    void productFormIsValidated() throws Exception {
        mvc.perform(json(post("/api/admin/products"), admin, """
                        {"type": "ADDON", "name": "", "shortDescription": "x", "price": 0, "slug": "Bad Slug"}
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").value("Name is required"))
                .andExpect(jsonPath("$.fieldErrors.price").value("Price must be at least $1"))
                .andExpect(jsonPath("$.fieldErrors.slug").exists());

        mvc.perform(json(post("/api/admin/products"), admin, """
                        {"type": "PACKAGE", "name": "No days", "shortDescription": "x", "price": 10}
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Delivery days are required for a package"));
    }

    @Test
    void duplicateSlugIs409() throws Exception {
        mvc.perform(json(post("/api/admin/products"), admin, """
                        {"type": "ADDON", "name": "Copy", "slug": "landing-page", "shortDescription": "x", "price": 10}
                        """))
                .andExpect(status().isConflict());
    }

    @Test
    void adminChangesStockAndHidesProduct() throws Exception {
        Product p = newPackage(1);
        mvc.perform(json(put("/api/admin/products/" + p.getId() + "/stock"), admin, "{\"stock\": 7}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.stock").value(7));
        mvc.perform(json(put("/api/admin/products/" + p.getId() + "/stock"), admin, "{\"stock\": -1}"))
                .andExpect(status().isBadRequest());

        mvc.perform(json(put("/api/admin/products/" + p.getId() + "/active"), admin, "{\"active\": false}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.active").value(false));
        mvc.perform(get("/api/products/" + p.getSlug())).andExpect(status().isNotFound());
    }

    @Test
    void answeredQuestionLeavesInboxAndBecomesPublic() throws Exception {
        Product p = newPackage(3);
        String text = "Do you work weekends? " + System.nanoTime();
        String body = mvc.perform(json(post("/api/products/" + p.getId() + "/questions"), user,
                        "{\"text\": \"" + text + "\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long id = Long.parseLong(body.replaceAll("^\\{\"id\":(\\d+).*", "$1"));

        mvc.perform(get("/api/admin/questions").header("Authorization", admin))
                .andExpect(jsonPath("$[?(@.id == " + id + ")].authorEmail").value("client@test.dev"));

        mvc.perform(json(put("/api/admin/questions/" + id + "/answer"), admin, "{\"answer\": \"Yes, on Saturdays.\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.answeredAt").exists());

        mvc.perform(get("/api/admin/questions").header("Authorization", admin))
                .andExpect(jsonPath("$[?(@.id == " + id + ")]").isEmpty());
        mvc.perform(get("/api/products/" + p.getId() + "/questions"))
                .andExpect(jsonPath("$[0].answer").value("Yes, on Saturdays."));
    }

    @Test
    void cancellingReturnsSlotAndCannotBeReopened() throws Exception {
        Product p = newPackage(1);
        long orderId = placeOrder(p.getId());
        assertThat(products.findById(p.getId()).orElseThrow().getStock()).isZero();

        mvc.perform(json(put("/api/admin/orders/" + orderId + "/status"), admin, "{\"status\": \"IN_PROGRESS\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.order.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.customerEmail").value("client@test.dev"));
        assertThat(products.findById(p.getId()).orElseThrow().getStock()).isZero();

        mvc.perform(json(put("/api/admin/orders/" + orderId + "/status"), admin, "{\"status\": \"CANCELLED\"}"))
                .andExpect(status().isOk());
        assertThat(products.findById(p.getId()).orElseThrow().getStock()).isEqualTo(1);

        mvc.perform(json(put("/api/admin/orders/" + orderId + "/status"), admin, "{\"status\": \"NEW\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("A cancelled order cannot be reopened"));
    }

    @Test
    void summaryCountsOrdersAndSlots() throws Exception {
        Product p = newPackage(2);
        long orderId = placeOrder(p.getId());
        mvc.perform(json(put("/api/admin/orders/" + orderId + "/status"), admin, "{\"status\": \"DONE\"}"));

        mvc.perform(get("/api/admin/summary").header("Authorization", admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ordersByStatus.DONE").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.revenue").value(org.hamcrest.Matchers.greaterThanOrEqualTo(200.0)))
                .andExpect(jsonPath("$.openSlots").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.unansweredQuestions").isNumber());
    }
}
