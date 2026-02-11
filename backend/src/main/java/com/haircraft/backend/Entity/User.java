package com.haircraft.backend.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String phone;

    @com.fasterxml.jackson.annotation.JsonIgnore
    private String password;

    private String provider;

    private String role = "USER";

    @Column(length = 500)
    private String image;

    // 🔐 RESET PASSWORD OTP
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String resetOtp;

    @com.fasterxml.jackson.annotation.JsonIgnore
    private LocalDateTime resetOtpExpiry;

    // ✅ USER STATUS FIELD (ACTIVE / INACTIVE)
    @Column(nullable = false)
    private String status = "ACTIVE";

    @OneToOne
    @JoinColumn(name = "stylist_id")
    private Stylist stylist;

    // ❗ keeping your field (not removed)
    private String string = "ACTIVE";

    // 💰 LOYALTY & WALLET
    private Double walletBalance = 0.0;
    private Integer loyaltyPoints = 0;

    // ================= MANUAL GETTERS / SETTERS =================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getResetOtp() {
        return resetOtp;
    }

    public void setResetOtp(String resetOtp) {
        this.resetOtp = resetOtp;
    }

    public LocalDateTime getResetOtpExpiry() {
        return resetOtpExpiry;
    }

    public void setResetOtpExpiry(LocalDateTime resetOtpExpiry) {
        this.resetOtpExpiry = resetOtpExpiry;
    }

    // ✅ FIXED STATUS METHODS (CRITICAL)
    public void setStatus(String status) {
        this.status = status;
    }

    public String getStatus() {
        return this.status;
    }

    // ❗ keeping your old method usage intact
    public void setString(String string) {
        this.string = string;
    }

    public String getString() {
        return string;
    }

    public Double getWalletBalance() {
        return walletBalance != null ? walletBalance : 0.0;
    }

    public void setWalletBalance(Double walletBalance) {
        this.walletBalance = walletBalance;
    }

    public Integer getLoyaltyPoints() {
        return loyaltyPoints != null ? loyaltyPoints : 0;
    }

    public void setLoyaltyPoints(Integer loyaltyPoints) {
        this.loyaltyPoints = loyaltyPoints;
    }

    public Stylist getStylist() {
        return stylist;
    }

    public void setStylist(Stylist stylist) {
        this.stylist = stylist;
    }
}
