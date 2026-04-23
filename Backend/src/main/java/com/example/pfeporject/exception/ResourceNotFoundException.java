package com.example.pfeporject.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    // Optional: You can add more constructors if needed
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}