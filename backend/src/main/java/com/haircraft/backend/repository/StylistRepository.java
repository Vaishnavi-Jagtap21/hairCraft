package com.haircraft.backend.repository;

import com.haircraft.backend.Entity.Stylist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StylistRepository extends JpaRepository<Stylist, Long> {
    List<Stylist> findByActiveTrue();
}
