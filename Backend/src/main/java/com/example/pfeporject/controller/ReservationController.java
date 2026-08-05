package com.example.pfeporject.controller;

import com.example.pfeporject.dto.ReservationDTO;
import com.example.pfeporject.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    // ─── CRÉER UNE RÉSERVATION ───────────────────────────────
    // POST /api/reservations?userId=1&annonceId=5
    @PostMapping
    public ResponseEntity<ReservationDTO> confirmer(
            @Valid @RequestBody ReservationDTO dto,
            @RequestParam Long userId,
            @RequestParam Long annonceId) {

        ReservationDTO savedReservation = reservationService.confirmer(dto, userId, annonceId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedReservation);
    }

    // ─── MES RÉSERVATIONS (Client) ───────────────────────────
    // GET /api/reservations/user/1
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReservationDTO>> getReservationsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(reservationService.getReservationsByUser(userId));
    }

    // ─── RÉSERVATIONS D'UNE ANNONCE (Propriétaire) ───────────
    // GET /api/reservations/annonce/5
    @GetMapping("/annonce/{annonceId}")
    public ResponseEntity<List<ReservationDTO>> getReservationsByAnnonce(@PathVariable Long annonceId) {
        return ResponseEntity.ok(reservationService.getReservationsByAnnonce(annonceId));
    }

    // ─── RÉSERVATIONS POUR UN BAILLEUR ───────────────────────
    // GET /api/reservations/bailleur/1
    @GetMapping("/bailleur/{bailleurId}")
    public ResponseEntity<List<ReservationDTO>> getReservationsByBailleur(@PathVariable Long bailleurId) {
        return ResponseEntity.ok(reservationService.getReservationsByBailleur(bailleurId));
    }

    // ─── CONFIRMER UNE RÉSERVATION (Propriétaire) ────────────
    // PUT /api/reservations/10/confirmer
    @PutMapping("/{id}/confirmer")
    public ResponseEntity<ReservationDTO> confirmer(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.confirmer(id));
    }

    // ─── ANNULER UNE RÉSERVATION ─────────────────────────────
    // PUT /api/reservations/10/annuler
    @PutMapping("/{id}/annuler")
    public ResponseEntity<ReservationDTO> annuler(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.annuler(id));
    }

    // ─── TERMINER UNE RÉSERVATION ────────────────────────────
    // PUT /api/reservations/10/terminer
    @PutMapping("/{id}/terminer")
    public ResponseEntity<ReservationDTO> terminer(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.terminer(id));
    }

    // ─── TOUTES LES RÉSERVATIONS (Admin) ─────────────────────
    // GET /api/reservations
    @GetMapping
    public ResponseEntity<List<ReservationDTO>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }
}