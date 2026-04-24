package com.example.pfeporject.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendVerificationEmail(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
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
    }

    public void sendPasswordResetCode(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
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
    }
}
