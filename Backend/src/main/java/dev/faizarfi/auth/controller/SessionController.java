package dev.faizarfi.auth.controller;

import dev.faizarfi.auth.dto.SessionDto;
import dev.faizarfi.auth.entity.User;
import dev.faizarfi.auth.repository.UserRepository;
import dev.faizarfi.auth.service.JwtService;
import dev.faizarfi.auth.service.SessionService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/auth/session")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @GetMapping
    public ResponseEntity<List<SessionDto>> getMySessions(HttpServletRequest request,
                                                          @RequestParam(required = false) String clientId) {

        return sessionService.getMySessions(request, clientId);
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> revokeSession(@PathVariable UUID sessionId, HttpServletRequest request) {

        return sessionService.revokeSession(sessionId, request);
    }
}
