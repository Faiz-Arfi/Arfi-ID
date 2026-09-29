package dev.faizarfi.auth.service;

import dev.faizarfi.auth.dto.*;
import dev.faizarfi.auth.entity.*;
import dev.faizarfi.auth.exception.AccountDisabledException;
import dev.faizarfi.auth.exception.InvalidAuthorizationRequestException;
import dev.faizarfi.auth.exception.InvalidClientException;
import dev.faizarfi.auth.repository.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class OAuthService {

    private static final long AUTH_CODE_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes
    private final ChildProjectJwtService childProjectJwtService;

    @Value("${jwt.refresh-expiration:604800000}")
    private Long refreshTokenValidity;
    @Value("${jwt.access-expiration:300000}")
    private int accessExpiration;

    private final ClientRepository clientRepository;
    private final UserRoleRepository userRoleRepository;
    private final AuthorizationCodeRepository authorizationCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public ClientPublicInfoDto validateClient(String clientId, String redirectUri) {
        log.info("Validating client {} and redirect URI {}", clientId, redirectUri);

        // Find client
        Client client = clientRepository.findByClientId(clientId)
                .orElseThrow(() -> new InvalidClientException("Invalid Client ID: " + clientId));

        // Check if client is valid
        if(isValidClient(client, redirectUri)) {
            log.info("Client {} is valid and active", clientId);
        } else {
            log.warn("Client {} is invalid or inactive", clientId);
            throw new InvalidClientException("Client is not valid or inactive: " + clientId);
        }

        log.info("Client {} is valid", clientId);

        return ClientPublicInfoDto.builder()
                .clientId(client.getClientId())
                .clientName(client.getClientName())
                .clientDescription(client.getClientDescription())
                .redirectUri(client.getRedirectUri())
                .isActive(client.isActive())
                .build();
    }

    @Transactional
    public OAuthAuthorizeResponse authorize(@Valid OAuthAuthorizeRequest request, HttpServletRequest httpRequest) {
        log.info("Received authorization request for client {}", request.getClientId());

        User user = getAuthenticatedUser(httpRequest);
        log.info("User {} authorized client {}", user.getEmail(), request.getClientId());

        Client client = clientRepository.findByClientId(request.getClientId())
                .orElseThrow(() -> new InvalidClientException("Invalid Client ID: " + request.getClientId()));

        UserRole userRole = userRoleRepository.findByUserAndClient(user, client)
                .orElseGet(() -> {
                    log.info("First time connection: user={} client={}", user.getEmail(), client.getClientId());
                    UserRole newRole = UserRole.builder()
                            .user(user)
                            .client(client)
                            .role("USER")
                            .isRevoked(false)
                            .build();
                    return userRoleRepository.save(newRole);
                });

        // check if access is revoked
        if(userRole.isRevoked()) {
            log.warn("Access to client {} revoked for user {}", request.getClientId(), user.getEmail());
            throw new RuntimeException("Access to this client has been revoked by the user");
        }

        // generate authorization code
        String code = generateSecureCode();

        AuthorizationCode authCode = AuthorizationCode.builder()
                .code(code)
                .user(user)
                .client(client)
                .redirectUri(request.getRedirectUri())
                .state(request.getState())
                .expiryDate(Instant.now().plusMillis(AUTH_CODE_VALIDITY_MS))
                .used(false)
                .build();

        authorizationCodeRepository.save(authCode);
        log.info("Generated authorization code {} for user {}", code, user.getEmail());


        return OAuthAuthorizeResponse.builder()
                .code(code)
                .state(request.getState())
                .redirectUri(request.getRedirectUri())
                .expiresIn((int) (AUTH_CODE_VALIDITY_MS/1000)) // return expiry in seconds
                .build();
    }

    @Transactional
    public OAuthTokenResponse exchangeCodeForToken(@Valid OAuthTokenRequest request, HttpServletRequest httpRequest) {

        Client client = clientRepository.findByClientId(request.getClientId())
                .orElseThrow(() -> new InvalidClientException("Invalid Client ID: " + request.getClientId()));

        if (!passwordEncoder.matches(request.getClientSecret(), client.getClientSecret())) {
            throw new BadCredentialsException("Invalid Client Secret for client: " + request.getClientId());
        }

        if ("authorization_code".equals(request.getGrantType())) {
            return handleAuthorizationCodeGrant(request, client, httpRequest);
        } else if ("refresh_token".equals(request.getGrantType())) {
            return handleRefreshTokenGrant(request, client);
        } else {
            throw new IllegalArgumentException("Unsupported grant type: " + request.getGrantType());
        }

    }

    @Transactional
    public void logoutClientSession(OAuthLogoutRequest request) {
        Client client = clientRepository.findByClientId(request.clientId())
                .orElseThrow(() -> new InvalidClientException("Invalid Client ID: " + request.clientId()));

        if(!passwordEncoder.matches(request.clientSecret(), client.getClientSecret())) {
            throw new BadCredentialsException("Invalid client secret");
        }

        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.refreshToken())
                .orElse(null);

        if(refreshToken != null) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            log.info("Revoked refresh token {} for client {}", request.refreshToken(), request.clientId());
        }
    }

    private OAuthTokenResponse handleRefreshTokenGrant(OAuthTokenRequest request, Client client) {
        //Fetch and validate refresh token
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (refreshToken.isRevoked() || refreshToken.getExpiryDate().isBefore(Instant.now())) {
            log.warn("Refresh token {} is revoked or expired", request.getRefreshToken());
            throw new RuntimeException("Refresh token is revoked or expired");
        }

        //Validate client binding
        if (!refreshToken.getClient().getClientId().equals(client.getClientId())) {
            log.error("Security alert: Refresh token bound to client ID {} attempted use by client ID {}",
                    refreshToken.getClient().getClientId(), client.getClientId());
            throw new RuntimeException("Refresh token does not belong to the specified client");
        }

        //Fetch and validate user status
        User user = refreshToken.getUser();
        if (!user.isEnabled()) {
            throw new AccountDisabledException("User account is disabled: " + user.getEmail());
        }

        //Validate user's project role permissions
        UserRole role = userRoleRepository.findByUserAndClient(user, client)
                .orElseThrow(() -> new RuntimeException("No access to this project"));

        if (role.isRevoked()) {
            log.warn("Access to client {} revoked for user {}", client.getClientId(), user.getEmail());
            throw new RuntimeException("Access to this client has been revoked by the user");
        }

        // Generate new short-lived access token signed with client secret
        String accessToken = childProjectJwtService.generateAccessToken(
                user.getEmail(),
                client.getClientId(),
                role.getRole(),
                request.getClientSecret()
        );

        return OAuthTokenResponse.builder()
                .tokenType("Bearer")
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .expiresIn(accessExpiration / 1000)
                .user(UserResponseDto.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .role(role.getRole())
                        .build())
                .build();
    }

    private OAuthTokenResponse handleAuthorizationCodeGrant(OAuthTokenRequest request, Client client, HttpServletRequest httpRequest) {
        AuthorizationCode authCode = authorizationCodeRepository.findByCode(request.getCode())
                .orElseThrow(() -> new InvalidAuthorizationRequestException("Invalid authorization code: "));

        if(authCode.isUsed()) {
            log.warn("Authorization code {} has already been used", request.getCode());
            throw new InvalidAuthorizationRequestException("Authorization code has already been used");
        }

        if(authCode.getExpiryDate().isBefore(Instant.now())) {
            log.warn("Authorization code {} has expired", request.getCode());
            throw new InvalidAuthorizationRequestException("Authorization code has expired");
        }

        if(!passwordEncoder.matches(request.getClientSecret(), client.getClientSecret())) {
            log.warn("Invalid client secret for client {}", request.getClientId());
            throw new InvalidAuthorizationRequestException("Invalid client secret");
        }

        if(!authCode.getRedirectUri().equals(request.getRedirectUri())) {
            log.warn("Redirect URI {} does not match registered redirect URI {}", request.getRedirectUri(), authCode.getRedirectUri());
            throw new InvalidAuthorizationRequestException("Invalid redirect URI");
        }

        if(!authCode.getClient().getClientId().equals(request.getClientId())) {
            log.warn("Client ID {} does not match registered client ID {}", request.getClientId(), authCode.getClient().getClientId());
            throw new InvalidAuthorizationRequestException("Client ID mismatch");
        }

        User user = authCode.getUser();
        UserRole userRole = userRoleRepository.findByUserAndClient(user, client)
                .orElseThrow(() -> new InvalidAuthorizationRequestException("No access to this project"));

        if (userRole.isRevoked()) {
            log.warn("Access to client {} revoked for user {}", request.getClientId(), user.getEmail());
            throw new InvalidAuthorizationRequestException("Access to this client has been revoked by the user");
        }

        authCode.setUsed(true);
        authCode.setUsedAt(Instant.now());
        authorizationCodeRepository.save(authCode);

        String accessToken = childProjectJwtService.generateAccessToken(user.getEmail(), client.getClientId(), userRole.getRole(), request.getClientSecret());
        String refreshToken = childProjectJwtService.generateRefreshToken(user.getEmail(), client.getClientId(), request.getClientSecret());

        saveRefreshToken(user, client, refreshToken, httpRequest);
        log.info("Token issued successfully for user={}, client={}", user.getEmail(), client.getClientId());

        return OAuthTokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(accessExpiration/1000)
                .user(UserResponseDto.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .role(userRole.getRole())
                        .build())
                .build();
    }

    private User getAuthenticatedUser(HttpServletRequest request) {
        String token = getAccessTokenFromCookie(request);
        String email = jwtService.extractUsername(token);

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String getAccessTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;

        return Arrays.stream(cookies)
                .filter(cookie -> cookie.getName().equals("accessToken"))
                .findFirst()
                .map(Cookie::getValue)
                .orElseThrow(() -> new RuntimeException("Access Token not found - user is not authenticated"));
    }

    private String generateSecureCode() {
        return "AUTH_" + UUID.randomUUID().toString().replace("-", "");
    }

    private void saveRefreshToken(User user, Client client, String token, HttpServletRequest request) {
        log.debug("Saving refresh token to database: user={}, client={}",
                user.getEmail(), client.getClientId());

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .client(client)
                .token(token)
                .revoked(false)
                .expiryDate(Instant.now().plusMillis(refreshTokenValidity))  // 7 days from now
                .deviceInfo(extractDeviceInfo(request))
                .ipAddress(extractIpAddress(request))
                .build();

        refreshTokenRepository.save(refreshToken);

        log.info("Refresh token saved successfully: user={}, client={}, expiresAt={}",
                user.getEmail(), client.getClientId(), refreshToken.getExpiryDate());
    }

    private String extractDeviceInfo(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");

        if (userAgent == null || userAgent.isEmpty()) {
            log.warn("No User-Agent header found in request");
            return "Unknown Device";
        }

        // Truncate to prevent database overflow (RefreshToken.deviceInfo is likely VARCHAR(255))
        if (userAgent.length() > 250) {
            return userAgent.substring(0, 250) + "...";
        }

        return userAgent;
    }

    private String extractIpAddress(HttpServletRequest request) {

        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // X-Forwarded-For can be a comma-separated list: "client, proxy1, proxy2"
            // First (original client) IP
            String clientIp = xForwardedFor.split(",")[0].trim();
            log.debug("IP extracted from X-Forwarded-For: {}", clientIp);
            return clientIp;
        }

        // Try X-Real-IP (used by some proxies)
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            log.debug("IP extracted from X-Real-IP: {}", xRealIp);
            return xRealIp;
        }

        // Fallback to direct remote address
        String remoteAddr = request.getRemoteAddr();
        if (remoteAddr == null || remoteAddr.isEmpty()) {
            log.warn("No IP address found in request");
            return "Unknown IP";
        }

        log.debug("IP extracted from RemoteAddr: {}", remoteAddr);
        return remoteAddr;
    }

    public boolean isValidClient(Client client, String redirectUri) {

        String clientId = client.getClientId();
        // Check if active
        if(!client.isActive()) {
            log.warn("Client {} is inactive", clientId);
            throw new InvalidClientException("Client is not active: " + clientId);
        }

        // Validate redirect URI
        if(redirectUri != null && !client.getRedirectUri().equals(redirectUri)) {
            log.warn("Redirect URI {} does not match registered redirect URI {}", redirectUri, client.getRedirectUri());
            throw new InvalidClientException("Invalid redirect URI: " + redirectUri);
        }

        return true;
    }

}
