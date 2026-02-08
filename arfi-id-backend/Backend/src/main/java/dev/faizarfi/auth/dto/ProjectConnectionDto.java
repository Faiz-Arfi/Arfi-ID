package dev.faizarfi.auth.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ProjectConnectionDto {
    private String clientId;
    private String clientName;
    private String clientDescription;
    private String redirectUri;
    private String role;
    private boolean isConnected;
    private boolean isRevoked;
    private Instant connectedOn;
    private Instant revokedAt;
    private Instant lastUsedAt; // Derived from the latest RefreshToken
}
