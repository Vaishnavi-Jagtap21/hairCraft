package com.haircraft.backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/test-auth")
public class TestAuthController {

    @GetMapping
    public Map<String, Object> test() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return Map.of(
            "name", auth != null ? auth.getName() : "anonymous",
            "authorities", auth != null ? auth.getAuthorities() : "none",
            "isAuthenticated", auth != null ? auth.isAuthenticated() : false
        );
    }
}
