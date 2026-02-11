package com.haircraft.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.haircraft.backend.Entity.SpecialOffer;

public interface SpecialOfferRepository extends JpaRepository<SpecialOffer, Long> {
}
