package dev.faizarfi.auth.dto;


public record UpdateClientRequest(
         String clientName,
         String clientDescription,
         String redirectUri
) {}
