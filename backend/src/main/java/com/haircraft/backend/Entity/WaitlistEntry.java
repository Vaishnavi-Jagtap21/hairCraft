package com.haircraft.backend.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "waitlist")
public class WaitlistEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "service_id")
    private ServiceItem service;

    @ManyToOne
    @JoinColumn(name = "stylist_id")
    private Stylist stylist;

    private LocalDateTime preferredDate;
    private String preferredTime;

    private boolean notified = false;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public ServiceItem getService() { return service; }
    public void setService(ServiceItem service) { this.service = service; }
    public Stylist getStylist() { return stylist; }
    public void setStylist(Stylist stylist) { this.stylist = stylist; }
    public LocalDateTime getPreferredDate() { return preferredDate; }
    public void setPreferredDate(LocalDateTime preferredDate) { this.preferredDate = preferredDate; }
    public String getPreferredTime() { return preferredTime; }
    public void setPreferredTime(String preferredTime) { this.preferredTime = preferredTime; }
    public boolean isNotified() { return notified; }
    public void setNotified(boolean notified) { this.notified = notified; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
