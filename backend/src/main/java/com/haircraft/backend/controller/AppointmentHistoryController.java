package com.haircraft.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.haircraft.backend.Entity.AppointmentHistory;
import com.haircraft.backend.dto.AppointmentHistoryDTO;
import com.haircraft.backend.dto.DashboardHistoryResponse;
import com.haircraft.backend.service.AppointmentService;

@RestController
@RequestMapping("/api/appointments/history")
public class AppointmentHistoryController {

    private final AppointmentService service;

    public AppointmentHistoryController(AppointmentService service) {
        this.service = service;
    }

    // ===============================
    // USER – RAW HISTORY (ENTITY)
    // ===============================

    @GetMapping("/user/{userId}/all")
    public List<AppointmentHistory> userHistory(@PathVariable Long userId) {
        return service.findByAppointment_User_Id(userId);
    }

    // Alias (kept for backward compatibility)
    @GetMapping("/raw/user/{userId}")
    public List<AppointmentHistory> getHistoryAlias(@PathVariable Long userId) {
        return service.findByAppointment_User_Id(userId);
    }

    // ===============================
    // USER – SAFE HISTORY (DTO)
    // ===============================

    @GetMapping("/user/{userId}/dto")
    public List<AppointmentHistoryDTO> getUserHistoryDTO(@PathVariable Long userId) {
        return service.getHistoryDTOByUser(userId);
    }


    // ===============================
    // ADMIN – ALL HISTORY
    // ===============================

    @GetMapping("/admin")
    public List<AppointmentHistory> allHistory() {
        return service.findAll();
    }

    // ===============================
    // DASHBOARD STATS
    // ===============================

    @GetMapping("/dashboard")
    public DashboardHistoryResponse getDashboardHistory(
            @RequestParam(defaultValue = "TODAY") String range
    ) {
        return service.getHistoryDashboardStats(range);
    }
    
}
