package com.haircraft.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.haircraft.backend.Entity.ContactMessage;

public interface ContactMessageRepository 
        extends JpaRepository<ContactMessage, Long> {
}
