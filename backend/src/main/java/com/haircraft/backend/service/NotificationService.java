package com.haircraft.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.haircraft.backend.Entity.Notification;
import com.haircraft.backend.Entity.User;
import com.haircraft.backend.repository.NotificationRepository;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository repo;

    public void create(User user, String message) {
        Notification n = new Notification();
        n.setUser(user);
        n.setMessage(message);
        repo.save(n);
    }
}
