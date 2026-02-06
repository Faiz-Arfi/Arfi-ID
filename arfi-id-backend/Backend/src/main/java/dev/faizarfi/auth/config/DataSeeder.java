package dev.faizarfi.auth.config;

import dev.faizarfi.auth.entity.Client;
import dev.faizarfi.auth.entity.User;
import dev.faizarfi.auth.entity.UserRole;
import dev.faizarfi.auth.repository.ClientRepository;
import dev.faizarfi.auth.repository.UserRepository;
import dev.faizarfi.auth.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;

    @Value("${jwt.secret}")
    private String clientSecret;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Value("${admin.email}")
    private String adminUsername;

    @Value("${admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        // if a default client doesn't exist, create one
        if (clientRepository.findByClientId("arfi-web-local").isEmpty()) {
            Client client = Client.builder()
                    .clientId("arfi-id")
                    .clientSecret(passwordEncoder.encode(clientSecret))
                    .clientName("Arfi Id")
                    .clientDescription("Secure Authentication Service various applications")
                    .redirectUri(frontendUrl)
                    .isActive(true)
                    .build();
            clientRepository.save(client);
            log.info("SEED DATA : Default client created 'arfi-id' with redirect URI {}", frontendUrl);
        }

        if(userRepository.findByEmail(adminUsername).isEmpty()) {
            User admin = User.builder()
                    .email(adminUsername)
                    .password(passwordEncoder.encode(adminPassword))
                    .role("ROLE_ADMIN")
                    .isEnabled(true)
                    .build();
            userRepository.save(admin);
            // Assign context role
            Client client = clientRepository.findByClientId("arfi-id").orElseThrow(() -> new RuntimeException("Default client not found"));
            UserRole projectRole = UserRole.builder()
                    .user(admin)
                    .client(client)
                    .role("ROLE_ADMIN")
                    .build();
            userRoleRepository.save(projectRole);
            log.info("SEED DATA : Admin user created");
        }

    }
}
