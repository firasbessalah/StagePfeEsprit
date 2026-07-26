package com.example.pfeporject.service;

import com.example.pfeporject.dto.ReservationDTO;
import com.example.pfeporject.entity.Annonce;
import com.example.pfeporject.entity.Reservation;
import com.example.pfeporject.entity.Reservation.StatutReservation;
import com.example.pfeporject.entity.User;
import com.example.pfeporject.repository.AnnonceRepository;
import com.example.pfeporject.repository.ReservationRepository;
import com.example.pfeporject.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final AnnonceRepository annonceRepository;

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

        return toDTO(reservationRepository.save(reservation));
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
        return reservationRepository.findAll().stream()
                .filter(r -> r.getAnnonce() != null && r.getAnnonce().getUser() != null && r.getAnnonce().getUser().getId().equals(bailleurId))
                .map(this::toDTO)
                .toList();
    }

    // ─── CONFIRMER ───────────────────────────────────────────
    public ReservationDTO confirmer(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation introuvable !"));
        reservation.setStatut(StatutReservation.CONFIRMEE);
        return toDTO(reservationRepository.save(reservation));
    }

    // ─── ANNULER ─────────────────────────────────────────────
    public ReservationDTO annuler(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation introuvable !"));
        reservation.setStatut(StatutReservation.ANNULEE);
        return toDTO(reservationRepository.save(reservation));
    }

    // ─── TERMINER ────────────────────────────────────────────
    public ReservationDTO terminer(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation introuvable !"));
        reservation.setStatut(StatutReservation.TERMINEE);
        return toDTO(reservationRepository.save(reservation));
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