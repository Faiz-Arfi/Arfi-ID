package dev.faizarfi.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OAuthTokenRequest {

    // must be "authorization_code" for authorization code flow
    @NotBlank(message = "Grant type is required")
    @JsonProperty("grant_type")
    private String grantType;

    @NotBlank(message = "Authorization code is required")
    private String code;

    @NotBlank(message = "Redirect URI is required")
    @JsonProperty("redirect_uri")
    private String redirectUri;

    @NotBlank(message = "Client ID is required")
    @JsonProperty("client_id")
    private String clientId;

    @NotBlank(message = "Client secret is required")
    @JsonProperty("client_secret")
    private String clientSecret;
}
