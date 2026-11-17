package com.amber.service;

import com.amber.entity.Role;
import com.amber.entity.User;
import com.amber.repository.UserRepository;
import com.amber.security.VerifiedToken;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/** Keeps the "users" table in sync with Firebase accounts and decides who is admin. */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final Set<String> adminEmails;

    public UserService(UserRepository userRepository,
                       @Value("${app.admin-emails:}") String adminEmails) {
        this.userRepository = userRepository;
        this.adminEmails = Arrays.stream(adminEmails.split(","))
                .map(e -> e.trim().toLowerCase(Locale.ROOT))
                .filter(e -> !e.isEmpty())
                .collect(Collectors.toUnmodifiableSet());
    }

    /**
     * Finds the user for a verified token, creating the row on first sign-in.
     * Two parallel first requests may both try to insert; the unique firebase_uid
     * constraint stops the second one, and we then read the row the first one saved.
     */
    public User syncFromToken(VerifiedToken token) {
        try {
            return upsert(token);
        } catch (DataIntegrityViolationException e) {
            return upsert(token);
        }
    }

    private User upsert(VerifiedToken token) {
        String email = token.email() == null ? "" : token.email();
        User user = userRepository.findByFirebaseUid(token.uid()).orElseGet(() -> {
            User created = new User();
            created.setFirebaseUid(token.uid());
            return created;
        });

        boolean changed = user.getId() == null;
        if (!email.equals(user.getEmail())) {
            user.setEmail(email);
            changed = true;
        }
        if (token.name() != null && !Objects.equals(token.name(), user.getDisplayName())) {
            user.setDisplayName(token.name());
            changed = true;
        }
        if (user.getRole() != Role.ADMIN && isAdmin(email, token.emailVerified())) {
            user.setRole(Role.ADMIN);
            changed = true;
        }
        return changed ? userRepository.saveAndFlush(user) : user;
    }

    /**
     * Admin = email is in ADMIN_EMAILS AND Firebase has verified that the person owns it.
     * Without the verified check anyone could register with the admin's address and a password.
     */
    private boolean isAdmin(String email, boolean emailVerified) {
        return emailVerified && adminEmails.contains(email.toLowerCase(Locale.ROOT));
    }
}
