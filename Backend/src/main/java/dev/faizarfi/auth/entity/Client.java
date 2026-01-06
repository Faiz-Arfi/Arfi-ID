package dev.faizarfi.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Client {

    @Id
    @Column(nullable = false, unique = true)
    private String clientId;

    @Column(nullable = false)
    private String clientName;

    @Column(nullable = false)
    private boolean isActive;
}
