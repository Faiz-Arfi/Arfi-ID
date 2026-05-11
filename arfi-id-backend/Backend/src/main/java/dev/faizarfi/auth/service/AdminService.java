package dev.faizarfi.auth.service;

import dev.faizarfi.auth.dto.ClientRegistrationResponse;
import dev.faizarfi.auth.dto.NewClientRequest;
import dev.faizarfi.auth.entity.Client;
import dev.faizarfi.auth.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;

    public ClientRegistrationResponse addNewProject(NewClientRequest request) {
        // generate client id with client name
        String clientId = request.getClientName().toLowerCase().replaceAll("\\s+", "-") + "-" + System.currentTimeMillis();
        // generate client secret jwt
        String clientSecret = generateClientSecret();
        String encodedSecret = passwordEncoder.encode(clientSecret);
        Client client = Client.builder()
                .clientId(clientId)
                .clientSecret(encodedSecret)
                .clientName(request.getClientName())
                .redirectUri(request.getRedirectUri())
                .clientDescription(request.getClientDescription())
                .isActive(true)
                .build();

        clientRepository.save(client);

        return ClientRegistrationResponse.builder()
                .clientId(clientId)
                .clientSecret(clientSecret)
                .redirectUri(request.getRedirectUri())
                .clientDescription(request.getClientDescription())
                .clientName(request.getClientName())
                .build();
    }

    private String generateClientSecret() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);

        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
