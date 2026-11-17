package com.amber.security;

/** The Authorization header held a token that Firebase did not accept. */
public class InvalidTokenException extends RuntimeException {

    public InvalidTokenException(String message, Throwable cause) {
        super(message, cause);
    }
}
