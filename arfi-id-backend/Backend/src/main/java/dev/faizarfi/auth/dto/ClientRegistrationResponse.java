package dev.faizarfi.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ClientRegistrationResponse {
    private String clientId;
    private String clientSecret;
    private String clientName;
    private String clientDescription;
    private String redirectUri;
}
