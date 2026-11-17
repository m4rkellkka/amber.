package com.amber.exception;

/** The request clashes with existing data (e.g. a slug already in use); mapped to HTTP 409. */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
