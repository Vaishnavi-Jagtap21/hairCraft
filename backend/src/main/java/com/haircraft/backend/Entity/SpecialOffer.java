package com.haircraft.backend.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "offers")
@Data
public class SpecialOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    @ManyToOne
    @JoinColumn(name = "service_id")
    private ServiceItem service;

    private Double originalPrice;
    private Double discountedPrice;
    private String image;

    // Getters and Setters explicitly (if Lombok not used)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ServiceItem getService() { return service; }
    public void setService(ServiceItem service) { this.service = service; }

    public Double getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(Double originalPrice) { this.originalPrice = originalPrice; }

    public Double getDiscountedPrice() { return discountedPrice; }
    public void setDiscountedPrice(Double discountedPrice) { this.discountedPrice = discountedPrice; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}
