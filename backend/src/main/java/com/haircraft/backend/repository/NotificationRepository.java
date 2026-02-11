package com.haircraft.backend.repository;

import com.haircraft.backend.Entity.Notification;
import com.haircraft.backend.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Get all notifications of user (latest first)
    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    // Unread notifications count
    List<Notification> findByUserAndReadStatusFalse(User user);
}
