package dev.faizarfi.auth.service;

import dev.faizarfi.auth.dto.SessionDto;
import dev.faizarfi.auth.entity.RefreshToken;
import dev.faizarfi.auth.entity.User;
import dev.faizarfi.auth.repository.RefreshTokenRepository;
import dev.faizarfi.auth.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@Log4j2
public class SessionService {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public SessionService(JwtService jwtService, UserRepository userRepository, RefreshTokenRepository refreshTokenRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public ResponseEntity<List<SessionDto>> getMySessions(HttpServletRequest request, String clientId) {

        String token = getTokenFromCookie(request, true);
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email).orElse(null);

        if(user == null) {
            log.error("User not found for email: {}", email);
            throw new RuntimeException("User not found");
        }

        List<RefreshToken> sessions;
        if(clientId != null) {
            sessions = refreshTokenRepository.findAllByUserAndClientId(user, clientId);
        }
        else sessions = refreshTokenRepository.findAllByUser(user);

        List<SessionDto> dtos = sessions.stream()
                .filter(t -> !t.isRevoked()) // Only show active
                .map(t -> SessionDto.builder()
                        .id(t.getId())
                        .clientName(t.getClient().getClientName())
                        .deviceInfo(parseUserAgent(t.getDeviceInfo()))
                        .ipAddress(t.getIpAddress())
                        .lastActive(t.getExpiryDate().minusMillis(604800000)) // Approx creation time
                        .isCurrentSession(t.getToken().equals(getTokenFromCookie(request, false))) // Highlight current
                        .build())
                .toList();

        return ResponseEntity.ok(dtos);
    }

    public ResponseEntity<Void> revokeSession(UUID sessionId, HttpServletRequest request) {

        String token = getTokenFromCookie(request, true);

        String email = jwtService.extractUsername(token);
        RefreshToken session = refreshTokenRepository.findById(sessionId).orElseThrow(() -> new RuntimeException("Session not found"));

        // Security check for ownership
        if(!session.getUser().getEmail().equals(email)) {
            return ResponseEntity.status(403).build();
        }

        // Revoke session
        session.setRevoked(true);
        refreshTokenRepository.save(session);

        return ResponseEntity.noContent().build();
    }

    private String getTokenFromCookie(HttpServletRequest request, boolean isAccessTokenRequired) {
        String cookieName = isAccessTokenRequired ? "accessToken" : "refreshToken";
        return Arrays.stream(request.getCookies())
                .filter(cookie -> cookie.getName().equals(cookieName))
                .findFirst()
                .map(Cookie::getValue)
                .orElseThrow(() -> new RuntimeException("Access Token not found"));
    }

    private String parseUserAgent(String ua) {
        if (ua == null) return "Unknown Device";

        String browser = "Unknown Browser";
        String os = "Unknown OS";

        // Simple parsing logic (You can use a library like 'uap-java' for perfection)
        if (ua.contains("Edg/")) browser = "Edge";
        else if (ua.contains("Chrome/")) browser = "Chrome";
        else if (ua.contains("Firefox/")) browser = "Firefox";
        else if (ua.contains("Safari/")) browser = "Safari";

        if (ua.contains("Windows")) os = "Windows";
        else if (ua.contains("Mac OS")) os = "macOS";
        else if (ua.contains("Android")) os = "Android";
        else if (ua.contains("iPhone")) os = "iOS";
        else if (ua.contains("Linux")) os = "Linux";

        return browser + " on " + os;
    }
}
