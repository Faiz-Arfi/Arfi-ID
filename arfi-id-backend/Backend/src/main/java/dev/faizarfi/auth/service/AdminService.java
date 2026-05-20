package dev.faizarfi.auth.service;

import dev.faizarfi.auth.dto.ClientRegistrationResponse;
import dev.faizarfi.auth.dto.NewClientRequest;
import dev.faizarfi.auth.entity.Client;
import dev.faizarfi.auth.repository.ClientRepository;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
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

    // Generate client secret as a valid JWT Secret Key
    private String generateClientSecret() {
        SecretKey key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        return Base64.getEncoder().withoutPadding().encodeToString(key.getEncoded());
    }
}
