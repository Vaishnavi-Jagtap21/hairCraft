package com.haircraft.backend.controller;

import com.haircraft.backend.Entity.Review;
import com.haircraft.backend.Entity.User;
import com.haircraft.backend.repository.ReviewRepository;
import com.haircraft.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    // Get all approved reviews (Public)
    @GetMapping
    public List<Review> getAllReviews() {
        return reviewRepository.findByApprovedTrueOrderByCreatedAtDesc();
    }

    // Add a new review (Authenticated Users)
    @PostMapping("/add")
    public ResponseEntity<?> addReview(@RequestBody Map<String, Object> payload) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body("User not authenticated");
            }

            int rating = Integer.parseInt(payload.get("rating").toString());
            String comment = (String) payload.get("comment");

            if (rating < 1 || rating > 5) {
                return ResponseEntity.badRequest().body("Rating must be between 1 and 5");
            }

            Review review = new Review();
            review.setUser(user);
            review.setRating(rating);
            review.setComment(comment);
            review.setCreatedAt(LocalDateTime.now());
            review.setApproved(true); // Auto-approve for now, or set false for moderation

            reviewRepository.save(review);
            return ResponseEntity.ok("Review added successfully!");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error adding review: " + e.getMessage());
        }
    }
}
