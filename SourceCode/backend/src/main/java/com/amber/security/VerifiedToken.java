package com.amber.security;

/** The parts of a Firebase ID token the app needs. */
public record VerifiedToken(String uid, String email, String name, boolean emailVerified) {
}
