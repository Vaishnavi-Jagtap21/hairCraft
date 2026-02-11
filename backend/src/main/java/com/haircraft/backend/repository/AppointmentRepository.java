package com.haircraft.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.haircraft.backend.Entity.Appointment;
import com.haircraft.backend.Entity.AppointmentStatus;
import com.haircraft.backend.Entity.Stylist;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // 🔹 Basic queries
    List<Appointment> findByUserId(Long userId);

    boolean existsByAppointmentDateAndStatus(
            LocalDateTime appointmentDate,
            AppointmentStatus status
    );

    // ✅ Fix for Multi-Service: Allow same user to book multiple slots at same time
    boolean existsByAppointmentDateAndStatusAndUserIdNot(
            LocalDateTime appointmentDate,
            AppointmentStatus status,
            Long userId
    );

    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.status = 'BOOKED' AND a.user.id <> :userId AND (:start < a.endTime AND :end > a.startTime)")
    boolean existsOverlap(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("userId") Long userId
    );

    List<Appointment> findByUserIdAndAppointmentDateAfter(
            Long userId, LocalDateTime now);

    List<Appointment> findByUserIdAndAppointmentDateBefore(
            Long userId, LocalDateTime now);

    List<Appointment> findByUserIdAndStatus(
            Long userId, AppointmentStatus status);

    // 🔹 Scheduler reminder
    // 🔹 Scheduler reminder
    @Query("""
        SELECT a FROM Appointment a
        JOIN FETCH a.user
        JOIN FETCH a.service
        LEFT JOIN FETCH a.stylist
        WHERE a.reminderSent = false
        AND a.status = com.haircraft.backend.Entity.AppointmentStatus.BOOKED
        AND a.appointmentDate <= :threshold
    """)
    List<Appointment> findAppointmentsNeedingReminder(
            @Param("threshold") LocalDateTime threshold
    );

    // 🔹 Expired appointments
    @Query("""
        SELECT a FROM Appointment a
        WHERE a.appointmentDate < :now
        AND a.status <> com.haircraft.backend.Entity.AppointmentStatus.COMPLETED
        AND a.status <> com.haircraft.backend.Entity.AppointmentStatus.CANCELLED
    """)
    List<Appointment> findExpiredAppointments(
            @Param("now") LocalDateTime now
    );

    List<Appointment> findByStatusAndAppointmentDateBefore(
            AppointmentStatus status,
            LocalDateTime time
    );

    List<Appointment> findByUser_Id(Long id);

    // 🔹 Completed appointments in date range
    List<Appointment> findByStatusAndAppointmentDateBetween(
            AppointmentStatus completed,
            LocalDateTime start,
            LocalDateTime end
    );

    // ⭐ TOP SERVICE
    

    // 👤 TOP CUSTOMER
    

    long countByStatus(AppointmentStatus status);

    // Fetch completed only
    List<Appointment> findByStatus(AppointmentStatus status);

    @Query("""
        SELECT a
        FROM Appointment a
        WHERE a.appointmentDate >= :start
        AND a.appointmentDate < :end
    """)
    List<Appointment> findAppointmentsByDate(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
        SELECT COUNT(a) > 0
        FROM Appointment a
        WHERE a.stylist.id = :stylistId
          AND a.status = com.haircraft.backend.Entity.AppointmentStatus.BOOKED
          AND (
               :start < a.endTime
           AND :end > a.startTime
          )
    """)
    boolean hasOverlap(
            Long stylistId,
            LocalDateTime start,
            LocalDateTime end
    );

    @Query("""
        SELECT COUNT(a) > 0 FROM Appointment a
        WHERE a.stylist = :stylist
        AND a.appointmentDate = :date
        AND (
            (:start < a.endTime AND :end > a.startTime)
        )
    """)
    boolean existsByStylistAndDateAndTimeOverlap(
            @Param("stylist") Stylist stylist,
            @Param("date") LocalDateTime date,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    // ✅ FIXED: default method (Spring will IGNORE this)
    default String getService() {
        return null;
    }

	List<Appointment> findByReminderSentFalseAndStatus(AppointmentStatus booked);
	
	// ✅ FIXED: explicit JPQL query
    @Query("""
        select a from Appointment a
        join fetch a.user
        join fetch a.service
        where a.id = :id
    """)
    Optional<Appointment> findByIdWithUserAndService(@Param("id") Long id);
    // TEMPORARY COMMENT
    @Query("""
            SELECT s.name, COUNT(a)
            FROM Appointment a
            JOIN a.service s
            WHERE a.status = :status
            AND a.appointmentDate >= :start
            AND a.appointmentDate <= :end
            GROUP BY s.name
            ORDER BY COUNT(a) DESC
        """)
    List<Object[]> findTopService(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("status") AppointmentStatus status
    );

    @Query("""
            SELECT u.name, COUNT(a)
            FROM Appointment a
            JOIN a.user u
            WHERE a.status = :status
            AND a.appointmentDate >= :start
            AND a.appointmentDate <= :end
            GROUP BY u.name
            ORDER BY COUNT(a) DESC
        """)
    List<Object[]> findTopCustomer(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("status") AppointmentStatus status
    );
    @Query("""
    SELECT a FROM Appointment a
    LEFT JOIN FETCH a.service
    LEFT JOIN FETCH a.user
    LEFT JOIN FETCH a.stylist
    ORDER BY a.appointmentDate DESC
""")
List<Appointment> findAllWithDetails();

    // Find appointments by stylist and date range
    @Query("""
        SELECT a FROM Appointment a
        LEFT JOIN FETCH a.service
        LEFT JOIN FETCH a.user
        WHERE a.stylist = :stylist
        AND a.appointmentDate >= :start
        AND a.appointmentDate < :end
        ORDER BY a.appointmentDate ASC
    """)
    List<Appointment> findByStylistAndDateRange(
        @Param("stylist") Stylist stylist,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );

}
