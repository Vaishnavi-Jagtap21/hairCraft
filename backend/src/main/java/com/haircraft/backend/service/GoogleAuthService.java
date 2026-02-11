package com.haircraft.backend.service;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.haircraft.backend.Entity.User;
import com.haircraft.backend.repository.UserRepository;
import com.haircraft.backend.utils.JwtUtil;

@Service
public class GoogleAuthService {

    @Value("${google.client-id}")
    private String clientId;

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public GoogleAuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    // ================= REGISTER WITH GOOGLE =================
    public ResponseEntity<?> registerWithGoogle(String token) {

        GoogleIdToken.Payload payload = verify(token);
        if (payload == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid Google token");
        }

        String email = payload.getEmail();

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body("User already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setName((String) payload.get("name"));
        user.setProvider("GOOGLE");
        user.setRole("USER");        // ✅ REQUIRED
        user.setStatus("ACTIVE");    // ✅ REQUIRED

        userRepository.save(user);

        // ✅ FIXED: pass User, not email
        String jwt = jwtUtil.generateToken(user);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "token", jwt,
                "email", user.getEmail(),
                "name", user.getName(),
                "role", user.getRole()
        ));
    }

    // ================= LOGIN WITH GOOGLE =================
    public ResponseEntity<?> loginWithGoogle(String token) {

        GoogleIdToken.Payload payload = verify(token);
        if (payload == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid Google token");
        }

        String email = payload.getEmail();

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Account not found. Please register first.");
        }

        User user = userOpt.get();

        // ✅ BLOCKED CHECK
        if (!"ACTIVE".equals(user.getStatus())) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Account is blocked");
        }

        // ✅ FIXED: pass User, not email
        String jwt = jwtUtil.generateToken(user);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "token", jwt,
                "user", user
        ));
    }

    // ================= VERIFY GOOGLE TOKEN =================
    private GoogleIdToken.Payload verify(String token) {
        try {
            GoogleIdTokenVerifier verifier =
                    new GoogleIdTokenVerifier.Builder(
                            new NetHttpTransport(),
                            JacksonFactory.getDefaultInstance()
                    )
                    .setAudience(Collections.singletonList(clientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(token);
            return idToken != null ? idToken.getPayload() : null;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
