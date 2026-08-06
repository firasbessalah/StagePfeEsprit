package com.example.pfeporject.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:firasbessalahboos@gmail.com}")
    private String fromEmail;

    public void sendVerificationEmail(String toEmail, String code) {
        System.out.println(">>> VERIFICATION CODE FOR " + toEmail + " IS: " + code + " <<<");
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Vérification de votre adresse email");
            message.setText(
                    "Bonjour,\n\n"
                    + "Merci de vous être inscrit ! Voici votre code de vérification :\n\n"
                    + code + "\n\n"
                    + "Saisissez ce code sur la page de vérification pour activer votre compte.\n"
                    + "Ce code expire dans 15 minutes.\n\n"
                    + "Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.\n\n"
                    + "Cordialement,\n"
                    + "L'équipe PFE"
            );

            mailSender.send(message);
            System.out.println("Email successfully sent to " + toEmail + " via Brevo SMTP.");
        } catch (Exception e) {
            System.err.println("SMTP Warning: Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }

    public void sendPasswordResetCode(String toEmail, String code) {
        System.out.println(">>> PASSWORD RESET CODE FOR " + toEmail + " IS: " + code + " <<<");
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Réinitialisation de votre mot de passe");
            message.setText(
                    "Bonjour,\n\n"
                    + "Vous avez demandé la réinitialisation de votre mot de passe. Voici votre code :\n\n"
                    + code + "\n\n"
                    + "Saisissez ce code sur la page de réinitialisation pour continuer.\n"
                    + "Ce code expire dans 15 minutes.\n\n"
                    + "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.\n\n"
                    + "Cordialement,\n"
                    + "L'équipe PFE"
            );

            mailSender.send(message);
            System.out.println("Reset email successfully sent to " + toEmail + " via Brevo SMTP.");
        } catch (Exception e) {
            System.err.println("SMTP Warning: Failed to send reset email to " + toEmail + ": " + e.getMessage());
        }
    }

    public void sendAlerteLogementEmail(com.example.pfeporject.entity.User user, com.example.pfeporject.entity.Annonce annonce) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Alerte Logement : Nouvelle annonce correspondante !");
            message.setText(
                    "Bonjour " + user.getPrenom() + ",\n\n"
                    + "Une nouvelle annonce correspondant à vos critères d'alerte logement vient d'être validée sur notre plateforme.\n\n"
                    + "Titre : " + annonce.getTitre() + "\n"
                    + "Localisation : " + annonce.getLocalisation() + "\n"
                    + "Prix : " + annonce.getPrix() + " TND\n\n"
                    + "Connectez-vous pour consulter cette nouvelle annonce !\n\n"
                    + "Cordialement,\n"
                    + "L'équipe PFE"
            );

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("SMTP Warning: Failed to send housing alert email: " + e.getMessage());
        }
    }
}
