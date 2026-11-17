package com.amber.security;

import com.amber.entity.User;
import com.amber.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Runs once per request:
 * 1. reads "Authorization: Bearer <Firebase ID token>";
 * 2. verifies the token with Firebase;
 * 3. finds or creates the matching row in "users" (role USER or ADMIN);
 * 4. puts the user into the SecurityContext, so Spring Security can check roles.
 * No header -> the request continues as anonymous (public pages still work).
 * Not a @Component on purpose: it is added only to the security chain in SecurityConfig.
 */
public class FirebaseTokenFilter extends OncePerRequestFilter {

    private static final String BEARER = "Bearer ";

    private final FirebaseTokenVerifier verifier;
    private final UserService userService;
    private final SecurityErrorHandler errorHandler;

    public FirebaseTokenFilter(FirebaseTokenVerifier verifier, UserService userService,
                               SecurityErrorHandler errorHandler) {
        this.verifier = verifier;
        this.userService = userService;
        this.errorHandler = errorHandler;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith(BEARER)) {
            chain.doFilter(request, response);
            return;
        }

        VerifiedToken token;
        try {
            token = verifier.verify(header.substring(BEARER.length()).trim());
        } catch (InvalidTokenException e) {
            errorHandler.writeUnauthorized(request, response, "Your session has expired, please sign in again");
            return;
        }

        User user = userService.syncFromToken(token);
        AuthUser principal = new AuthUser(user.getId(), user.getFirebaseUid(), user.getEmail(),
                user.getDisplayName(), user.getRole());
        var authentication = new UsernamePasswordAuthenticationToken(principal, null,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        chain.doFilter(request, response);
    }
}
