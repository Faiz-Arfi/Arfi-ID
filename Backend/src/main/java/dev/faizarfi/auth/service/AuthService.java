package dev.faizarfi.auth.service;

import dev.faizarfi.auth.dto.AuthResponse;
import dev.faizarfi.auth.dto.LoginRequest;
import dev.faizarfi.auth.dto.RegisterRequest;
import dev.faizarfi.auth.entity.Client;
import dev.faizarfi.auth.entity.RefreshToken;
import dev.faizarfi.auth.entity.User;
import dev.faizarfi.auth.repository.ClientRepository;
import dev.faizarfi.auth.repository.RefreshTokenRepository;
import dev.faizarfi.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final ClientRepository clientRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-expiration:604800000}")
    private Long refreshTokenValidity;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager, ClientRepository clientRepository, RefreshTokenRepository refreshTokenRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.clientRepository = clientRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public AuthResponse login (LoginRequest request) {
        // validate client ID
        Client client = clientRepository.findByClientId(request.getClientId())
                .orElseThrow(() -> new RuntimeException("Invalid Client ID"));

        if(!client.isActive()) {
            throw new RuntimeException("Client is disabled");
        }

        // authenticate user
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // generate tokens
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();

        String accessToken = jwtService.generateAccessToken(request.getEmail());
        String refreshToken = jwtService.generateRefreshToken(request.getEmail(), request.getClientId());

        // Save refresh token to database
        saveUserToken(user, client, refreshToken);

        // return cookies in response
        return new AuthResponse(accessToken, refreshToken);
    }

    public void register(RegisterRequest request) {
        if(userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User user = User.builder()
                .email(request.getEmail())
                .password(hashedPassword)
                .role("ROLE_USER")
                .isEnabled(true)
                .build();

        userRepository.save(user);
    }

    private void saveUserToken(User user, Client client, String token) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(token)
                .client(client)
                .revoked(false)
                .expiryDate(Instant.now().plusMillis(refreshTokenValidity))
                .build();
        refreshTokenRepository.save(refreshToken);
    }
}
