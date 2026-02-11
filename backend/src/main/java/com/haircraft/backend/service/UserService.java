package com.haircraft.backend.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import com.haircraft.backend.Entity.User;
import com.haircraft.backend.dto.LoginRequest;
import com.haircraft.backend.dto.RegisterRequest;
import com.haircraft.backend.dto.ResetPasswordRequest;
import com.haircraft.backend.repository.UserRepository;
import com.haircraft.backend.utils.JwtUtil;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;

    public UserService(
            UserRepository userRepo,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            JwtUtil jwtUtil
    ) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.jwtUtil = jwtUtil;
    }

    // ================= REGISTER =================
    public String register(RegisterRequest req) {

        if (userRepo.existsByEmail(req.getEmail())) {
            return "Email already exists";
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPhone(req.getPhone());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setImage(req.getImage());
        user.setStatus("ACTIVE");

        // Default role
        user.setRole("USER");

        userRepo.save(user);
        return "Registration successful";
    }

    // ================= LOGIN =================
    public Map<String, Object> loginResponse(LoginRequest req) {

        Map<String, Object> response = new HashMap<>();

        User user = userRepo.findByEmailIgnoreCase(req.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or user not found"));

        if (!"ACTIVE".equals(user.getStatus())) {
            response.put("status", "error");
            response.put("message", "Account is blocked");
            return response;
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            response.put("status", "error");
            response.put("message", "Invalid password");
            return response;
        }

        // Generate JWT
        String token = jwtUtil.generateToken(user);

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("name", user.getName());
        userData.put("email", user.getEmail());
        userData.put("phone", user.getPhone());
        userData.put("role", user.getRole());
        userData.put("status", user.getStatus());
        userData.put("image", user.getImage());

        response.put("status", "success");
        response.put("message", "Login successful");
        response.put("token", token);
        response.put("user", userData);

        return response;
    }

    // ================= SEND RESET OTP =================
    public void sendResetOtp(String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Email not registered"));

        String otp = String.valueOf(
                100000 + new SecureRandom().nextInt(900000));

        user.setResetOtp(otp);
        user.setResetOtpExpiry(
                LocalDateTime.now().plusMinutes(5));

        userRepo.save(user);
        emailService.sendResetOtp(email, otp);
    }

    // ================= RESET PASSWORD =================
    public String resetPassword(ResetPasswordRequest req) {

        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (user.getResetOtp() == null ||
            user.getResetOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        if (!user.getResetOtp().equals(req.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        user.setPassword(
                passwordEncoder.encode(req.getNewPassword()));

        user.setResetOtp(null);
        user.setResetOtpExpiry(null);

        userRepo.save(user);
        return "Password reset successful";
    }

    // ================= GET ALL USERS =================
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    // ================= SPRING SECURITY =================
    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User user = userRepo.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User " + email + " not found in database"));

        // Normalize role
        String role = user.getRole();
        if (role == null || role.isBlank()) {
            role = "USER";
        }

        role = role.trim().toUpperCase();

        // Spring requires ROLE_ prefix
        String authority = role.startsWith("ROLE_")
                ? role
                : "ROLE_" + role;

        System.out.println("Loading user with authority: " + authority);

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority(authority))
        );
    }
}
