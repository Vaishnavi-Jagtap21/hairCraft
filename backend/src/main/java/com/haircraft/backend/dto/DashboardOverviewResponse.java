package com.haircraft.backend.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class DashboardOverviewResponse {

    private long users;
    private long appointments;
    private long pending;
    private long completed;

    // ✅ REQUIRED for Jackson
    public DashboardOverviewResponse() {
    }

    // ✅ Explicit JSON constructor
    @JsonCreator
    public DashboardOverviewResponse(
            @JsonProperty("users") long users,
            @JsonProperty("appointments") long appointments,
            @JsonProperty("pending") long pending,
            @JsonProperty("completed") long completed
    ) {
        this.users = users;
        this.appointments = appointments;
        this.pending = pending;
        this.completed = completed;
    }

    public long getUsers() {
        return users;
    }

    public long getAppointments() {
        return appointments;
    }

    public long getPending() {
        return pending;
    }

    public long getCompleted() {
        return completed;
    }
}
