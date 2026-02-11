package com.haircraft.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.haircraft.backend.Entity.User;
import com.haircraft.backend.dto.GoogleLoginRequest;
import com.haircraft.backend.dto.LoginRequest;
import com.haircraft.backend.repository.UserRepository;
import com.haircraft.backend.service.GoogleAuthService;
import com.haircraft.backend.service.UserService;
import com.haircraft.backend.utils.AskAI;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final GoogleAuthService googleAuthService;
    private final UserService userService;
    private final AskAI askAI;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            GoogleAuthService googleAuthService,
            UserService userService,
            AskAI askAI,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.googleAuthService = googleAuthService;
        this.userService = userService;
        this.askAI = askAI;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ================= NORMAL LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.loginResponse(request));
    }

    // ================= GOOGLE LOGIN =================
    @PostMapping("/google/login")
    public ResponseEntity<?> googleLogin(
            @RequestBody GoogleLoginRequest request
    ) {
        return googleAuthService.loginWithGoogle(
                request.getGoogleToken()
        );
    }

    @GetMapping("/ask")
    public ResponseEntity<?> askAI() {
        return ResponseEntity.ok(askAI.getAnswer("Hello"));
    }
    
    // ================= SETUP ADMIN (PUBLIC - NO AUTH REQUIRED) =================
    @PostMapping("/setup-admin")
    public ResponseEntity<String> setupAdmin() {
        try {
            // Check if admin already exists
            if (userRepository.findByEmail("admin@haircraft.com").isPresent()) {
                return ResponseEntity.ok("Admin already exists");
            }
            
            // Create admin user
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@haircraft.com");
            admin.setPhone("1234567890");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");  // UserDetailsService will add ROLE_ prefix
            admin.setStatus("ACTIVE");
            
            userRepository.save(admin);
            return ResponseEntity.ok("✅ Admin created! Email: admin@haircraft.com, Password: admin123");
        } catch (Exception e) {
            return ResponseEntity.ok("Error: " + e.getMessage());
        }
    }
}
