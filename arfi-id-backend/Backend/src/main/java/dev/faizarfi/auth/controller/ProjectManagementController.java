package dev.faizarfi.auth.controller;

import dev.faizarfi.auth.dto.ProjectConnectionDto;
import dev.faizarfi.auth.service.ProjectManagementService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth/projects")
@RequiredArgsConstructor
public class ProjectManagementController {

    private final ProjectManagementService projectManagementService;

    @GetMapping("/status")
    public ResponseEntity<List<ProjectConnectionDto>> getAllProjectStats(HttpServletRequest request) {
        return ResponseEntity.ok(projectManagementService.getUserProjectOverview(request));
    }

    @PostMapping("/revoke/{clientId}")
    public ResponseEntity<Void> revokeProject(@PathVariable String clientId, HttpServletRequest request) {
        projectManagementService.revokeProjectAccess(clientId, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/restore/{clientId}")
    public ResponseEntity<Void> restoreProject(@PathVariable String clientId, HttpServletRequest request) {
        projectManagementService.restoreProjectAccess(clientId, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/connect/{clientId}")
    public ResponseEntity<String> connectProject(@PathVariable String clientId, HttpServletRequest request) {
        return projectManagementService.connectProject(clientId, request);
    }
}
