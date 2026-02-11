package com.haircraft.backend.service;

import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.haircraft.backend.Entity.Appointment;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    // MUST MATCH spring.mail.username
    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // =============================
    // CORE EMAIL METHOD
    // =============================
    private void sendEmail(String to, String subject, String body) {

        System.out.println("📨 SENDING EMAIL TO: " + to);
        System.out.println("📤 FROM EMAIL: " + fromEmail);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        message.setFrom(fromEmail);

        mailSender.send(message);
    }

    // =============================
    // APPOINTMENT REMINDER EMAIL
    // =============================
    public void sendAppointmentReminder(Appointment appt) {

        String to = appt.getUser().getEmail();
        String subject = "Appointment Reminder – HairCraft";

        DateTimeFormatter dateFormatter =
                DateTimeFormatter.ofPattern("EEEE, dd MMM yyyy");

        DateTimeFormatter timeFormatter =
                DateTimeFormatter.ofPattern("hh:mm a");

        String customerName = appt.getUser().getName();
        String stylistName = appt.getStylist() != null
                ? appt.getStylist().getName()
                : "Assigned Specialist";

        String date = appt.getAppointmentDate().format(dateFormatter);
        String time = appt.getAppointmentDate().format(timeFormatter);
        String serviceName = appt.getService().getName();

        String body = """
            Dear %s,

            Greetings from HairCraft!

            This is a gentle reminder regarding your upcoming appointment with us.
            We are pleased to have the opportunity to serve you.

            Appointment Details:

            • Specialist Name : %s
            • Appointment Date : %s
            • Appointment Time : %s
            • Service : %s

            Kindly arrive at least 10 minutes before your scheduled time to ensure a smooth experience.
            If you are unable to attend, we request you to cancel or reschedule your appointment through the application at your convenience.

            Thank you for choosing HairCraft. We look forward to welcoming you and providing you with the best service experience.

            For any assistance, please feel free to contact our support team.

            Warm regards,
            HairCraft Appointment Team
            HairCraft Salon & Services
            vmjagtap2004@gmail.com
        """.formatted(customerName, stylistName, date, time, serviceName);

        sendEmail(to, subject, body);
    }

    // =============================
    // PASSWORD RESET OTP EMAIL
    // =============================
    public void sendResetOtp(String email, String otp) {

        String subject = "Password Reset OTP – HairCraft";

        String body = """
            Hello,

            We received a request to reset your HairCraft account password.

            Your One-Time Password (OTP) is: %s

            ⏳ This OTP is valid for the next 10 minutes.
            For your security, please do not share this OTP with anyone.

            If you did not request a password reset, please ignore this email. Your account will remain secure.

            Thank you for choosing HairCraft.

            Regards,
            HairCraft Team
        """.formatted(otp);

        sendEmail(email, subject, body);
    }

    // =============================
    // PAYMENT RECEIPT EMAIL
    // =============================
    public void sendPaymentReceipt(Appointment appt) {

        System.out.println("📧 SENDING PAYMENT RECEIPT EMAIL");

        String to = appt.getUser().getEmail();

        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

        String subject = "Payment Receipt – HairCraft";

        String body = """
            Dear %s,

            Thank you for your payment. We are happy to inform you that your payment has been successfully completed ✅

            Payment Details
            -------------------------
            Service        : %s
            Appointment    : %s
            Amount Paid    : ₹%.2f
            Payment Status : PAID

            Your appointment has been confirmed. We sincerely appreciate your trust in HairCraft and look forward to serving you.

            If you have any questions or require assistance, please feel free to contact us.

            Warm regards,
            HairCraft Team
        """.formatted(
            appt.getUser().getName(),
            appt.getService().getName(),
            appt.getAppointmentDate().format(formatter),
            appt.getAmount()
        );

        sendEmail(to, subject, body);
    }

    // =============================
    // GENERIC EMAIL METHOD (PUBLIC)
    // =============================
    public void sendEmailusera(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        message.setFrom("HairCraft <vmjagtap2004@gmail.com>");
        mailSender.send(message);
    }

    // =============================
    // ADMIN REPLY EMAIL
    // =============================
    public void sendAdminReply(String to, String subject, String message) {

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(to);
        mail.setSubject(subject);
        mail.setText("""
            Hello,

            %s

            —
            HairCraft Support Team
        """.formatted(message));

        mail.setFrom("HairCraft Support <vmjagtap2004@gmail.com>");

        mailSender.send(mail);
    }
}
