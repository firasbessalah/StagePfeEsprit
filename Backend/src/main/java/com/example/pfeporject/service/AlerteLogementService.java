package com.example.pfeporject.service;

import com.example.pfeporject.dto.AlerteLogementDTO;
import com.example.pfeporject.entity.AlerteLogement;
import com.example.pfeporject.entity.Annonce;
import com.example.pfeporject.entity.Notification.TypeNotification;
import com.example.pfeporject.entity.User;
import com.example.pfeporject.repository.AlerteLogementRepository;
import com.example.pfeporject.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlerteLogementService {

    private final AlerteLogementRepository alerteLogementRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public List<AlerteLogementDTO> getMyAlerts() {
        User currentUser = getCurrentUser();
        return alerteLogementRepository.findByUser(currentUser)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public AlerteLogementDTO createAlert(AlerteLogementDTO dto) {
        User currentUser = getCurrentUser();
        AlerteLogement alerte = AlerteLogement.builder()
                .user(currentUser)
                .localisation(dto.getLocalisation())
                .prixMax(dto.getPrixMax())
                .active(true)
                .build();
        return toDTO(alerteLogementRepository.save(alerte));
    }

    public void deleteAlert(Long id) {
        AlerteLogement alerte = alerteLogementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        
        if (!alerte.getUser().getId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Unauthorized");
        }
        alerteLogementRepository.delete(alerte);
    }

    public AlerteLogementDTO toggleAlert(Long id) {
        AlerteLogement alerte = alerteLogementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        if (!alerte.getUser().getId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        alerte.setActive(!alerte.isActive());
        return toDTO(alerteLogementRepository.save(alerte));
    }

    public void checkAndNotifyAlerts(Annonce annonce) {
        List<AlerteLogement> matchingAlerts = alerteLogementRepository.findMatchingAlerts(
                annonce.getLocalisation(),
                annonce.getPrix()
        );

        Long ownerId = annonce.getUser() != null ? annonce.getUser().getId() : null;

        for (AlerteLogement alerte : matchingAlerts) {
            User user = alerte.getUser();
            if (ownerId != null && ownerId.equals(user.getId())) {
                continue;
            }

            try {
                String titre = "Nouvelle annonce correspondante : " + annonce.getTitre();
                String message = "Une nouvelle annonce à " + annonce.getLocalisation() + " correspond à votre alerte logement.";
                notificationService.envoyer(user.getId(), titre, message, TypeNotification.ANNONCE, annonce.getId());
            } catch (Exception e) {
                // Do not fail annonce validation if in-app notification fails
            }

            try {
                emailService.sendAlerteLogementEmail(user, annonce);
            } catch (Exception e) {
                // Do not fail annonce validation if email delivery fails
            }
        }
    }

    private AlerteLogementDTO toDTO(AlerteLogement a) {
        AlerteLogementDTO dto = new AlerteLogementDTO();
        dto.setId(a.getId());
        dto.setUserId(a.getUser().getId());
        dto.setLocalisation(a.getLocalisation());
        dto.setPrixMax(a.getPrixMax());
        dto.setActive(a.isActive());
        dto.setCreatedAt(a.getCreatedAt());
        return dto;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
