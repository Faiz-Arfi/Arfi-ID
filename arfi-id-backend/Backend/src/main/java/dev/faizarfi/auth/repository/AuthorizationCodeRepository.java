package dev.faizarfi.auth.repository;

import dev.faizarfi.auth.entity.AuthorizationCode;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface AuthorizationCodeRepository extends JpaRepository<AuthorizationCode, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<AuthorizationCode> findByCode(String code);

    void deleteByExpiryDateBeforeOrUsedTrue(Instant now);

    boolean existsByCodeAndUsedFalseAndExpiryDateAfter(String code, Instant now);
}
