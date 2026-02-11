package com.haircraft.backend.dto;

public class GoogleLoginRequest {

    // MUST match frontend JSON key
    private String googleToken;

    public String getGoogleToken() {
        return googleToken;
    }

    public void setGoogleToken(String googleToken) {
        this.googleToken = googleToken;
    }
    
}
