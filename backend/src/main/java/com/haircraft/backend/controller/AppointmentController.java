package com.haircraft.backend.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.haircraft.backend.Entity.*;
import com.haircraft.backend.dto.*;
import com.haircraft.backend.repository.*;
import com.haircraft.backend.service.AppointmentService;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final UserRepository userRepository;
    private final AppointmentService service;
    private final AppointmentRepository appointmentRepo;
    private final ServiceRepository serviceRepository;
    private final StylistRepository stylistRepository;

    public AppointmentController(
            AppointmentService service,
            AppointmentRepository appointmentRepo,
            ServiceRepository serviceRepository,
            UserRepository userRepository,
            StylistRepository stylistRepository
    ) {
        this.service = service;
        this.appointmentRepo = appointmentRepo;
        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
        this.stylistRepository = stylistRepository;
    }

    // ================= BOOK APPOINTMENT =================
    @PostMapping("/book")
    public AppointmentDTO bookAppointment(
            @RequestBody AppointmentRequest request) {

        try {
            ServiceItem serviceItem =
                    serviceRepository.findById(request.getServiceId())
                            .orElseThrow(() ->
                                    new ResponseStatusException(
                                            HttpStatus.BAD_REQUEST,
                                            "Service not found"));

            User user =
                    userRepository.findById(request.getUserId())
                            .orElseThrow(() ->
                                    new ResponseStatusException(
                                            HttpStatus.BAD_REQUEST,
                                            "User not found"));

            LocalDateTime startDateTime =
                    LocalDateTime.of(
                            request.getAppointmentDate(),
                            request.getAppointmentTime()
                    );

            int duration = serviceItem.getDuration() > 0
                    ? serviceItem.getDuration()
                    : 30;

            LocalDateTime endDateTime =
                    startDateTime.plusMinutes(duration);

            // Stylist must be selected
            if (request.getStylistId() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Please select a stylist");
            }

            Stylist assignedStylist = stylistRepository
                    .findById(request.getStylistId())
                    .orElseThrow(() ->
                            new ResponseStatusException(
                                    HttpStatus.NOT_FOUND,
                                    "Stylist not found"));

            if (appointmentRepo.hasOverlap(
                    assignedStylist.getId(),
                    startDateTime,
                    endDateTime)) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Stylist is already booked at this time");
            }

            Appointment appointment = new Appointment();
            appointment.setService(serviceItem);
            appointment.setUser(user);
            appointment.setAppointmentDate(startDateTime);
            appointment.setStartTime(startDateTime);
            appointment.setEndTime(endDateTime);
            appointment.setAmount(request.getAmount());
            appointment.setPaymentStatus("PENDING");
            appointment.setStatus(AppointmentStatus.BOOKED);
            appointment.setStylist(assignedStylist);

            Appointment saved = service.save(appointment);
            return service.convertToDTO(saved);

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Booking failed: " + e.getMessage());
        }
    }

    // ================= USER APPOINTMENTS =================
    @GetMapping("/user/{userId}")
    public List<AppointmentDTO> getUserAppointments(
            @PathVariable Long userId) {
        return service.getAppointmentsForUser(userId);
    }

    // ================= USER HISTORY =================
    @GetMapping("/history/user/{userId}")
    public List<AppointmentHistoryDTO> getHistoryDTOByUser(
            @PathVariable Long userId) {
        return service.getHistoryByUserDTO(userId);
    }

    // ================= BOOKED SLOTS =================
    @GetMapping("/booked-slots")
    public List<String> getBookedSlots(
            @RequestParam String date,
            @RequestParam(required = false) Long stylistId) {

        LocalDate selectedDate = LocalDate.parse(date);
        List<String> blockedSlots = new java.util.ArrayList<>();

        List<Appointment> appointments =
                appointmentRepo.findAppointmentsByDate(
                        selectedDate.atStartOfDay(),
                        selectedDate.plusDays(1).atStartOfDay());

        List<Stylist> allStylists =
                stylistRepository.findByActiveTrue();

        int totalStylists = allStylists.size();

        java.time.LocalTime startOfDay =
                java.time.LocalTime.of(9, 0);
        java.time.LocalTime endOfDay =
                java.time.LocalTime.of(21, 0);

        while (startOfDay.isBefore(endOfDay)) {

            LocalDateTime slotStart =
                    LocalDateTime.of(selectedDate, startOfDay);
            LocalDateTime slotEnd =
                    slotStart.plusMinutes(30);

            long busyStylistsCount = 0;

            for (Appointment a : appointments) {

                if (a.getStatus() == AppointmentStatus.CANCELLED)
                    continue;

                if (stylistId != null &&
                        a.getStylist() != null &&
                        !a.getStylist().getId().equals(stylistId)) {
                    continue;
                }

                if (a.getAppointmentDate().isBefore(slotEnd)
                        && a.getEndTime().isAfter(slotStart)) {
                    busyStylistsCount++;
                }
            }

            if (stylistId != null) {
                if (busyStylistsCount > 0) {
                    blockedSlots.add(startOfDay.toString().substring(0, 5));
                }
            } else {
                if (busyStylistsCount >= totalStylists && totalStylists > 0) {
                    blockedSlots.add(startOfDay.toString().substring(0, 5));
                }
            }

            startOfDay = startOfDay.plusMinutes(30);
        }

        return blockedSlots;
    }
}
