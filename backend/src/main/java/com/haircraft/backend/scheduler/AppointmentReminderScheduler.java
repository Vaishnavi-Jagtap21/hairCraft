package com.haircraft.backend.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.haircraft.backend.Entity.Appointment;
import com.haircraft.backend.Entity.AppointmentStatus;
import com.haircraft.backend.repository.AppointmentRepository;
import com.haircraft.backend.service.EmailService;

import jakarta.transaction.Transactional; 
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class AppointmentReminderScheduler {

    private final AppointmentRepository appointmentRepo;
    private final EmailService emailService;

    public AppointmentReminderScheduler(
            AppointmentRepository appointmentRepo,
            EmailService emailService
    ) {
        this.appointmentRepo = appointmentRepo;
        this.emailService = emailService;
    }

   

    private static final Logger log = LoggerFactory.getLogger(AppointmentReminderScheduler.class);

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void sendAppointmentReminders() {

        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime threshold = now.plusMinutes(60);

            List<Appointment> appointments =
                    appointmentRepo.findAppointmentsNeedingReminder(threshold);

            for (Appointment appt : appointments) {
                try {
                    if (!appt.isReminderSent()) {
                        emailService.sendAppointmentReminder(appt);
                        appt.setReminderSent(true);
                        appointmentRepo.save(appt);
                    }
                } catch (Exception e) {
                    log.error("Error sending reminder for appointment ID: {}", appt.getId(), e);
                }
            }
        } catch (Exception e) {
            log.error("Unexpected error in appointment reminder scheduler", e);
        }
    }
}
