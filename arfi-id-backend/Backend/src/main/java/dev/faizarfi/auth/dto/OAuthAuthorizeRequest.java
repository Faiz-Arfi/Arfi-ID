package dev.faizarfi.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OAuthAuthorizeRequest {

    @NotBlank(message = "Client ID is required")
    private String clientId;

    @NotBlank(message = "Redirect URI is required")
    private String redirectUri;

    private String state;
}
