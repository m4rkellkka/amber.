package com.amber.security;

import com.amber.ApiTestBase;
import org.junit.jupiter.api.Test;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** End-to-end checks of the security rules, with Firebase replaced by a mock. */
class SecurityIntegrationTest extends ApiTestBase {

    @Test
    void catalogIsPublic() throws Exception {
        mvc.perform(get("/api/products")).andExpect(status().isOk());
    }

    @Test
    void meWithoutTokenIs401() throws Exception {
        mvc.perform(get("/api/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void invalidTokenIs401() throws Exception {
        when(verifier.verify(anyString())).thenThrow(new InvalidTokenException("bad", null));
        mvc.perform(get("/api/me").header("Authorization", "Bearer broken"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void regularUserGetsRoleUser() throws Exception {
        tokenFor("t-user", "uid-user", "user@test.dev", true);
        mvc.perform(get("/api/me").header("Authorization", "Bearer t-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user@test.dev"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void verifiedAdminEmailGetsRoleAdmin() throws Exception {
        tokenFor("t-admin", "uid-admin", "Admin@test.dev", true);
        mvc.perform(get("/api/me").header("Authorization", "Bearer t-admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void unverifiedAdminEmailStaysUser() throws Exception {
        tokenFor("t-fake", "uid-fake", "admin@test.dev", false);
        mvc.perform(get("/api/me").header("Authorization", "Bearer t-fake"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void adminRoutesAreForbiddenForUsers() throws Exception {
        tokenFor("t-user2", "uid-user2", "user2@test.dev", true);
        mvc.perform(get("/api/admin/summary").header("Authorization", "Bearer t-user2"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    void adminRoutesPassSecurityForAdmins() throws Exception {
        tokenFor("t-admin2", "uid-admin2", "admin@test.dev", true);
        mvc.perform(get("/api/admin/summary").header("Authorization", "Bearer t-admin2"))
                .andExpect(status().isOk());
    }
}
