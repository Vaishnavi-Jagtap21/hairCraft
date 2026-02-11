package com.haircraft.backend.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.haircraft.backend.Entity.SpecialOffer;
import com.haircraft.backend.repository.SpecialOfferRepository;

@Service
public class SpecialOfferService {

    private final SpecialOfferRepository repo;

    public SpecialOfferService(SpecialOfferRepository repo) {
        this.repo = repo;
    }

    public List<SpecialOffer> getAll() {
        return repo.findAll();
    }

    public SpecialOffer create(SpecialOffer offer) {
        return repo.save(offer);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
