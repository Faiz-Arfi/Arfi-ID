package dev.faizarfi.auth.config;

import dev.faizarfi.auth.entity.Client;
import dev.faizarfi.auth.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final ClientRepository clientRepository;

    @Override
    public void run(String... args) throws Exception {
        // if default client doesn't exist, create one
        if (clientRepository.findByClientId("arfi-web-local").isEmpty()) {
            Client client = Client.builder()
                    .clientId("arfi-web-local")
                    .clientName("Arfi Local Development")
                    .isActive(true)
                    .build();
            clientRepository.save(client);
            System.out.println("SEED DATA : Default client created 'arfi-web-local'");
        }

    }
}
