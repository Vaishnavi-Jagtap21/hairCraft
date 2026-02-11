package com.haircraft.backend.repository;

import com.haircraft.backend.Entity.Appointment;
import com.haircraft.backend.Entity.AppointmentTimeline;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentTimelineRepository
        extends JpaRepository<AppointmentTimeline, Long> {

    // Timeline for one appointment
    List<AppointmentTimeline>
    findByAppointmentOrderByTimeAsc(Appointment appointment);
}
