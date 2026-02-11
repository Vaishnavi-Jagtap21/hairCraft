package com.haircraft.backend.dto;

import lombok.Data;

@Data
public class ResetPasswordRequest {

    private String email;
    private String otp;          // ✅ ADD THIS
    private String newPassword;

    // Lombok already generates getters & setters,
    // but keeping them explicit since you wrote them manually.

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtp() {     // ✅ REAL GETTER
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
