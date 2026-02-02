package dev.faizarfi.auth.service;

import dev.faizarfi.auth.repository.RefreshTokenRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@Slf4j
public class TokenCleanupService {

    private final RefreshTokenRepository refreshTokenRepository;

    public TokenCleanupService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Scheduled(cron = "0 0 0 * * * ") // Runs daily at midnight
    public void cleanupExpiredTokens() {
        log.info("Starting cleanup of expired tokens...");
        refreshTokenRepository.deleteExpiredTokens(Instant.now());
        log.info("Cleanup of expired tokens completed.");
    }
}
