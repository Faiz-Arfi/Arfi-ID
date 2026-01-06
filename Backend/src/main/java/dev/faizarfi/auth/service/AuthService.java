package dev.faizarfi.auth.service;

import dev.faizarfi.auth.dto.AuthResponse;
import dev.faizarfi.auth.dto.LoginRequest;
import dev.faizarfi.auth.dto.RegisterRequest;
import dev.faizarfi.auth.entity.Client;
import dev.faizarfi.auth.entity.User;
import dev.faizarfi.auth.repository.ClientRepository;
import dev.faizarfi.auth.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final ClientRepository clientRepository;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager, ClientRepository clientRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.clientRepository = clientRepository;
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
        String accessToken = jwtService.generateAccessToken(request.getEmail());
        String refreshToken = jwtService.generateRefreshToken(request.getEmail(), request.getClientId());

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
}
