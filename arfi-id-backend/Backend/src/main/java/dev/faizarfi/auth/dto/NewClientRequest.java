package dev.faizarfi.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.URL;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NewClientRequest {

    @NotBlank(message = "Client name is required and can't be blank")
    @Size(min = 3, max = 50, message = "Client name must be between 3 and 50 characters")
    private String clientName;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String clientDescription;

    @NotBlank(message = "Redirect URI is required")
    @URL(message = "Must be a valid absolute URL")
    private String redirectUri;
}
