package com.haircraft.backend.controller;

import com.haircraft.backend.Entity.Stylist;
import com.haircraft.backend.repository.StylistRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stylists")
public class StylistController {

    private final StylistRepository stylistRepository;

    public StylistController(StylistRepository stylistRepository) {
        this.stylistRepository = stylistRepository;
    }

    @GetMapping
    public List<Stylist> getAllActiveStylists() {
        return stylistRepository.findByActiveTrue();
    }

    @PostMapping
    public Stylist addStylist(@RequestBody Stylist stylist) {
        return stylistRepository.save(stylist);
    }

    @GetMapping("/schedule")
    public List<Stylist> getStylistSchedule(@RequestParam String date) {
        return stylistRepository.findByActiveTrue();
    }
}
