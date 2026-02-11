package com.haircraft.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class StylistScheduleDTO {
    
    private Long stylistId;
    private String stylistName;
    private String specialization;
    private boolean active;
    private int capacity;
    private int todayAppointments;
    private int upcomingAppointments;
    private List<AppointmentDTO> todaysSchedule;
    private AvailabilityStatus status;
    
    public enum AvailabilityStatus {
        FULLY_BOOKED,    // At capacity
        BUSY,            // 70-99% capacity
        AVAILABLE,       // Less than 70% capacity
        INACTIVE         // Not active
    }
    
    // Constructors
    public StylistScheduleDTO() {}
    
    public StylistScheduleDTO(Long stylistId, String stylistName, String specialization, 
                             boolean active, int capacity) {
        this.stylistId = stylistId;
        this.stylistName = stylistName;
        this.specialization = specialization;
        this.active = active;
        this.capacity = capacity;
    }
    
    // Getters and Setters
    public Long getStylistId() {
        return stylistId;
    }
    
    public void setStylistId(Long stylistId) {
        this.stylistId = stylistId;
    }
    
    public String getStylistName() {
        return stylistName;
    }
    
    public void setStylistName(String stylistName) {
        this.stylistName = stylistName;
    }
    
    public String getSpecialization() {
        return specialization;
    }
    
    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }
    
    public boolean isActive() {
        return active;
    }
    
    public void setActive(boolean active) {
        this.active = active;
    }
    
    public int getCapacity() {
        return capacity;
    }
    
    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }
    
    public int getTodayAppointments() {
        return todayAppointments;
    }
    
    public void setTodayAppointments(int todayAppointments) {
        this.todayAppointments = todayAppointments;
        updateStatus();
    }
    
    public int getUpcomingAppointments() {
        return upcomingAppointments;
    }
    
    public void setUpcomingAppointments(int upcomingAppointments) {
        this.upcomingAppointments = upcomingAppointments;
    }
    
    public List<AppointmentDTO> getTodaysSchedule() {
        return todaysSchedule;
    }
    
    public void setTodaysSchedule(List<AppointmentDTO> todaysSchedule) {
        this.todaysSchedule = todaysSchedule;
    }
    
    public AvailabilityStatus getStatus() {
        return status;
    }
    
    public void setStatus(AvailabilityStatus status) {
        this.status = status;
    }
    
    // Helper method to calculate availability status
    private void updateStatus() {
        if (!active) {
            this.status = AvailabilityStatus.INACTIVE;
            return;
        }
        
        if (capacity == 0) {
            this.status = AvailabilityStatus.AVAILABLE;
            return;
        }
        
        double utilizationRate = (double) todayAppointments / capacity;
        
        if (utilizationRate >= 1.0) {
            this.status = AvailabilityStatus.FULLY_BOOKED;
        } else if (utilizationRate >= 0.7) {
            this.status = AvailabilityStatus.BUSY;
        } else {
            this.status = AvailabilityStatus.AVAILABLE;
        }
    }
    
    // Helper method to get utilization percentage
    public int getUtilizationPercentage() {
        if (capacity == 0) return 0;
        return (int) ((double) todayAppointments / capacity * 100);
    }
}
