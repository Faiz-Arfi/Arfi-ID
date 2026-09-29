package dev.faizarfi.auth.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidAuthorizationRequestException extends RuntimeException {
    public InvalidAuthorizationRequestException(String message) {
        super(message);
    }
}
