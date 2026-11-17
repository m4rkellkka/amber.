package com.amber.exception;

/** The chosen package has no open slots this month; mapped to HTTP 409 Conflict. */
public class NoSlotsAvailableException extends RuntimeException {

    public NoSlotsAvailableException(String packageName) {
        super(packageName + " is fully booked for this month");
    }
}
