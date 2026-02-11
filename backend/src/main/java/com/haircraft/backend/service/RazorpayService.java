package com.haircraft.backend.service;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;

@Service
public class RazorpayService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    /* =========================
       CREATE RAZORPAY ORDER
       amount MUST be in PAISE
    ========================= */
    public Order createOrder(double amountInPaise) throws Exception {

        if (keyId == null || keyId.isBlank()) {
            throw new RuntimeException("Razorpay KEY ID is missing");
        }

        if (keySecret == null || keySecret.isBlank()) {
            throw new RuntimeException("Razorpay KEY SECRET is missing");
        }

        if (amountInPaise <= 0) {
            throw new IllegalArgumentException("Invalid amount");
        }

        RazorpayClient client =
                new RazorpayClient(keyId.trim(), keySecret.trim());

        JSONObject options = new JSONObject();
        options.put("amount", (int) amountInPaise); // ✅ ALREADY PAISE
        options.put("currency", "INR");
        options.put("receipt", "rcpt_" + System.currentTimeMillis());

        return client.orders.create(options);
    }

    /* =========================
       REFUND RAZORPAY PAYMENT
    ========================= */
    public com.razorpay.Refund refund(String paymentId) throws Exception {
        RazorpayClient client =
                new RazorpayClient(keyId.trim(), keySecret.trim());

        JSONObject options = new JSONObject();
        return client.payments.refund(paymentId, options);
    }

    /* =========================
       USED FOR SIGNATURE VERIFY
    ========================= */
    public String getKeySecret() {
        return keySecret != null ? keySecret.trim() : null;
    }
}
