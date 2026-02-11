package com.haircraft.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.haircraft.backend.Entity.AppointmentHistory;
import com.haircraft.backend.Entity.AppointmentStatus;

public interface AppointmentHistoryRepository
        extends JpaRepository<AppointmentHistory, Long> {

    @Query("""
        SELECT ah
        FROM AppointmentHistory ah
        JOIN FETCH ah.appointment a
        WHERE a.user.id = :userId
        ORDER BY ah.changedAt DESC
    """)
    List<AppointmentHistory> findHistoryWithAppointment(@Param("userId") Long userId);

    List<AppointmentHistory> findByAppointment_User_Id(Long userId);

    @Query("""
        SELECT ah
        FROM AppointmentHistory ah
        JOIN FETCH ah.appointment a
        LEFT JOIN FETCH a.service s
        LEFT JOIN FETCH a.user u
        WHERE ah.status IN :statuses
        AND ah.changedAt BETWEEN :start AND :end
    """)
    List<AppointmentHistory> findByStatusInAndChangedAtBetween(
            @Param("statuses") List<AppointmentStatus> statuses,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
        SELECT SUM(a.amount) 
        FROM AppointmentHistory ah 
        JOIN ah.appointment a 
        WHERE ah.status = :status 
        AND a.status = 'COMPLETED'
        AND ah.changedAt BETWEEN :start AND :end
    """)
    Double sumAmountByStatusAndRange(@Param("status") AppointmentStatus status, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("""
        SELECT SUM(a.amount) 
        FROM AppointmentHistory ah 
        JOIN ah.appointment a 
        WHERE ah.status IN :statuses 
        AND ah.changedAt BETWEEN :start AND :end
    """)
    Double sumRefundsInRange(
            @Param("start") LocalDateTime start, 
            @Param("end") LocalDateTime end, 
            @Param("statuses") List<AppointmentStatus> statuses
    );

    @Query("""
        SELECT COUNT(ah) 
        FROM AppointmentHistory ah 
        WHERE ah.status = :status 
        AND ah.changedAt BETWEEN :start AND :end
    """)
    Long countByStatusAndRange(@Param("status") AppointmentStatus status, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("""
        SELECT s.name, COUNT(ah)
        FROM AppointmentHistory ah
        JOIN ah.appointment a
        JOIN a.service s
        WHERE ah.status = :status
        AND ah.changedAt BETWEEN :start AND :end
        GROUP BY s.name
        ORDER BY COUNT(ah) DESC
    """)
    List<Object[]> findTopServiceByHistory(@Param("status") AppointmentStatus status, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("""
        SELECT u.name, COUNT(ah)
        FROM AppointmentHistory ah
        JOIN ah.appointment a
        JOIN a.user u
        WHERE ah.status = :status
        AND ah.changedAt BETWEEN :start AND :end
        GROUP BY u.name
        ORDER BY COUNT(ah) DESC
    """)
    List<Object[]> findTopCustomerByHistory(@Param("status") AppointmentStatus status, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
