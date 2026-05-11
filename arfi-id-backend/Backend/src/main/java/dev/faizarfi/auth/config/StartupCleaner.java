package dev.faizarfi.auth.config;

import dev.faizarfi.auth.service.TokenCleanupService;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class StartupCleaner implements ApplicationRunner {
    private final TokenCleanupService tokenCleanupService;

    public StartupCleaner(TokenCleanupService tokenCleanupService) {
        this.tokenCleanupService = tokenCleanupService;
    }

    @Override
    public void run(@NonNull ApplicationArguments args) throws Exception {
        tokenCleanupService.cleanupExpiredTokens();
    }
}
