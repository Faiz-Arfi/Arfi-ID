package dev.faizarfi.auth.repository;

import dev.faizarfi.auth.entity.Client;
import dev.faizarfi.auth.entity.User;
import dev.faizarfi.auth.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, UUID> {

    Optional<UserRole> findByUserAndClient(User user, Client client);
}
