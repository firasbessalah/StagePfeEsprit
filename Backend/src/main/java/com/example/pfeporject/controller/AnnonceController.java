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

    // GET /api/annonces/recherche?localisation=Tunis&prixMax=500&categorie=ETUDIANT&duree=6
    @GetMapping("/recherche")
    public ResponseEntity<List<AnnonceDTO>> rechercher(
            @RequestParam(required = false) String localisation,
            @RequestParam(required = false) BigDecimal prixMax,
            @RequestParam(required = false) String categorie,
            @RequestParam(required = false) Integer duree) {
        return ResponseEntity.ok(annonceService.rechercher(localisation, prixMax, categorie, duree));
    }

    // GET /api/annonces/ai-recherche?query=student%20room%20in%20bizerte
    @GetMapping("/ai-recherche")
    public ResponseEntity<com.example.pfeporject.dto.AISearchResponseDTO> aiRechercher(
            @RequestParam String query) {
        return ResponseEntity.ok(annonceService.aiRechercher(query));
    }

    // GET /api/annonces/1
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<AnnonceDTO> getAnnonceById(@PathVariable Long id) {
        return ResponseEntity.ok(annonceService.getAnnonceById(id));
    }

    // PUT /api/annonces/1
    @PutMapping("/{id:\\d+}")
    public ResponseEntity<AnnonceDTO> modifier(
            @PathVariable Long id,
            @RequestBody AnnonceDTO dto) {
        return ResponseEntity.ok(annonceService.modifier(id, dto));
    }

    // PUT /api/annonces/1/valider
    @PutMapping("/{id:\\d+}/valider")
    public ResponseEntity<AnnonceDTO> valider(@PathVariable Long id) {
        return ResponseEntity.ok(annonceService.valider(id));
    }

    // PUT /api/annonces/1/rejeter
    @PutMapping("/{id:\\d+}/rejeter")
    public ResponseEntity<AnnonceDTO> rejeter(@PathVariable Long id) {
        return ResponseEntity.ok(annonceService.rejeter(id));
    }

    // PUT /api/annonces/1/archiver
    @PutMapping("/{id:\\d+}/archiver")
    public ResponseEntity<AnnonceDTO> archiver(@PathVariable Long id) {
        return ResponseEntity.ok(annonceService.archiver(id));
    }

    // DELETE /api/annonces/1
    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        annonceService.supprimer(id);
        return ResponseEntity.noContent().build();
    }

    // POST /api/annonces/1/view
    @PostMapping("/{id:\\d+}/view")
    public ResponseEntity<Void> incrementerViews(@PathVariable Long id) {
        annonceService.incrementerViews(id);
        return ResponseEntity.ok().build();
    }
}