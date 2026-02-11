package com.haircraft.backend.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.haircraft.backend.Entity.Appointment;
import com.haircraft.backend.Entity.AppointmentHistory;
import com.haircraft.backend.Entity.AppointmentStatus;
import com.haircraft.backend.dto.PaymentSuccessDto;
import com.haircraft.backend.repository.AppointmentHistoryRepository;
import com.haircraft.backend.repository.AppointmentRepository;
import com.haircraft.backend.service.EmailService;
import com.haircraft.backend.service.RazorpayService;
import com.razorpay.Order;
import com.razorpay.Utils;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final RazorpayService razorpayService;
    private final AppointmentRepository appointmentRepo;
    private final AppointmentHistoryRepository historyRepo;
    private final EmailService emailService;

    public PaymentController(
            RazorpayService razorpayService,
            AppointmentRepository appointmentRepo,
            AppointmentHistoryRepository historyRepo,
            EmailService emailService
    ) {
        this.razorpayService = razorpayService;
        this.appointmentRepo = appointmentRepo;
        this.historyRepo = historyRepo;
        this.emailService = emailService;
    }

    /* =========================
       CREATE ORDER
    ========================= */
    @PostMapping(
        value = "/create-order",
        consumes = "application/json",
        produces = "application/json"
    )
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body) {
        try {
            double amount = Double.parseDouble(body.get("amount").toString());

            Order order = razorpayService.createOrder(amount);

            Map<String, Object> response = new HashMap<>();
            response.put("id", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to create order");
        }
    }

    /* =========================
       VERIFY PAYMENT
    ========================= */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, Object> payload) {
        try {
            System.out.println("💳 VERIFY PAYMENT HIT: " + payload);

            String razorpayOrderId = (String) payload.get("razorpay_order_id");
            String razorpayPaymentId = (String) payload.get("razorpay_payment_id");
            String razorpaySignature = (String) payload.get("razorpay_signature");

            // Verify signature manually for transparency
            String secret = razorpayService.getKeySecret();
            String data = razorpayOrderId + "|" + razorpayPaymentId;
            
            String generatedSignature = "";
            try {
                javax.crypto.spec.SecretKeySpec signingKey = new javax.crypto.spec.SecretKeySpec(secret.getBytes(), "HmacSHA256");
                javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
                mac.init(signingKey);
                byte[] rawHmac = mac.doFinal(data.getBytes());
                StringBuilder sb = new StringBuilder();
                for (byte b : rawHmac) {
                    sb.append(String.format("%02x", b));
                }
                generatedSignature = sb.toString();
            } catch (Exception ex) {
                return ResponseEntity.status(500).body("Signature calculation error");
            }

            if (!generatedSignature.equals(razorpaySignature)) {
                System.err.println("❌ SIGNATURE MISMATCH!");
                System.err.println("Expected: " + generatedSignature);
                System.err.println("Received: " + razorpaySignature);
                return ResponseEntity.badRequest().body("Payment verification failed: Signature mismatch.");
            }

            // Extract IDs
            java.util.List<Long> ids = new java.util.ArrayList<>();
            if (payload.containsKey("appointmentIds")) {
                Object obj = payload.get("appointmentIds");
                if (obj instanceof java.util.List) {
                    for (Object idObj : (java.util.List<?>) obj) {
                        ids.add(Long.parseLong(idObj.toString()));
                    }
                }
            } else if (payload.containsKey("appointmentId")) {
                ids.add(Long.parseLong(payload.get("appointmentId").toString()));
            }

            System.out.println("Processing IDs: " + ids);

            for (Long id : ids) {
                Appointment appointment = appointmentRepo
                        .findByIdWithUserAndService(id)
                        .orElse(null);

                if (appointment != null) {
                    appointment.setPaymentStatus("PAID");
                    appointment.setRazorpayPaymentId(razorpayPaymentId);
                    appointment.setStatus(AppointmentStatus.COMPLETED);
                    appointmentRepo.save(appointment);

                    // History
                    AppointmentHistory history = new AppointmentHistory();
                    history.setAppointment(appointment);
                    history.setStatus(AppointmentStatus.COMPLETED);
                    history.setChangedAt(LocalDateTime.now());
                    historyRepo.save(history);

                    // Email (optional/async)
                    try {
                        emailService.sendPaymentReceipt(appointment);
                    } catch (Exception e) {
                        System.err.println("Email failed for appt " + id);
                    }
                }
            }

            return ResponseEntity.ok(Map.of("message", "Payment verified and appointments updated"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error verifying payment: " + e.getMessage());
        }
    }

    /* =========================
       PAYMENT SUCCESS
    ========================= */
   
    @PostMapping("/payment/success")
    public ResponseEntity<?> paymentSuccess(@RequestBody PaymentSuccessDto dto) {

        System.out.println("🔥 PAYMENT SUCCESS HIT");
        System.out.println("Appointment ID: " + dto.getAppointmentId());

        Appointment appt = appointmentRepo
                .findByIdWithUserAndService(dto.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appt.setPaymentStatus("PAID");
        appt.setRazorpayPaymentId(dto.getRazorpayPaymentId());
        appt.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepo.save(appt);
        

        // save history
        AppointmentHistory history = new AppointmentHistory();
        history.setAppointment(appt);
        history.setStatus(AppointmentStatus.COMPLETED);
        history.setChangedAt(LocalDateTime.now());
        historyRepo.save(history);

        // send email
        emailService.sendPaymentReceipt(appt);

        return ResponseEntity.ok("Payment successful");
    }

}

