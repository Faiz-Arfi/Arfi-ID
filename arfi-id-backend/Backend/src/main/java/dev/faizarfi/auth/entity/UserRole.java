package dev.faizarfi.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_roles", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "client_id"}) // One role per user per client (for now)
}, indexes = {
        @Index(name = "idx_user_roles_user_client",
        columnList = "user_id, client_id"
        )
})
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserRole {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(nullable = false)
    private String role; // ex "ROLE_ADMIN", "ROLE_EDITOR"

    @Builder.Default
    @Column(nullable = false)
    private boolean isRevoked = false;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    private Instant revokedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }
}
