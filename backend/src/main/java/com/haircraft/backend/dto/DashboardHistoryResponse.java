package com.haircraft.backend.dto;

public class DashboardHistoryResponse {

    private long totalCompleted;
    private double totalRevenue;
    private String topService;
    private String topCustomer;

    private java.util.List<AppointmentHistoryDTO> items;

    // ✅ REQUIRED no-args constructor (for Jackson)
    public DashboardHistoryResponse() {}

    // ✅ REQUIRED all-args constructor (used by service)
    public DashboardHistoryResponse(
            long totalCompleted,
            double totalRevenue,
            String topService,
            String topCustomer,
            java.util.List<AppointmentHistoryDTO> items
    ) {
        this.totalCompleted = totalCompleted;
        this.totalRevenue = totalRevenue;
        this.topService = topService;
        this.topCustomer = topCustomer;
        this.items = items;
    }

    public long getTotalCompleted() {
        return totalCompleted;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public String getTopService() {
        return topService;
    }

    public String getTopCustomer() {
        return topCustomer;
    }

    public java.util.List<AppointmentHistoryDTO> getItems() {
        return items;
    }
}
