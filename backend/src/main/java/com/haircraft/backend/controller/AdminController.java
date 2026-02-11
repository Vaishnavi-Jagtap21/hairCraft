package com.haircraft.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import com.haircraft.backend.Entity.AppointmentStatus;
import com.haircraft.backend.Entity.ServiceItem;
import com.haircraft.backend.Entity.User;
import com.haircraft.backend.Entity.Stylist;
import com.haircraft.backend.Entity.Appointment;
import com.haircraft.backend.dto.AppointmentDTO;
import com.haircraft.backend.dto.DashboardHistoryResponse;
import com.haircraft.backend.dto.DashboardOverviewResponse;
import com.haircraft.backend.dto.LoginRequest;
import com.haircraft.backend.dto.RegisterRequest;
import com.haircraft.backend.dto.StylistScheduleDTO;
import com.haircraft.backend.service.AppointmentService;
import com.haircraft.backend.utils.JwtUtil;
import com.haircraft.backend.repository.UserRepository;
import com.haircraft.backend.repository.ServiceRepository;
import com.haircraft.backend.repository.StylistRepository;
import com.haircraft.backend.repository.AppointmentRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepo;
    private final ServiceRepository serviceRepo;
    private final AppointmentService appointmentService;
    private final StylistRepository stylistRepo;
    private final AppointmentRepository appointmentRepo;

    public AdminController(
            JwtUtil jwtUtil,
            PasswordEncoder passwordEncoder,
            UserRepository userRepo,
            ServiceRepository serviceRepo,
            AppointmentService appointmentService,
            AuthenticationManager authenticationManager,
            StylistRepository stylistRepo,
            AppointmentRepository appointmentRepo
    ) {
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.userRepo = userRepo;
        this.serviceRepo = serviceRepo;
        this.appointmentService = appointmentService;
        this.authenticationManager = authenticationManager;
        this.stylistRepo = stylistRepo;
        this.appointmentRepo = appointmentRepo;
    }

    // ================= DEBUG =================
    
    @GetMapping("/test-role")
    public String testRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return "User: " + (auth != null ? auth.getName() : "null") + ", Authorities: " + (auth != null ? auth.getAuthorities() : "null");
    }

    // ================= USERS =================

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    // ================= APPOINTMENTS =================
    
    @GetMapping("/appointments")
    public List<AppointmentDTO> getAllAppointments() {
        try {
            return appointmentService.getAllAppointmentsDTO();
        } catch (Exception e) {
            System.err.println("Error in getAllAppointments: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PutMapping("/appointments/{id}/status")
    public AppointmentDTO updateStatus(
            @PathVariable Long id,
            @RequestParam com.haircraft.backend.Entity.AppointmentStatus status) {
        return appointmentService.updateStatus(id, status);
    }

    // ================= DASHBOARD =================

    @GetMapping(value = "/dashboard/stats", produces = MediaType.APPLICATION_JSON_VALUE)
    public DashboardOverviewResponse getStats() {
        return appointmentService.getDashboardStats();
    }

    @GetMapping(value = "/dashboard/stats/history", produces = MediaType.APPLICATION_JSON_VALUE)
    public DashboardHistoryResponse getDashboardHistory(
            @RequestParam(defaultValue = "YEAR") String range
    ) {
        return appointmentService.getHistoryDashboardStats(range.toUpperCase());
    }

    // ================= AUTH =================

    @PostMapping("/create")
    public ResponseEntity<?> createAdmin(@RequestBody RegisterRequest req) {
        if (userRepo.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity.ok("Admin already exists");
        }
        User admin = new User();
        admin.setName(req.getName());
        admin.setEmail(req.getEmail());
        admin.setPhone(req.getPhone());
        admin.setPassword(passwordEncoder.encode(req.getPassword()));
        admin.setRole("ADMIN");
        admin.setStatus("ACTIVE");
        userRepo.save(admin);
        return ResponseEntity.ok("Admin created");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        String token = jwtUtil.generateToken(user);
        return ResponseEntity.ok(Map.of(
            "token", token,
            "role", user.getRole(),
            "email", user.getEmail()
        ));
    }

    // ================= STYLIST SCHEDULE =================
    
    @GetMapping("/stylists/schedule")
    @Transactional(readOnly = true)
    public List<StylistScheduleDTO> getStylistSchedules(@RequestParam(required = false) String date) {
        try {
            LocalDate targetDate = (date != null && !date.isBlank()) ? LocalDate.parse(date) : LocalDate.now();
            LocalDateTime startOfDay = targetDate.atStartOfDay();
            LocalDateTime endOfDay = targetDate.plusDays(1).atStartOfDay();
            
            List<Stylist> allStylists = stylistRepo.findAll();
            
            return allStylists.stream().map(stylist -> {
                StylistScheduleDTO dto = new StylistScheduleDTO(
                    stylist.getId(), stylist.getName(), stylist.getSpecialization(), 
                    stylist.isActive(), stylist.getCapacity()
                );
                
                List<Appointment> todays = appointmentRepo.findByStylistAndDateRange(stylist, startOfDay, endOfDay)
                    .stream()
                    .filter(a -> a.getStatus() != AppointmentStatus.CANCELLED 
                              && a.getStatus() != AppointmentStatus.REJECTED)
                    .collect(Collectors.toList());
                
                dto.setTodayAppointments(todays.size());
                
                // Populate upcoming (7 days)
                LocalDateTime weekEnd = LocalDateTime.now().plusDays(7);
                List<Appointment> upcoming = appointmentRepo.findByStylistAndDateRange(stylist, LocalDateTime.now(), weekEnd)
                    .stream()
                    .filter(a -> a.getStatus() != AppointmentStatus.CANCELLED)
                    .collect(Collectors.toList());
                dto.setUpcomingAppointments(upcoming.size());
                
                dto.setTodaysSchedule(todays.stream().map(appointmentService::convertToDTO).collect(Collectors.toList()));
                return dto;
            }).collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error in getStylistSchedules: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @GetMapping("/stylists/utilization")
    @Transactional(readOnly = true)
    public Map<String, Object> getStylistUtilization() {
        try {
            LocalDate today = LocalDate.now();
            LocalDateTime startOfDay = today.atStartOfDay();
            LocalDateTime endOfDay = today.plusDays(1).atStartOfDay();
            
            List<Stylist> activeStylists = stylistRepo.findByActiveTrue();
            long fullyBooked = 0;
            long available = 0;
            
            for (Stylist s : activeStylists) {
                long count = appointmentRepo.findByStylistAndDateRange(s, startOfDay, endOfDay)
                    .stream()
                    .filter(a -> a.getStatus() != AppointmentStatus.CANCELLED)
                    .count();
                if (count >= s.getCapacity()) fullyBooked++; else available++;
            }
            
            return Map.of(
                "totalStylists", stylistRepo.findAll().size(),
                "activeStylists", activeStylists.size(),
                "fullyBookedToday", fullyBooked,
                "availableToday", available
            );
        } catch (Exception e) {
            System.err.println("Error in getStylistUtilization: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
