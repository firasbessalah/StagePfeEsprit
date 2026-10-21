package com.example.pfeporject.service;

import com.example.pfeporject.dto.ReservationDTO;
import com.example.pfeporject.entity.Annonce;
import com.example.pfeporject.entity.Reservation;
import com.example.pfeporject.entity.Reservation.StatutReservation;
import com.example.pfeporject.entity.User;
import com.example.pfeporject.repository.AnnonceRepository;
import com.example.pfeporject.repository.ReservationRepository;
import com.example.pfeporject.repository.UserRepository;
import com.example.pfeporject.entity.Notification.TypeNotification;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final AnnonceRepository annonceRepository;
    private final NotificationService notificationService;

    // ─── CRÉER UNE RÉSERVATION ───────────────────────────────
    public ReservationDTO confirmer(ReservationDTO dto, Long userId, Long annonceId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable !"));

        Annonce annonce = annonceRepository.findById(annonceId)
                .orElseThrow(() -> new RuntimeException("Annonce introuvable !"));

        if (annonce.getUser().getId().equals(userId)) {
            throw new RuntimeException("Vous ne pouvez pas réserver votre propre annonce !");
        }

        long nbJours = ChronoUnit.DAYS.between(dto.getDateDebut(), dto.getDateFin());
        if (nbJours <= 0) {
            throw new RuntimeException("La date de fin doit être après la date de début !");
        }

        Reservation reservation = new Reservation();
        reservation.setDateDebut(dto.getDateDebut());
        reservation.setDateFin(dto.getDateFin());
        reservation.setMessage(dto.getMessage());
        reservation.setPrixTotal(annonce.getPrix().multiply(java.math.BigDecimal.valueOf(nbJours)));
        reservation.setStatut(StatutReservation.EN_ATTENTE);
        reservation.setUser(user);
        reservation.setAnnonce(annonce);

        Reservation saved = reservationRepository.save(reservation);

        // Notify the bailleur that a new request is waiting for his decision
        notifySafely(annonce.getUser().getId(),
                "Nouvelle demande de réservation",
                user.getPrenom() + " " + user.getNom() + " souhaite réserver « " + annonce.getTitre()
                        + " » du " + dto.getDateDebut() + " au " + dto.getDateFin() + ".",
                saved.getId());

        return toDTO(saved);
    }

    // ─── MES RÉSERVATIONS ────────────────────────────────────
    public List<ReservationDTO> getReservationsByUser(Long userId) {
        return reservationRepository.findByUserId(userId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ─── RÉSERVATIONS D'UNE ANNONCE ──────────────────────────
    public List<ReservationDTO> getReservationsByAnnonce(Long annonceId) {
        return reservationRepository.findByAnnonceId(annonceId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ─── RÉSERVATIONS POUR UN BAILLEUR (Toutes ses annonces) ─
    public List<ReservationDTO> getReservationsByBailleur(Long bailleurId) {
        return reservationRepository.findByAnnonceUserId(bailleurId).stream()
                .map(this::toDTO)
                .toList();
    }

    // ─── ACCEPTER (Propriétaire de l'annonce) ────────────────
    public ReservationDTO confirmer(Long id) {
        Reservation reservation = findReservation(id);
        requireOwnerOrAdmin(reservation);

        if (reservation.getStatut() != StatutReservation.EN_ATTENTE) {
            throw new RuntimeException("Seule une réservation en attente peut être acceptée !");
        }

        // Do not accept two bookings for the same dates
        boolean overlap = reservationRepository
                .findByAnnonceIdAndStatut(reservation.getAnnonce().getId(), StatutReservation.CONFIRMEE)
                .stream()
                .anyMatch(other -> !other.getId().equals(reservation.getId())
                        && reservation.getDateDebut().isBefore(other.getDateFin())
                        && reservation.getDateFin().isAfter(other.getDateDebut()));
        if (overlap) {
            throw new RuntimeException("Ces dates chevauchent une réservation déjà confirmée !");
        }

        reservation.setStatut(StatutReservation.CONFIRMEE);
        Reservation saved = reservationRepository.save(reservation);

        notifySafely(reservation.getUser().getId(),
                "Réservation acceptée",
                "Votre réservation pour « " + reservation.getAnnonce().getTitre() + " » a été acceptée.",
                saved.getId());
        return toDTO(saved);
    }

    // ─── REFUSER (Propriétaire de l'annonce) ─────────────────
    public ReservationDTO refuser(Long id) {
        Reservation reservation = findReservation(id);
        requireOwnerOrAdmin(reservation);

        if (reservation.getStatut() != StatutReservation.EN_ATTENTE) {
            throw new RuntimeException("Seule une réservation en attente peut être refusée !");
        }

        reservation.setStatut(StatutReservation.REFUSEE);
        Reservation saved = reservationRepository.save(reservation);

        notifySafely(reservation.getUser().getId(),
                "Réservation refusée",
                "Votre réservation pour « " + reservation.getAnnonce().getTitre() + " » a été refusée.",
                saved.getId());
        return toDTO(saved);
    }

    // ─── ANNULER (Locataire, propriétaire ou admin) ──────────
    public ReservationDTO annuler(Long id) {
        Reservation reservation = findReservation(id);
        User caller = currentUser();
        boolean isTenant = reservation.getUser() != null && reservation.getUser().getId().equals(caller.getId());
        if (!isTenant && !isOwnerOrAdmin(reservation, caller)) {
            throw new AccessDeniedException("Vous n'êtes pas autorisé à annuler cette réservation !");
        }

        if (reservation.getStatut() == StatutReservation.ANNULEE
                || reservation.getStatut() == StatutReservation.REFUSEE
                || reservation.getStatut() == StatutReservation.TERMINEE) {
            throw new RuntimeException("Cette réservation ne peut plus être annulée !");
        }

        reservation.setStatut(StatutReservation.ANNULEE);
        Reservation saved = reservationRepository.save(reservation);

        // Tell the other party
        if (isTenant) {
            notifySafely(reservation.getAnnonce().getUser().getId(),
                    "Réservation annulée",
                    caller.getPrenom() + " " + caller.getNom() + " a annulé sa réservation pour « "
                            + reservation.getAnnonce().getTitre() + " ».",
                    saved.getId());
        } else {
            notifySafely(reservation.getUser().getId(),
                    "Réservation annulée",
                    "Votre réservation pour « " + reservation.getAnnonce().getTitre() + " » a été annulée.",
                    saved.getId());
        }
        return toDTO(saved);
    }

    // ─── TERMINER (Propriétaire de l'annonce) ────────────────
    public ReservationDTO terminer(Long id) {
        Reservation reservation = findReservation(id);
        requireOwnerOrAdmin(reservation);
        reservation.setStatut(StatutReservation.TERMINEE);
        return toDTO(reservationRepository.save(reservation));
    }

    // ─── helpers ─────────────────────────────────────────────
    private Reservation findReservation(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation introuvable !"));
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new AccessDeniedException("Authentification requise !");
        }
        return userRepository.findByEmailIgnoreCase(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Utilisateur introuvable !"));
    }

    private boolean isOwnerOrAdmin(Reservation reservation, User caller) {
        if (caller.getRole() == User.Role.ADMIN) return true;
        return reservation.getAnnonce() != null
                && reservation.getAnnonce().getUser() != null
                && reservation.getAnnonce().getUser().getId().equals(caller.getId());
    }

    private void requireOwnerOrAdmin(Reservation reservation) {
        if (!isOwnerOrAdmin(reservation, currentUser())) {
            throw new AccessDeniedException("Seul le propriétaire de l'annonce peut traiter cette réservation !");
        }
    }

    /** A notification problem must never block the reservation workflow. */
    private void notifySafely(Long userId, String titre, String message, Long reservationId) {
        try {
            notificationService.envoyer(userId, titre, message, TypeNotification.RESERVATION, reservationId);
        } catch (Exception e) {
            // ignore
        }
    }

    // ─── TOUTES LES RÉSERVATIONS ─────────────────────────────
    public List<ReservationDTO> getAllReservations() {
        return reservationRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ─── toDTO ───────────────────────────────────────────────
    private ReservationDTO toDTO(Reservation r) {
        ReservationDTO dto = new ReservationDTO();
        dto.setId(r.getId());
        dto.setDateDebut(r.getDateDebut());
        dto.setDateFin(r.getDateFin());
        dto.setMessage(r.getMessage());
        dto.setPrixTotal(r.getPrixTotal());
        dto.setStatut(r.getStatut() != null ? r.getStatut().name() : null);
        dto.setCreatedAt(r.getCreatedAt());
        if (r.getUser() != null) {
            dto.setUserId(r.getUser().getId());
            dto.setUserNom(r.getUser().getNom());
            dto.setUserPrenom(r.getUser().getPrenom());
            dto.setUserEmail(r.getUser().getEmail());
            dto.setUserTelephone(r.getUser().getTelephone());
        }
        if (r.getAnnonce() != null) {
            dto.setAnnonceId(r.getAnnonce().getId());
            dto.setAnnonceTitre(r.getAnnonce().getTitre());
        }
        return dto;
    }
}