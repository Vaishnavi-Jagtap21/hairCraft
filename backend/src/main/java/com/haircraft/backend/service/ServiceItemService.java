package com.haircraft.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.haircraft.backend.Entity.ServiceItem;
import com.haircraft.backend.repository.ServiceRepository;

@Service
public class ServiceItemService {

    private final ServiceRepository repo;

    public ServiceItemService(ServiceRepository repo) {
        this.repo = repo;
    }

   

    public List<ServiceItem> getByCategory(String category) {
        return repo.findByCategory(category);
    }
    public ServiceItem save(ServiceItem serviceItem) {
        return repo.save(serviceItem);
    }
    public List<ServiceItem> getAllServices() {
        return repo.findAll();
    }
    public ServiceItem getById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

   
}
