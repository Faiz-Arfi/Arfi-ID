package dev.faizarfi.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public record OAuthLogoutRequest(

        @NotBlank(message = "client id is required")
        @JsonProperty("client_id")
        String clientId,
        @NotBlank(message = "client secret is required")
        @JsonProperty("client_secret")
        String clientSecret,
        @NotBlank(message = "refresh token is required")
        @JsonProperty("refresh_token")
        String refreshToken
) {
}
