package com.haircraft.backend.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointment")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ================= SERVICE =================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", referencedColumnName = "id", nullable = false)
    private ServiceItem service;

    // ================= DATE & TIME =================
    @Column(nullable = false)
    private LocalDateTime appointmentDate;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    // ================= REMINDER =================
    private boolean reminderSent = false;
    private int reminderMinutes = 60;

    // ================= STATUS =================
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status = AppointmentStatus.BOOKED;

    // ================= USER =================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ================= PAYMENT =================
    private Double amount;
    private String paymentStatus;
    private String razorpayPaymentId;
    private String refundStatus;
    private String refundId;

    // ================= AUDIT =================
    private LocalDateTime createdAt;

    // ================= STYLIST =================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stylist_id")
    private Stylist stylist;

    /* ==========================
       LIFECYCLE
    ========================== */

    @PrePersist
    protected void onCreate() {

        this.createdAt = LocalDateTime.now();

        if (this.status == null) {
            this.status = AppointmentStatus.BOOKED;
        }

        // startTime defaults to appointmentDate
        if (this.startTime == null && this.appointmentDate != null) {
            this.startTime = this.appointmentDate;
        }

        // endTime defaults to +30 minutes
        if (this.endTime == null && this.startTime != null) {
            this.endTime = this.startTime.plusMinutes(30);
        }

        if (this.paymentStatus == null) {
            this.paymentStatus = "PENDING";
        }
    }

    /* ==========================
       GETTERS & SETTERS
    ========================== */

    public Long getId() {
        return id;
    }

    public ServiceItem getService() {
        return service;
    }

    public void setService(ServiceItem service) {
        this.service = service;
    }

    public LocalDateTime getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(LocalDateTime appointmentDate) {
        this.appointmentDate = appointmentDate;
        this.startTime = appointmentDate;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public boolean isReminderSent() {
        return reminderSent;
    }

    public void setReminderSent(boolean reminderSent) {
        this.reminderSent = reminderSent;
    }

    public int getReminderMinutes() {
        return reminderMinutes;
    }

    public void setReminderMinutes(int reminderMinutes) {
        this.reminderMinutes = reminderMinutes;
    }

    public AppointmentStatus getStatus() {
        return status != null ? status : AppointmentStatus.BOOKED;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }

    public void setRazorpayPaymentId(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }

    public String getRefundStatus() {
        return refundStatus;
    }

    public void setRefundStatus(String refundStatus) {
        this.refundStatus = refundStatus;
    }

    public String getRefundId() {
        return refundId;
    }

    public void setRefundId(String refundId) {
        this.refundId = refundId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Stylist getStylist() {
        return stylist;
    }

    public void setStylist(Stylist stylist) {
        this.stylist = stylist;
    }
}
