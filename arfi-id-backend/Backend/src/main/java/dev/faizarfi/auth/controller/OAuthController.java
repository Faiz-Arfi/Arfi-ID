package dev.faizarfi.auth.controller;

import dev.faizarfi.auth.dto.*;
import dev.faizarfi.auth.service.OAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/oauth")
@RequiredArgsConstructor
@Slf4j
public class OAuthController {

    private final OAuthService oAuthService;

    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<ClientPublicInfoDto>> validateToken(
            @RequestParam String clientId,
            @RequestParam String redirectUri
    ) {
        log.info("Validating token for client {} and redirect URI {}", clientId, redirectUri);

        ClientPublicInfoDto clientInfo = oAuthService.validateClient(clientId, redirectUri);
        ApiResponse<ClientPublicInfoDto> response = ApiResponse.success(clientInfo, "Client validation successful", "/auth/oauth/validate", HttpStatus.OK.value());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/authorize")
    public ResponseEntity<ApiResponse<OAuthAuthorizeResponse>> authorize(
            @RequestBody @Valid OAuthAuthorizeRequest request,
            HttpServletRequest httpRequest
    ) {
        log.info("Received authorization request for client {}", request.getClientId());

        OAuthAuthorizeResponse data = oAuthService.authorize(request, httpRequest);
        ApiResponse<OAuthAuthorizeResponse> response = ApiResponse.success(data, "Authorization successful", httpRequest.getRequestURI(), HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }

    // server to server token exchange endpoint (includes client secret)
    @PostMapping("/token")
    public ResponseEntity<ApiResponse<OAuthTokenResponse>> exchangeToken(
            @RequestBody @Valid OAuthTokenRequest request,
            HttpServletRequest httpRequest
    ) {
        log.info("Received token exchange request for client {}", request.getClientId());

        OAuthTokenResponse data = oAuthService.exchangeCodeForToken(request, httpRequest);
        return ResponseEntity.ok(ApiResponse.success(data, "Token exchange successful", httpRequest.getRequestURI(), HttpStatus.OK.value()));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Object>> logoutClientSession(
            @RequestBody @Valid OAuthLogoutRequest request
    ) {
        log.info("Received logout request for client {}", request.clientId());

        oAuthService.logoutClientSession(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Logout successful", "/auth/oauth/logout", HttpStatus.OK.value()));
    }
}
