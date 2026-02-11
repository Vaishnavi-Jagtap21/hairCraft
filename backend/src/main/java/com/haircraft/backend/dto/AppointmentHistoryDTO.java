package com.haircraft.backend.dto;

import java.time.LocalDateTime;

public class AppointmentHistoryDTO {

    private Long appointmentId;
    private String serviceName;
    private String customerName;
    private String appointmentDate;
    private String appointmentTime;
    private String status;
    private Double amount;

    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime changedAt;

    public AppointmentHistoryDTO(
            Long appointmentId,
            String serviceName,
            String customerName,
            String appointmentDate,
            String appointmentTime,
            String status,
            Double amount,
            LocalDateTime changedAt
    ) {
        this.appointmentId = appointmentId;
        this.serviceName = serviceName;
        this.customerName = customerName;
        this.appointmentDate = appointmentDate;
        this.appointmentTime = appointmentTime;
        this.status = status;
        this.amount = amount;
        this.changedAt = changedAt;
    }

    public String getCustomerName() { return customerName; }
    public Long getAppointmentId() { return appointmentId; }
    public String getServiceName() { return serviceName; }
    public String getAppointmentDate() { return appointmentDate; }
    public String getAppointmentTime() { return appointmentTime; }
    public String getStatus() { return status; }
    public Double getAmount() { return amount; }
    public LocalDateTime getChangedAt() { return changedAt; }
}
