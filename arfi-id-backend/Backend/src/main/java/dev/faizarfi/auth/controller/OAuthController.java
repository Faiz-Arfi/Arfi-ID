package dev.faizarfi.auth.controller;

import dev.faizarfi.auth.dto.*;
import dev.faizarfi.auth.service.OAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/oauth")
@RequiredArgsConstructor
@Slf4j
public class OAuthController {

    private final OAuthService oAuthService;

    @GetMapping("/validate")
    public ResponseEntity<ClientPublicInfoDto> validateToken(
            @RequestParam String clientId,
            @RequestParam String redirectUri
    ) {
        log.info("Validating token for client {} and redirect URI {}", clientId, redirectUri);

        ClientPublicInfoDto clientInfo = oAuthService.validateClient(clientId, redirectUri);

        return ResponseEntity.ok(clientInfo);
    }

    @PostMapping("/authorize")
    public ResponseEntity<OAuthAuthorizeResponse> authorize(
            @RequestBody @Valid OAuthAuthorizeRequest request,
            HttpServletRequest httpRequest
    ) {
        log.info("Received authorization request for client {}", request.getClientId());

        OAuthAuthorizeResponse response = oAuthService.authorize(request, httpRequest);
        return ResponseEntity.ok(response);
    }

    // server to server token exchange endpoint (includes client secret)
    @PostMapping("/token")
    public ResponseEntity<OAuthTokenResponse> exchangeToken(
            @RequestBody @Valid OAuthTokenRequest request,
            HttpServletRequest httpRequest
    ) {
        log.info("Received token exchange request for client {}", request.getClientId());

        OAuthTokenResponse response = oAuthService.exchangeCodeForToken(request, httpRequest);
        return ResponseEntity.ok(response);
    }
}
