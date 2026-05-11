package dev.faizarfi.auth.controller;

import dev.faizarfi.auth.dto.ClientRegistrationResponse;
import dev.faizarfi.auth.dto.NewClientRequest;
import dev.faizarfi.auth.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/registerProject")
    public ResponseEntity<ClientRegistrationResponse> registerProject(@RequestBody NewClientRequest request) {
        return ResponseEntity.ok(adminService.addNewProject(request));
    }
}
