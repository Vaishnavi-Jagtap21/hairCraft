package com.haircraft.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.haircraft.backend.Entity.ServiceItem;

public interface ServiceRepository extends JpaRepository<ServiceItem, Long> {

    // ✅ FIXED: name is String
    ServiceItem findFirstByName(String name);

    List<ServiceItem> findByCategory(String category);
}
