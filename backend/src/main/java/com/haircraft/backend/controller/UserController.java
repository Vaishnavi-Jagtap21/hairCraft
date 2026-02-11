
package com.haircraft.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.haircraft.backend.Entity.Appointment;
import com.haircraft.backend.Entity.User;
import com.haircraft.backend.dto.*;
import com.haircraft.backend.repository.UserRepository;
import com.haircraft.backend.service.UserService;
import com.haircraft.backend.utils.UploadToCloud;
import com.haircraft.backend.repository.AppointmentRepository;


@RestController
@RequestMapping("/api/auth")
//@CrossOrigin
public class UserController {

    private final UserService userService;
    private final UserRepository userRepo;
    private final UploadToCloud uploadToCloud;
    private final  AppointmentRepository  AppointmentRepository;

    public UserController(
            UserService userService,
            UserRepository userRepo,
            UploadToCloud uploadToCloud,
            AppointmentRepository  AppointmentRepository
    ) {
        this.userService = userService;
        this.userRepo = userRepo;
        this.uploadToCloud = uploadToCloud;
        this. AppointmentRepository= AppointmentRepository;
    }

    // ================= REGISTER =================
    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest req) {
        return userService.register(req);
    }

    // ================= LOGIN =================


    // ================= SEND RESET OTP =================
    @PostMapping("/reset-password/send-otp")
    public String sendResetOtp(@RequestBody Map<String, String> body) {
        userService.sendResetOtp(body.get("email"));
        return "OTP sent to email";
    }

    // ================= VERIFY OTP & RESET PASSWORD =================
    @PostMapping("/reset-password/verify")
    public String verifyOtpAndResetPassword(
            @RequestBody ResetPasswordRequest req
    ) {
        return userService.resetPassword(req);
    }

    // ================= GET ALL USERS =================
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // ================= UPDATE PROFILE (BASIC) =================
    @PutMapping("/{id}")
    public User updateProfile(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(name);

        if (image != null && !image.isEmpty()) {
            String imageUrl = uploadToCloud.uploadToCloud(image);
            user.setImage(imageUrl);
        }

        return userRepo.save(user);
    }

    // ================= UPDATE PROFILE (ADVANCED / EXTRA CONCEPT) =================
    // ✅ NEW PATH (NO CONFLICT)
    @PutMapping("/profile/{id}")
    public User updateProfile1(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Extra logic can go here later
        user.setName(name);

        if (image != null && !image.isEmpty()) {
            String imageUrl = uploadToCloud.uploadToCloud(image);
            user.setImage(imageUrl);
        }

        return userRepo.save(user);
    }
    @GetMapping("/users/{id}/history")
    public List<AppointmentResponse> getUserHistory(@PathVariable Long id) {

        List<Appointment> appointments =
        		AppointmentRepository.findByUser_Id(id);

        return appointments.stream()
            .map(a -> new AppointmentResponse(
                a.getId(),
                a.getService() != null ? a.getService().getName() : "N/A",
                a.getStatus() != null ? a.getStatus().name() : "UNKNOWN"
            ))
            .toList();
    }




    

}
