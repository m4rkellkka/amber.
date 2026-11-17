package com.amber.security;

import com.amber.entity.Role;

/** The logged-in user, stored in Spring's SecurityContext for the current request. */
public record AuthUser(Long id, String firebaseUid, String email, String displayName, Role role) {
}
