package dev.faizarfi.auth.controller;

import dev.faizarfi.auth.dto.ClientRegistrationResponse;
import dev.faizarfi.auth.dto.NewClientRequest;
import dev.faizarfi.auth.dto.UpdateClientRequest;
import dev.faizarfi.auth.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/projects")
    public ResponseEntity<ClientRegistrationResponse> registerProject(@Valid @RequestBody NewClientRequest request) {
        ClientRegistrationResponse response = adminService.addNewProject(request);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("{id}")
                .buildAndExpand(response.getClientId())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/projects/{id}")
    public ResponseEntity<ClientRegistrationResponse> getProjectById(@PathVariable("id") String clientId) {
        return ResponseEntity.ok(adminService.getProjectById(clientId));
    }

    @GetMapping("/projects")
    public ResponseEntity<Page<ClientRegistrationResponse>> getAllProjects(
            @PageableDefault(
//                    page = 0,
                    size = 20,
                    sort = "clientName",
                    direction = Sort.Direction.ASC
            )
            Pageable p) {
        return ResponseEntity.ok(adminService.getAllProjects(p));
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<ClientRegistrationResponse> updateProjectById(@PathVariable("id") String clientId, @Valid @RequestBody UpdateClientRequest request) {
        ClientRegistrationResponse response = adminService.modifyProject(clientId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/projects/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProjectById(@PathVariable("id") String clientId) {
        adminService.deleteProjectById(clientId);
    }
}
