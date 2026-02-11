package com.haircraft.backend.dto;


public class AppointmentResponse {

    private Long id;
    private String serviceName;
    private String status;
   


    // ✅ Constructor
    public AppointmentResponse(Long id, String serviceName, String status) {
        this.id = id;
        this.serviceName = serviceName;
        this.status = status;
        
    }


	// ✅ Getters
    public Long getId() {
        return id;
    }

    public String getServiceName() {
        return serviceName;
    }

    public String getStatus() {
        return status;
    }
    
}
