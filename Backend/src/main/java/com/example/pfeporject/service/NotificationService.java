package com.example.pfeporject.service;

import com.example.pfeporject.dto.NotificationDTO;
import com.example.pfeporject.entity.Notification;
import com.example.pfeporject.entity.Notification.TypeNotification;
import com.example.pfeporject.entity.User;
import com.example.pfeporject.repository.NotificationRepository;
import com.example.pfeporject.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // ─── ENVOYER UNE NOTIFICATION ────────────────────────────
    public void envoyer(Long userId, String titre, String message, TypeNotification type) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable !"));

        Notification notification = new Notification();
        notification.setTitre(titre);
        notification.setMessage(message);
        notification.setType(type);
        notification.setLu(false);
        notification.setUser(user);

        notificationRepository.save(notification);
    }

    // ─── MES NOTIFICATIONS ───────────────────────────────────
    public List<NotificationDTO> getNotifications(Long userId) {
        return notificationRepository.findByUserId(userId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ─── NOTIFICATIONS NON LUES ──────────────────────────────
    public long countNonLues(Long userId) {
        return notificationRepository.countByUserIdAndIsLu(userId, false);
    }

    // ─── MARQUER COMME LUE ───────────────────────────────────
    public NotificationDTO marquerLue(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification introuvable !"));
        notification.setLu(true);
        return toDTO(notificationRepository.save(notification));
    }

    // ─── toDTO ───────────────────────────────────────────────
    private NotificationDTO toDTO(Notification n) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(n.getId());
        dto.setTitre(n.getTitre());
        dto.setMessage(n.getMessage());
        dto.setLu(n.isLu());
        dto.setType(n.getType().name());
        dto.setCreatedAt(n.getCreatedAt());
        dto.setUserId(n.getUser().getId());
        return dto;
    }
}