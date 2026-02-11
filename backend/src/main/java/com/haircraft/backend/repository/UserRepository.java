package com.haircraft.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.haircraft.backend.Entity.AppointmentHistory;
import com.haircraft.backend.Entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmail(String email);

    // ⚠️ NOT USED – kept empty as requested
    static void save(AppointmentHistory history) {
        // intentionally left blank
    }
}
