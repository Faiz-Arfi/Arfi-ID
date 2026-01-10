package dev.faizarfi.auth.service;

import dev.faizarfi.auth.dto.AuthResponse;
import dev.faizarfi.auth.dto.LoginRequest;
import dev.faizarfi.auth.dto.RegisterRequest;
import dev.faizarfi.auth.entity.Client;
import dev.faizarfi.auth.entity.RefreshToken;
import dev.faizarfi.auth.entity.User;
import dev.faizarfi.auth.entity.UserRole;
import dev.faizarfi.auth.repository.ClientRepository;
import dev.faizarfi.auth.repository.RefreshTokenRepository;
import dev.faizarfi.auth.repository.UserRepository;
import dev.faizarfi.auth.repository.UserRoleRepository;
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
    private final UserRoleRepository userRoleRepository;

    @Value("${jwt.refresh-expiration:604800000}")
    private Long refreshTokenValidity;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager, ClientRepository clientRepository, RefreshTokenRepository refreshTokenRepository, UserRoleRepository userRoleRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.clientRepository = clientRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRoleRepository = userRoleRepository;
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
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Fetch Role for this user and client
        String actualRole = userRoleRepository.findByUserAndClient(user, client)
                .map(UserRole::getRole)
                .orElse("ROLE_GUEST"); // if no role found, default to guest

        String accessToken = jwtService.generateAccessToken(request.getEmail(), request.getClientId(), actualRole);
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

        // Resolve Client (Default to "arfi-web-local" if not provided)
        Client client = clientRepository.findByClientId("arfi-web-local")
                .orElseThrow(() -> new RuntimeException("Default client not found"));

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User user = User.builder()
                .email(request.getEmail())
                .password(hashedPassword)
                .role("ROLE_USER") // Global System Role
                .isEnabled(true)
                .build();

        userRepository.save(user);

        // Assign context role
        UserRole projectRole = UserRole.builder()
                .user(user)
                .client(client)
                .role("ROLE_USER")
                .build();

        userRoleRepository.save(projectRole);
    }

    public AuthResponse refreshToken(String refreshToken) {

        // Extract email from token
        String email =  jwtService.extractUsername(refreshToken);

        // Check db if this token is valid and not revoked
        RefreshToken tokenEntity = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Token not found"));

        if (tokenEntity.isRevoked()) {
            throw new RuntimeException("Token has been revoked");
        }

        if(tokenEntity.getExpiryDate().isBefore(Instant.now())) {
            throw new RuntimeException("Token has expired");
        }

        // Generate new access token
        User user = tokenEntity.getUser();
        Client client = tokenEntity.getClient();
        String actualRole = userRoleRepository.findByUserAndClient(user, client)
                .map(UserRole::getRole)
                .orElse("ROLE_GUEST"); // if no role found, default to guest
        String newAccessToken = jwtService.generateAccessToken(user.getEmail(), client.getClientId(), actualRole);

        return new AuthResponse(newAccessToken, refreshToken);
    }

    public void logout(String refreshToken) {
        var tokenEntity = refreshTokenRepository.findByToken(refreshToken)
                .orElse(null);

        if(tokenEntity != null) {
            tokenEntity.setRevoked(true);
            refreshTokenRepository.save(tokenEntity);
        }
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
