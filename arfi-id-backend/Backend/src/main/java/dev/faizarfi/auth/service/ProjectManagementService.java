package dev.faizarfi.auth.service;

import dev.faizarfi.auth.dto.ProjectConnectionDto;
import dev.faizarfi.auth.entity.Client;
import dev.faizarfi.auth.entity.RefreshToken;
import dev.faizarfi.auth.entity.User;
import dev.faizarfi.auth.entity.UserRole;
import dev.faizarfi.auth.repository.ClientRepository;
import dev.faizarfi.auth.repository.RefreshTokenRepository;
import dev.faizarfi.auth.repository.UserRepository;
import dev.faizarfi.auth.repository.UserRoleRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectManagementService {
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final ClientRepository clientRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public @Nullable List<ProjectConnectionDto> getUserProjectOverview(HttpServletRequest request) {
        User user = getAuthenticatedUser(request);
        List<Client> allClients = clientRepository.findAll();

        return allClients.stream().map(client -> {
            var userRoleOpt = userRoleRepository.findByUser_IdAndClient_ClientId(user.getId(), client.getClientId());
            // Get the last time the user actually used the project
            Instant lastUsed = refreshTokenRepository.findAllByUserAndClient_ClientIdAndRevokedFalseAndExpiryDateAfter(user, client.getClientId(), Instant.now())
                    .stream()
                    .map(RefreshToken::getExpiryDate)
                    .max(Comparator.naturalOrder())
                    .orElse(null);

            return ProjectConnectionDto.builder()
                    .clientId(client.getClientId())
                    .clientName(client.getClientName())
                    .clientDescription(client.getClientDescription())
                    .isConnected(userRoleOpt.isPresent())
                    .isRevoked(userRoleOpt.map(UserRole::isRevoked).orElse(false))
                    .role(userRoleOpt.map(UserRole::getRole).orElse(null))
                    .connectedOn(userRoleOpt.map(UserRole::getCreatedAt).orElse(null))
                    .revokedAt(userRoleOpt.map(UserRole::getRevokedAt).orElse(null))
                    .lastUsedAt(lastUsed)
                    .build();
        }).toList();
    }

    @Transactional
    public void revokeProjectAccess(String clientId, HttpServletRequest request) {
        User user = getAuthenticatedUser(request);
        UserRole role = userRoleRepository.findByUser_IdAndClient_ClientId(user.getId(), clientId)
                .orElseThrow(() -> new RuntimeException("Project connection not found"));
        role.setRevoked(true);
        role.setRevokedAt(Instant.now());

        // Kill all active refresh tokens for this user and client
        refreshTokenRepository.deleteByUser_IdAndClient_ClientId(user.getId(), clientId);
        userRoleRepository.save(role);
    }

    @Transactional
    public void restoreProjectAccess(String clientId, HttpServletRequest request) {
        User user = getAuthenticatedUser(request);
        UserRole role = userRoleRepository.findByUser_IdAndClient_ClientId(user.getId(), clientId)
                .orElseThrow(() -> new RuntimeException("Project connection not found"));
        role.setRevoked(false);
        role.setRevokedAt(null);
        userRoleRepository.save(role);
    }

    public ResponseEntity<String> connectProject(String clientId, HttpServletRequest request) {
        User user = getAuthenticatedUser(request);
        Client client = clientRepository.findById(clientId).orElseThrow(() -> new RuntimeException("Client not found"));

        // Check if the user already has a role for this client
        var existingRoleOpt = userRoleRepository.findByUser_IdAndClient_ClientId(user.getId(), clientId);
        if (existingRoleOpt.isPresent()) {
            UserRole existingRole = existingRoleOpt.get();
            if (existingRole.isRevoked()) {
                return ResponseEntity.badRequest().body("Access to this project is revoked. Please restore access first.");
            } else {
                return ResponseEntity.badRequest().body("Already connected to this project.");
            }
        }

        UserRole newRole = UserRole.builder()
                .user(user)
                .client(client)
                .role("USER") // Default role, can be enhanced to support different roles
                .isRevoked(false)
                .build();

        userRoleRepository.save(newRole);
        return ResponseEntity.ok("Successfully connected to the project.");
    }

    private User getAuthenticatedUser(HttpServletRequest request) {
        String email = jwtService.extractUsername(getAccessTokenFromCookie(request));
        return userRepository.findByEmail(email).orElseThrow();
    }

    private String getAccessTokenFromCookie(HttpServletRequest request) {
        String cookieName = "accessToken";
        return Arrays.stream(request.getCookies())
                .filter(cookie -> cookie.getName().equals(cookieName))
                .findFirst()
                .map(Cookie::getValue)
                .orElseThrow(() -> new RuntimeException("Access Token not found"));
    }
}
