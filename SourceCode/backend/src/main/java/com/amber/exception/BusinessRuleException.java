package com.amber.exception;

/** A request breaks a business rule (e.g. an order with two packages); mapped to HTTP 400. */
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}
