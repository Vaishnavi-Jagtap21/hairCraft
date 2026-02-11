package com.haircraft.backend.repository;

import com.haircraft.backend.Entity.WaitlistEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface WaitlistRepository extends JpaRepository<WaitlistEntry, Long> {
    List<WaitlistEntry> findByStylist_IdAndPreferredDateAndPreferredTimeAndNotifiedFalse(
            Long stylistId, LocalDateTime date, String time);
}
