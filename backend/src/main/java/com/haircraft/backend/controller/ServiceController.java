package com.haircraft.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.haircraft.backend.Entity.ServiceItem;
import com.haircraft.backend.service.ServiceItemService;
@RestController
@RequestMapping("/api/services")
//@CrossOrigin(origins = "http://localhost:5173")
public class ServiceController {

    @Autowired
    private ServiceItemService service;

    // GET all services
    @GetMapping
    public List<ServiceItem> getAllServices() {
        return service.getAllServices();
    }
    // POST add service
    @PostMapping("/addservice")
    public ServiceItem addService(@RequestBody Map<String, Object> body) {
        ServiceItem item = new ServiceItem();
        item.setName((String) body.get("name"));
        item.setCategory((String) body.get("category"));
        item.setPrice(String.valueOf(body.get("price")));
        item.setBadge((String) body.get("badge"));
        item.setImage((String) body.get("image"));
        item.setDuration(Integer.parseInt(String.valueOf(body.get("duration"))));

        return service.save(item);
    }

    // PUT update service
    @PutMapping("/{id}")
    public ServiceItem updateService(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        ServiceItem item = service.getById(id);
        if (item == null) throw new RuntimeException("Service not found");

        item.setName((String) body.get("name"));
        item.setCategory((String) body.get("category"));
        item.setPrice(String.valueOf(body.get("price")));
        item.setBadge((String) body.get("badge"));
        item.setImage((String) body.get("image"));
        item.setDuration(Integer.parseInt(String.valueOf(body.get("duration"))));

        return service.save(item);
    }

    // DELETE service
    @DeleteMapping("/{id}")
    public void deleteService(@PathVariable Long id) {
        service.delete(id);
    }
}
