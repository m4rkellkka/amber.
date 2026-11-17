package com.amber.exception;

/** The order breaks a business rule (e.g. two packages); mapped to HTTP 400. */
public class InvalidOrderException extends RuntimeException {

    public InvalidOrderException(String message) {
        super(message);
    }
}
