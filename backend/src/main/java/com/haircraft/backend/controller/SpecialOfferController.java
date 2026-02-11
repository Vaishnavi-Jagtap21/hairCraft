package com.haircraft.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;
import com.haircraft.backend.Entity.SpecialOffer;
import com.haircraft.backend.Entity.ServiceItem;
import com.haircraft.backend.service.SpecialOfferService;
import com.haircraft.backend.repository.ServiceRepository; // Assuming exists

@RestController
@RequestMapping("/api/offers")
public class SpecialOfferController {

    private final SpecialOfferService service;
    private final ServiceRepository serviceRepo;

    public SpecialOfferController(SpecialOfferService service, ServiceRepository serviceRepo) {
        this.service = service;
        this.serviceRepo = serviceRepo;
    }

    @GetMapping
    public List<SpecialOffer> getAll() {
        return service.getAll();
    }

    @PostMapping("/admin/add")
    public SpecialOffer create(@RequestBody Map<String, Object> body) {
        Long serviceId = Long.parseLong(body.get("serviceId").toString());
        ServiceItem item = serviceRepo.findById(serviceId).orElseThrow(() -> new RuntimeException("Service not found"));

        SpecialOffer offer = new SpecialOffer();
        offer.setTitle((String) body.get("title"));
        offer.setDescription((String) body.get("description"));
        offer.setImage(item.getImage()); // Use service image by default if not provided? Or separate? 
        // Or if body has image use it
        if (body.containsKey("image")) {
             offer.setImage((String) body.get("image"));
        } else {
             offer.setImage(item.getImage()); 
        }

        offer.setService(item);
        
        // Price logic
        Double originalPrice = Double.parseDouble(item.getPrice());
        offer.setOriginalPrice(originalPrice);
        
        // 20% discount default or custom
        Double discount = 20.0; 
        if(body.containsKey("discount")) {
             discount = Double.parseDouble(body.get("discount").toString());
        }
        
        double discountedPrice = originalPrice - (originalPrice * (discount / 100));
        offer.setDiscountedPrice(discountedPrice);

        return service.create(offer);
    }

    @DeleteMapping("/admin/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
