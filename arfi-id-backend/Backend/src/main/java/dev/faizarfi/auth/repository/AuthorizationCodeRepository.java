package dev.faizarfi.auth.repository;

import dev.faizarfi.auth.entity.AuthorizationCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface AuthorizationCodeRepository extends JpaRepository<AuthorizationCode, UUID> {

    Optional<AuthorizationCode> findByCode(String code);

    void deleteByExpiryDateBeforeOrUsedTrue(Instant now);

    boolean existsByCodeAndUsedFalseAndExpiryDateAfter(String code, Instant now);
}
