package dev.faizarfi.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OAuthAuthorizeResponse {

    private String code;

    private String state;

    private String redirectUri;

    private Integer expiresIn;
}
