package com.haircraft.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.haircraft.backend.Entity.Appointment;
import com.haircraft.backend.Entity.AppointmentStatus;
import com.haircraft.backend.Entity.AppointmentTimeline;
import com.haircraft.backend.repository.AppointmentTimelineRepository;

@Service
public class TimelineService {

    @Autowired
    private AppointmentTimelineRepository repo;

    public void addEntry(Appointment appointment, AppointmentStatus status) {
        try {
            AppointmentTimeline t = new AppointmentTimeline();
            t.setAppointment(appointment);
            t.setStatus(status.name());

            repo.save(t);
        } catch (Exception e) {
            System.err.println("Failed to save timeline: " + e.getMessage());
        }
    }
}
