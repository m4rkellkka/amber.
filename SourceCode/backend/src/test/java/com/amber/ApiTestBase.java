package com.amber;

import com.amber.security.FirebaseTokenVerifier;
import com.amber.security.VerifiedToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;

/**
 * Shared setup for API tests: full app on the amber_test database, Firebase replaced by a mock.
 * All subclasses share one Spring context, so the app starts only once.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {"app.admin-emails=admin@test.dev", "app.seed-demo=false"})
public abstract class ApiTestBase {

    @Autowired
    protected MockMvc mvc;

    @MockitoBean
    protected FirebaseTokenVerifier verifier;

    /** Makes the mock accept {@code token} as the given user. Returns the header value. */
    protected String tokenFor(String token, String uid, String email, boolean verified) {
        when(verifier.verify(token)).thenReturn(new VerifiedToken(uid, email, "Test " + uid, verified));
        return "Bearer " + token;
    }
}
