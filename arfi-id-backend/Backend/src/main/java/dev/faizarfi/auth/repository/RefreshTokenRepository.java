package dev.faizarfi.auth.repository;

import dev.faizarfi.auth.entity.RefreshToken;
import dev.faizarfi.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByToken(String token);

    List<RefreshToken> findAllByUser(User user);

    @Query("SELECT r FROM RefreshToken r WHERE r.user = :user AND r.client.clientId = :clientId")
    List<RefreshToken> findAllByUserAndClientId(User user, String clientId);

    List<RefreshToken> findAllByUserAndRevokedFalseAndExpiryDateAfter(User user, Instant now);

    List<RefreshToken> findAllByUserAndClient_ClientIdAndRevokedFalseAndExpiryDateAfter(
            User user,
            String clientId,
            Instant now
    );
}
