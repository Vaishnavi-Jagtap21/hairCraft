package com.haircraft.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.time.YearMonth;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.haircraft.backend.Entity.Appointment;
import com.haircraft.backend.Entity.AppointmentHistory;
import com.haircraft.backend.Entity.AppointmentStatus;
import com.haircraft.backend.Entity.User;
import com.haircraft.backend.Exception.SlotAlreadyBookedException;
import com.haircraft.backend.dto.AppointmentDTO;
import com.haircraft.backend.dto.AppointmentHistoryDTO;
import com.haircraft.backend.dto.DashboardHistoryResponse;
import com.haircraft.backend.dto.DashboardOverviewResponse;
import com.haircraft.backend.repository.AppointmentHistoryRepository;
import com.haircraft.backend.repository.AppointmentRepository;
import com.haircraft.backend.repository.UserRepository;
import com.haircraft.backend.service.TimelineService;
import com.haircraft.backend.service.NotificationService;
import com.razorpay.Refund;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepo;
    private final AppointmentHistoryRepository historyRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;
    private final TimelineService timelineService;
    private final RazorpayService razorpayService;
    private final EmailService emailService;
    private final com.haircraft.backend.repository.WaitlistRepository waitlistRepo;
    
    @PersistenceContext
    private EntityManager entityManager;

    public AppointmentService(
            AppointmentRepository appointmentRepo,
            AppointmentHistoryRepository historyRepo,
            UserRepository userRepo,
            NotificationService notificationService,
            TimelineService timelineService,
            RazorpayService razorpayService,
            EmailService emailService,
            com.haircraft.backend.repository.WaitlistRepository waitlistRepo
    ) {
        this.appointmentRepo = appointmentRepo;
        this.historyRepo = historyRepo;
        this.userRepo = userRepo;
        this.notificationService = notificationService;
        this.timelineService = timelineService;
        this.razorpayService = razorpayService;
        this.emailService = emailService;
        this.waitlistRepo = waitlistRepo;
    }

    // ================= USER =================

    public List<Appointment> getAllAppointments(Long userId) {
        return appointmentRepo.findByUserId(userId);
    }

    public List<Appointment> getUpcomingAppointments(Long userId) {
        return appointmentRepo.findByUserIdAndAppointmentDateAfter(
                userId, LocalDateTime.now());
    }

    public List<Appointment> getCompletedAppointments(Long userId) {
        return appointmentRepo.findByUserIdAndStatus(
                userId, AppointmentStatus.COMPLETED);
    }

    // ================= SAVE =================

    @Transactional
    public Appointment save(Appointment appointment) {

        boolean exists = appointmentRepo.existsByAppointmentDateAndStatus(
                appointment.getAppointmentDate(),
                AppointmentStatus.BOOKED
        );

        if (exists) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Slot already booked"
            );
        }

        if (appointment.getStylist() != null &&
            appointment.getStartTime() != null &&
            appointment.getEndTime() != null) {

            boolean slotExists =
                    appointmentRepo.existsByStylistAndDateAndTimeOverlap(
                            appointment.getStylist(),
                            appointment.getAppointmentDate(),
                            appointment.getStartTime(),
                            appointment.getEndTime()
                    );

            if (slotExists) {
                throw new SlotAlreadyBookedException(
                        "Slot already booked. Please choose another time."
                );
            }
        }

        return appointmentRepo.save(appointment);
    }

    // ================= STATUS =================

   

    // ================= ADMIN =================

    public List<Appointment> getAllAppointments() {
        return appointmentRepo.findAll();
    }

    public DashboardOverviewResponse getDashboardStats() {

        long users = userRepo.count();
        long appointments = appointmentRepo.count();
        long pending = appointmentRepo.countByStatus(AppointmentStatus.BOOKED);
        long completed = appointmentRepo.countByStatus(AppointmentStatus.COMPLETED);

        return new DashboardOverviewResponse(
                users,
                appointments,
                pending,
                completed
        );
    }

    @Transactional(readOnly = true)
    public DashboardHistoryResponse getHistoryDashboardStats(String range) {
        System.out.println("DASHBOARD STATS REQUESTED FOR RANGE: " + range);
        LocalDateTime start;
        LocalDateTime end = LocalDateTime.now();

        switch (range) {
            case "TODAY" -> start = LocalDate.now().atStartOfDay();
            case "MONTH" -> start = YearMonth.now().atDay(1).atStartOfDay();
            default -> start = Year.now().atDay(1).atStartOfDay();
        }

        try {
            System.out.println("DEBUG: Step 1 - Counts");
            Long completedCount = 0L;
            Double positiveRevenue = 0.0;
            try {
                completedCount = historyRepo.countByStatusAndRange(AppointmentStatus.COMPLETED, start, end);
                positiveRevenue = historyRepo.sumAmountByStatusAndRange(AppointmentStatus.COMPLETED, start, end);
                if (positiveRevenue == null) positiveRevenue = 0.0;
                System.out.println("DEBUG: Counts Success");
            } catch (Exception e) {
                System.out.println("DEBUG: Step 1 Failed: " + e.getMessage());
                e.printStackTrace();
            }

            double revenue = positiveRevenue;

            System.out.println("DEBUG: Step 3 - Top Service");
            String topServiceName = "—";
            try {
                List<Object[]> topServices = historyRepo.findTopServiceByHistory(AppointmentStatus.COMPLETED, start, end);
                if (topServices != null && !topServices.isEmpty() && topServices.get(0).length > 0 && topServices.get(0)[0] != null) {
                    topServiceName = topServices.get(0)[0].toString();
                }
                System.out.println("DEBUG: Top Service Success");
            } catch (Exception e) {
                System.out.println("DEBUG: Step 3 Failed: " + e.getMessage());
            }

            System.out.println("DEBUG: Step 4 - Top Customer");
            String topCustomerName = "—";
            try {
                List<Object[]> topCustomers = historyRepo.findTopCustomerByHistory(AppointmentStatus.COMPLETED, start, end);
                if (topCustomers != null && !topCustomers.isEmpty() && topCustomers.get(0).length > 0 && topCustomers.get(0)[0] != null) {
                    topCustomerName = topCustomers.get(0)[0].toString();
                }
                System.out.println("DEBUG: Top Customer Success");
            } catch (Exception e) {
                System.out.println("DEBUG: Step 4 Failed: " + e.getMessage());
            }

            System.out.println("DEBUG: Step 5 - History Items");
            List<AppointmentHistoryDTO> items = new java.util.ArrayList<>();
            try {
                items = historyRepo.findByStatusInAndChangedAtBetween(
                        List.of(
                            AppointmentStatus.COMPLETED, 
                            AppointmentStatus.REFUNDED, 
                            AppointmentStatus.CANCELLED_BY_ADMIN,
                            AppointmentStatus.CANCELLED,
                            AppointmentStatus.REJECTED
                        ),
                        start, end)
                        .stream()
                        .map(this::toHistoryDTO)
                        .filter(java.util.Objects::nonNull)
                        .sorted((a, b) -> {
                            if (a.getChangedAt() == null || b.getChangedAt() == null) return 0;
                            return b.getChangedAt().compareTo(a.getChangedAt());
                        })
                        .toList();
                System.out.println("DEBUG: History Items Success, count: " + items.size());
            } catch (Exception e) {
                System.out.println("DEBUG: Step 5 Failed: " + e.getMessage());
                e.printStackTrace();
            }

            return new DashboardHistoryResponse(
                    completedCount != null ? completedCount.intValue() : 0,
                    revenue,
                    topServiceName,
                    topCustomerName,
                    items
            );
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR IN DASHBOARD STATS: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Dashboard load failed: " + e.getMessage());
        }
    }

    // ================= HISTORY =================

    @Transactional(readOnly = true)
    public List<AppointmentHistoryDTO> getHistoryByUserDTO(Long userId) {

        return historyRepo.findByAppointment_User_Id(userId)
                .stream()
                .map(this::toHistoryDTO)
                .toList();
    }

    // ================= USER DTO =================

    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsForUser(Long userId) {

        return appointmentRepo.findByUserId(userId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ================= HISTORY SAVE =================

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void saveHistory(Appointment appointment, AppointmentStatus status) {
        try {
            AppointmentHistory history = new AppointmentHistory();
            history.setAppointment(appointment);
            history.setStatus(status);
            history.setChangedAt(LocalDateTime.now());
            historyRepo.save(history);
        } catch (Exception e) {
            System.err.println("Failed to save history: " + e.getMessage());
        }
    }

    // ================= DTO CONVERSION =================

    private AppointmentDTO toDTO(Appointment a) {
        try {
            AppointmentDTO dto = new AppointmentDTO();
            dto.setId(a.getId());

            dto.setStatus(
                    a.getStatus() != null
                            ? a.getStatus().name()
                            : AppointmentStatus.PENDING.name()
            );

            dto.setPaymentStatus(
                    a.getPaymentStatus() != null
                            ? a.getPaymentStatus()
                            : "PENDING"
            );

            dto.setAmount(a.getAmount());

            if (a.getService() != null) {
                dto.setServiceName(a.getService().getName());
                dto.setDuration(a.getService().getDuration());
            }

            if (a.getStylist() != null) {
                dto.setStylistName(a.getStylist().getName());
            }

            if (a.getUser() != null) {
                String name = a.getUser().getName();
                dto.setCustomerName(name);
                dto.setUserName(name);
            }

            if (a.getAppointmentDate() != null) {
                // Full ISO string so frontend New Date() works for both date and time
                dto.setAppointmentDate(a.getAppointmentDate().toString());
                dto.setAppointmentTime(
                        a.getAppointmentDate().toLocalTime().toString());
            }

            if (a.getEndTime() != null) {
                dto.setEndTime(
                        a.getEndTime().toLocalTime().toString());
            }

            dto.setRefundStatus(a.getRefundStatus());
            dto.setRefundId(a.getRefundId());

            return dto;
        } catch (Exception e) {
            System.err.println("Error converting Appointment ID " + a.getId() + " to DTO: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

   

	// ================= ADMIN HISTORY =================

	@Transactional(readOnly = true)
	public List<AppointmentHistory> findAll() {
	    return historyRepo.findAll();
	}


	// ================= HISTORY BY USER (ENTITY) =================

	@Transactional(readOnly = true)
	public List<AppointmentHistory> findByAppointment_User_Id(Long userId) {
	    return historyRepo.findByAppointment_User_Id(userId);
	}


	// ================= HISTORY DTO BY USER =================

	@Transactional(readOnly = true)
	public List<AppointmentHistoryDTO> getHistoryDTOByUser(Long userId) {

	    return historyRepo.findByAppointment_User_Id(userId)
	            .stream()
	            .map(this::toHistoryDTO)
	            .toList();
	}
	

	@Transactional(readOnly = true)
	public List<AppointmentDTO> getAllAppointmentsDTO() {
	    return appointmentRepo.findAllWithDetails()
	            .stream()
	            .map(this::convertToDTO)
	            .toList();
	}

	public AppointmentDTO convertToDTO(Appointment a) {
        return toDTO(a);
    }
	
    @Transactional
    public AppointmentDTO updateStatus(Long id, AppointmentStatus status) {

        System.out.println("AppointmentService: Updating status for " + id + " to " + status);
        Appointment appointment = appointmentRepo.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));

        try {
            if (appointment.getStatus() == AppointmentStatus.CANCELLED_BY_ADMIN || 
                appointment.getStatus() == AppointmentStatus.REFUNDED) {
                System.out.println("AppointmentService: Status is already terminal: " + appointment.getStatus());
                return convertToDTO(appointment);
            }

            AppointmentStatus previousStatus = appointment.getStatus();
            appointment.setStatus(status);
            
            // Explicit save to ensure persistence context is aware
            appointment = appointmentRepo.save(appointment);
            System.out.println("AppointmentService: Status persisted to " + status);

            // 1. AUTO REFUND FOR ADMIN CANCELLATION OR REJECTION via Razorpay
            if ((status == AppointmentStatus.CANCELLED_BY_ADMIN || status == AppointmentStatus.REJECTED) && 
                "PAID".equalsIgnoreCase(appointment.getPaymentStatus()) &&
                appointment.getRazorpayPaymentId() != null) {
                
                System.out.println("AppointmentService: Processing Razorpay refund for " + appointment.getRazorpayPaymentId());
                try {
                    com.razorpay.Refund refund = razorpayService.refund(appointment.getRazorpayPaymentId());
                    
                    String refundId = refund.get("id");
                    String refundStatus = refund.get("status");
                    
                    if (refundId != null) appointment.setRefundId(refundId);
                    if (refundStatus != null) appointment.setRefundStatus(refundStatus);
                    
                    if ("processed".equalsIgnoreCase(refundStatus)) {
                         appointment.setPaymentStatus("REFUNDED");
                         appointment.setStatus(AppointmentStatus.REFUNDED); // Update status to REFUNDED if fully processed
                    } else {
                        appointment.setPaymentStatus("REFUND_INITIATED");
                    }
                    
                    String message = "Your appointment has been " + (status == AppointmentStatus.REJECTED ? "rejected" : "cancelled") + 
                                     " by admin. Refund " + ("processed".equalsIgnoreCase(refundStatus) ? "completed" : "initiated") + ".";
                    
                    try {
                        notificationService.create(appointment.getUser(), message);
                        emailService.sendEmailusera(appointment.getUser().getEmail(), "Appointment Refund Update", message);
                    } catch (Exception ex) {
                        System.err.println("Notification failed: " + ex.getMessage());
                    }

                } catch (Exception e) {
                    System.err.println("Razorpay refund failed: " + e.getMessage());
                    appointment.setRefundStatus("FAILED");
                    // Don't change payment status, let admin handle manual refund
                }
            } 
            // 2. NON-PAID REJECTION/CANCELLATION NOTIFICATION
            else if ((status == AppointmentStatus.REJECTED || status == AppointmentStatus.CANCELLED_BY_ADMIN) && 
                     !"PAID".equalsIgnoreCase(appointment.getPaymentStatus())) {
                 try {
                    String message = "Your appointment has been " + (status == AppointmentStatus.REJECTED ? "rejected" : "cancelled") + " by admin.";
                    notificationService.create(appointment.getUser(), message);
                    emailService.sendEmailusera(appointment.getUser().getEmail(), "Appointment Update", message);
                 } catch (Exception ex) {
                     System.err.println("Notification failed: " + ex.getMessage());
                 }
            }

            // 3. LEGACY REFUND / REVENUE REVERSAL (Handle cases not covered above, e.g. COMPLETED -> Cancelled)
            boolean isCancelledStatus = (status == AppointmentStatus.CANCELLED || 
                                         status == AppointmentStatus.REJECTED || 
                                         status == AppointmentStatus.CANCELLED_BY_ADMIN);
                                         
            boolean notYetRefunded = !"REFUNDED".equalsIgnoreCase(appointment.getPaymentStatus()) && 
                                     !"REFUND_INITIATED".equalsIgnoreCase(appointment.getPaymentStatus());

            if (isCancelledStatus && notYetRefunded) {
                 boolean wasPaid = "PAID".equalsIgnoreCase(appointment.getPaymentStatus());
                 boolean wasRevenue = previousStatus == AppointmentStatus.COMPLETED;

                 if (wasPaid || wasRevenue) {
                     appointment.setPaymentStatus("REFUNDED"); 
                 }
            }

            // 4. LOYALTY & WALLET CASHBACK
            if (status == AppointmentStatus.COMPLETED && previousStatus != AppointmentStatus.COMPLETED) {
                User user = appointment.getUser();
                if (user != null && appointment.getAmount() != null) {
                    double cashback = appointment.getAmount() * 0.05;
                    user.setWalletBalance(user.getWalletBalance() + cashback);
                    int points = (int)(appointment.getAmount() / 100);
                    user.setLoyaltyPoints(user.getLoyaltyPoints() + points);
                    userRepo.save(user);
                    try {
                        notificationService.create(user, "Congratulations! You earned cashback.");
                    } catch (Exception e) {}
                }
            }
            
            // 5. WAITLIST NOTIFICATIONS
            if (status == AppointmentStatus.CANCELLED || 
                status == AppointmentStatus.CANCELLED_BY_ADMIN || 
                status == AppointmentStatus.REJECTED || 
                status == AppointmentStatus.REFUNDED) {
                triggerWaitlistNotifications(appointment);
            }

            // Final save (redundant but safe)
            appointment = appointmentRepo.save(appointment);

            // History & Timeline
            // TODO: Uncomment after fixing database: ALTER TABLE appointment_history MODIFY COLUMN status VARCHAR(50) NOT NULL;
            // saveHistory(appointment, appointment.getStatus());
            try {
                timelineService.addEntry(appointment, status);
            } catch (Exception e) {}
            
            if (entityManager != null) {
                try { entityManager.flush(); } catch (Exception e) { System.err.println("Flush failed: " + e.getMessage()); }
            }

            return convertToDTO(appointment);

        } catch (Exception e) {
            System.err.println("CRITICAL ERROR IN UPDATE STATUS: " + e.getMessage());
            e.printStackTrace();
            return convertToDTO(appointment);
        }
    }

    private void triggerWaitlistNotifications(Appointment a) {
        try {
            if (waitlistRepo == null) {
                System.err.println("WARN: WaitlistRepo is NOT injected. Skipping notifications.");
                return;
            }

            if (a.getStylist() == null || a.getAppointmentDate() == null) return;
            
            String timeString = a.getAppointmentDate().toLocalTime().toString();
            if (timeString.length() > 5) {
                timeString = timeString.substring(0, 5);
            }

            var waitlist = waitlistRepo.findByStylist_IdAndPreferredDateAndPreferredTimeAndNotifiedFalse(
                a.getStylist().getId(), 
                a.getAppointmentDate().toLocalDate().atStartOfDay(), 
                timeString
            );
            
            for (var entry : waitlist) {
                try {
                    notificationService.create(
                        entry.getUser(),
                        "Good news! A slot with " + a.getStylist().getName() + " on " + 
                        a.getAppointmentDate().toLocalDate() + " at " + entry.getPreferredTime() + 
                        " has just opened up. Book it now!"
                    );
                    entry.setNotified(true);
                    waitlistRepo.save(entry);
                } catch (Exception inner) {
                    System.err.println("Failed to notify waitlist user: " + inner.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println("CRITICAL: Error triggering waitlist notifications. Proceeding with update.");
            e.printStackTrace();
        }
    }

    @Transactional(readOnly = true)
    public List<AppointmentHistoryDTO> getHistoryListByRange(String rangeStr) {
        LocalDateTime start;
        LocalDateTime end = LocalDateTime.now();

        switch (rangeStr) {
            case "TODAY" -> start = LocalDate.now().atStartOfDay();
            case "MONTH" -> start = YearMonth.now().atDay(1).atStartOfDay();
            default -> start = Year.now().atDay(1).atStartOfDay();
        }

        return historyRepo.findByStatusInAndChangedAtBetween(List.of(AppointmentStatus.COMPLETED), start, end)
                .stream()
                .map(this::toHistoryDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AppointmentDTO getAppointmentDTO(Long id) {
        return appointmentRepo.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
    }

    private AppointmentHistoryDTO toHistoryDTO(AppointmentHistory h) {
        if (h == null || h.getAppointment() == null) return null;
        
        String serviceName = "N/A";
        if (h.getAppointment().getService() != null) {
            serviceName = h.getAppointment().getService().getName();
        }

        return new AppointmentHistoryDTO(
                h.getAppointment().getId(),
                serviceName,
                (h.getAppointment().getUser() != null) ? h.getAppointment().getUser().getName() : "N/A",
                (h.getAppointment().getAppointmentDate() != null) ? h.getAppointment().getAppointmentDate().toLocalDate().toString() : "N/A",
                (h.getAppointment().getAppointmentDate() != null) ? h.getAppointment().getAppointmentDate().toLocalTime().toString() : "N/A",
                (h.getStatus() != null) ? h.getStatus().name() : "N/A",
                h.getAppointment().getAmount(),
                h.getChangedAt()
        );
    }
}
