package com.example.pfeporject.controller;

import com.example.pfeporject.dto.AvisDTO;
import com.example.pfeporject.service.AvisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/avis")
@RequiredArgsConstructor
public class AvisController {

    private final AvisService avisService;

    // ─── PUBLIER UN AVIS ─────────────────────────────────────
    // POST /api/avis?userId=1&annonceId=5
    @PostMapping
    public ResponseEntity<AvisDTO> publier(
            @Valid @RequestBody AvisDTO dto,
            @RequestParam Long userId,
            @RequestParam Long annonceId) {

        AvisDTO savedAvis = avisService.publier(dto, userId, annonceId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAvis);
    }

    // ─── AVIS D'UNE ANNONCE ──────────────────────────────────
    // GET /api/avis/annonce/5
    @GetMapping("/annonce/{annonceId}")
    public ResponseEntity<List<AvisDTO>> getAvisByAnnonce(@PathVariable Long annonceId) {
        return ResponseEntity.ok(avisService.getAvisByAnnonce(annonceId));
    }

    // ─── NOTE MOYENNE D'UNE ANNONCE ──────────────────────────
    // GET /api/avis/annonce/5/moyenne
    @GetMapping("/annonce/{annonceId}/moyenne")
    public ResponseEntity<Double> getNoteMoyenne(@PathVariable Long annonceId) {
        Double moyenne = avisService.getNoteMoyenne(annonceId);
        return ResponseEntity.ok(moyenne != null ? moyenne : 0.0);
    }

    // ─── TOUS LES AVIS (ADMIN) ───────────────────────────────
    // GET /api/avis/admin/all
    @GetMapping("/admin/all")
    public ResponseEntity<List<AvisDTO>> getAllAvis() {
        return ResponseEntity.ok(avisService.getAllAvis());
    }

    // ─── MODÉRER UN AVIS (ADMIN) ─────────────────────────────
    // PUT /api/avis/1/moderer
    @PutMapping("/{id}/moderer")
    public ResponseEntity<AvisDTO> moderer(@PathVariable Long id) {
        return ResponseEntity.ok(avisService.moderer(id));
    }

    // ─── SUPPRIMER UN AVIS ───────────────────────────────────
    // DELETE /api/avis/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        avisService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}