package dev.faizarfi.auth.config;

import dev.faizarfi.auth.entity.Client;
import dev.faizarfi.auth.entity.RefreshToken;
import dev.faizarfi.auth.entity.User;
import dev.faizarfi.auth.entity.UserRole;
import dev.faizarfi.auth.repository.ClientRepository;
import dev.faizarfi.auth.repository.RefreshTokenRepository;
import dev.faizarfi.auth.repository.UserRepository;
import dev.faizarfi.auth.repository.UserRoleRepository;
import dev.faizarfi.auth.service.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final UserRoleRepository userRoleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;

    @Value("${jwt.refresh-expiration:604800000}")
    private Long refreshTokenValidity;

    @Value("${jwt.access-expiration:3600000}")
    private Integer accessTokenValidity;

    @Value("${frontend.url: http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // Find or create user in database
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    // Create new user if not exist
                    User newUser = User.builder()
                            .email(email)
                            .password("") // No password for OAuth user
                            .isEnabled(true)
                            .role("ROLE_USER")
                            .build();
                    return userRepository.save(newUser);
                });

        // Resolve Client
        Client client = clientRepository.findByClientId("arfi-web-local")
                .orElseThrow(() -> new RuntimeException("Default client not found"));

        // Ensure UserRole exists
        if(userRoleRepository.findByUserAndClient(user, client).isEmpty()) {
            UserRole userRole = UserRole.builder()
                    .user(user)
                    .client(client)
                    .role("ROLE_USER")
                    .build();
            userRoleRepository.save(userRole);
        }

        String role = userRoleRepository.findByUserAndClient(user, client).get().getRole();

        // Generate JWT Token
        String accessToken = jwtService.generateAccessToken(user.getEmail(), client.getClientId(), role);
        String refreshToken = jwtService.generateRefreshToken(user.getEmail(), client.getClientId());

        // Save refresh Token in db
        RefreshToken tokenEntity = RefreshToken.builder()
                .token(refreshToken)
                .user(user)
                .client(client)
                .revoked(false)
                .expiryDate(Instant.now().plusMillis(refreshTokenValidity))
                .ipAddress(request.getRemoteAddr())
                .deviceInfo(request.getHeader("User-Agent"))
                .build();
        refreshTokenRepository.save(tokenEntity);

        // Set Cookies
        ResponseCookie accessCookie = ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(accessTokenValidity / 1000)
                .sameSite("Lax") // Must be Lax for OAuth
                .build();
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(refreshTokenValidity / 1000)
                .sameSite("Lax")
                .build();

        response.addHeader("Set-Cookie", accessCookie.toString());
        response.addHeader("Set-Cookie", refreshCookie.toString());

        // Redirect to Frontend
        response.sendRedirect(frontendUrl);
    }
}
