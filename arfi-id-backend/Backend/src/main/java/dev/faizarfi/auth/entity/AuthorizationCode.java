package dev.faizarfi.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "authorization_codes", indexes = {
    @Index(name = "idx_auth_code", columnList = "code"), // For fast lookup by code
        @Index(name = "idx_auth_code_expiry", columnList = "expiryDate") // For cleanup jobs
})
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthorizationCode {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 255)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String redirectUri;

    // CSRF protection token from the client, return along with the code
    @Column(length = 500)
    private String state;

    @Column(nullable = false)
    private Instant expiryDate;

    @Column(nullable = false)
    @Builder.Default
    private boolean used = false;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant usedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }
}
