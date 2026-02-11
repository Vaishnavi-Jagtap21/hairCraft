package com.haircraft.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.haircraft.backend.Entity.ContactMessage;
import com.haircraft.backend.dto.ContactReplyDto;
import com.haircraft.backend.service.ContactService;
import com.haircraft.backend.service.EmailService;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
public class ContactController {

    private final ContactService service;
    private final EmailService emailService; // ✅ injected

    public ContactController(ContactService service, EmailService emailService) {
        this.service = service;
        this.emailService = emailService;
    }

    // ================= USER SUBMIT =================
    @PostMapping
    public ContactMessage submit(@RequestBody ContactMessage message) {

        if (message.getFirstName() == null || message.getEmail() == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "First name and Email are required"
            );
        }

        return service.save(message);
    }

    // ================= ADMIN VIEW =================
    @GetMapping("/admin")
    public List<ContactMessage> getAllMessages() {
        return service.getAll();
    }

    // ================= ADMIN DELETE =================
    @DeleteMapping("/admin/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    // ================= ADMIN REPLY (✅ FIXED) =================
    @PostMapping("/admin/reply")
    public ResponseEntity<?> replyToUser(@RequestBody ContactReplyDto dto) {

        emailService.sendAdminReply(
            dto.getEmail(),
            dto.getSubject(),
            dto.getMessage()
        );

        return ResponseEntity.ok("Reply sent successfully");
    }
}
