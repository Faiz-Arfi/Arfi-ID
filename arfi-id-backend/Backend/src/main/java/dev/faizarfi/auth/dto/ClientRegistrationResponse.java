package dev.faizarfi.auth.dto;

import dev.faizarfi.auth.entity.Client;
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

    public static ClientRegistrationResponse fromEntity(Client client) {
        if (client == null) {
            return null;
        }
        return ClientRegistrationResponse.builder()
                .clientId(client.getClientId())
                .clientSecret(client.getClientSecret())
                .clientName(client.getClientName())
                .clientDescription(client.getClientDescription())
                .redirectUri(client.getRedirectUri())
                .build();
    }
}
