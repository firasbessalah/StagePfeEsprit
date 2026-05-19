package com.example.pfeporject.controller;

import com.example.pfeporject.dto.AnnonceDTO;
import com.example.pfeporject.service.AnnonceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/annonces")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AnnonceController {

    private final AnnonceService annonceService;

    // POST /api/annonces?userId=1
    @PostMapping
    public ResponseEntity<AnnonceDTO> publier(
            @RequestBody AnnonceDTO dto,
            @RequestParam Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(annonceService.publier(dto, userId));
    }

    // GET /api/annonces
    @GetMapping
    public ResponseEntity<List<AnnonceDTO>> getAllAnnonces() {
        return ResponseEntity.ok(annonceService.getAllAnnonces());
    }

    // GET /api/annonces/admin/all
    @GetMapping("/admin/all")
    public ResponseEntity<List<AnnonceDTO>> getAllAnnoncesAdmin() {
        return ResponseEntity.ok(annonceService.getAllAnnoncesAdmin());
    }

    // GET /api/annonces/user/1
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AnnonceDTO>> getAnnoncesByUser(
            @PathVariable Long userId) {
        return ResponseEntity.ok(annonceService.getAnnoncesByUser(userId));
    }

    // GET /api/annonces/1
    @GetMapping("/{id}")
    public ResponseEntity<AnnonceDTO> getAnnonceById(@PathVariable Long id) {
        return ResponseEntity.ok(annonceService.getAnnonceById(id));
    }

    // GET /api/annonces/recherche?localisation=Tunis&prixMax=500
    @GetMapping("/recherche")
    public ResponseEntity<List<AnnonceDTO>> rechercher(
            @RequestParam(required = false) String localisation,
            @RequestParam(required = false) BigDecimal prixMax) {
        return ResponseEntity.ok(annonceService.rechercher(localisation, prixMax));
    }

    // PUT /api/annonces/1
    @PutMapping("/{id}")
    public ResponseEntity<AnnonceDTO> modifier(
            @PathVariable Long id,
            @RequestBody AnnonceDTO dto) {
        return ResponseEntity.ok(annonceService.modifier(id, dto));
    }

    // PUT /api/annonces/1/valider
    @PutMapping("/{id}/valider")
    public ResponseEntity<AnnonceDTO> valider(@PathVariable Long id) {
        return ResponseEntity.ok(annonceService.valider(id));
    }

    // PUT /api/annonces/1/rejeter
    @PutMapping("/{id}/rejeter")
    public ResponseEntity<AnnonceDTO> rejeter(@PathVariable Long id) {
        return ResponseEntity.ok(annonceService.rejeter(id));
    }

    // PUT /api/annonces/1/archiver
    @PutMapping("/{id}/archiver")
    public ResponseEntity<AnnonceDTO> archiver(@PathVariable Long id) {
        return ResponseEntity.ok(annonceService.archiver(id));
    }

    // DELETE /api/annonces/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        annonceService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}