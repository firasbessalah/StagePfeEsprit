package com.example.pfeporject.service;

import com.example.pfeporject.dto.AnnonceDTO;
import com.example.pfeporject.entity.Annonce;
import com.example.pfeporject.entity.Annonce.StatutAnnonce;
import com.example.pfeporject.entity.User;
import com.example.pfeporject.repository.AnnonceRepository;
import com.example.pfeporject.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnonceService {

    private final AnnonceRepository annonceRepository;
    private final UserRepository userRepository;

    // ─── PUBLIER ─────────────────────────────────────────────
    public AnnonceDTO publier(AnnonceDTO dto, Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable !"));

        Annonce annonce = new Annonce();
        annonce.setTitre(dto.getTitre());
        annonce.setDescription(dto.getDescription());
        annonce.setPrix(dto.getPrix());
        annonce.setLocalisation(dto.getLocalisation());
        annonce.setLatitude(dto.getLatitude());
        annonce.setLongitude(dto.getLongitude());
        annonce.setDisponibiliteDebut(dto.getDisponibiliteDebut());
        annonce.setDisponibiliteFin(dto.getDisponibiliteFin());
        annonce.setStatut(StatutAnnonce.EN_ATTENTE);
        annonce.setUser(user);

        return toDTO(annonceRepository.save(annonce));
    }

    // ─── TOUTES LES ANNONCES VALIDÉES ────────────────────────
    public List<AnnonceDTO> getAllAnnonces() {
        return annonceRepository.findByStatut(StatutAnnonce.VALIDEE)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ─── TOUTES LES ANNONCES (ADMIN) ─────────────────────────
    public List<AnnonceDTO> getAllAnnoncesAdmin() {
        return annonceRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ─── ANNONCES D'UN USER ───────────────────────────────────
    public List<AnnonceDTO> getAnnoncesByUser(Long userId) {
        return annonceRepository.findByUserId(userId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ─── UNE ANNONCE PAR ID ───────────────────────────────────
    public AnnonceDTO getAnnonceById(Long id) {
        Annonce annonce = annonceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Annonce introuvable !"));
        return toDTO(annonce);
    }

    // ─── RECHERCHE ────────────────────────────────────────────
    public List<AnnonceDTO> rechercher(String localisation, BigDecimal prixMax) {
        return annonceRepository.rechercher(localisation, prixMax)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ─── MODIFIER ─────────────────────────────────────────────
    public AnnonceDTO modifier(Long id, AnnonceDTO dto) {
        Annonce annonce = annonceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Annonce introuvable !"));

        annonce.setTitre(dto.getTitre());
        annonce.setDescription(dto.getDescription());
        annonce.setPrix(dto.getPrix());
        annonce.setLocalisation(dto.getLocalisation());
        annonce.setLatitude(dto.getLatitude());
        annonce.setLongitude(dto.getLongitude());
        annonce.setDisponibiliteDebut(dto.getDisponibiliteDebut());
        annonce.setDisponibiliteFin(dto.getDisponibiliteFin());

        return toDTO(annonceRepository.save(annonce));
    }

    // ─── VALIDER (ADMIN) ──────────────────────────────────────
    public AnnonceDTO valider(Long id) {
        Annonce annonce = annonceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Annonce introuvable !"));
        annonce.setStatut(StatutAnnonce.VALIDEE);
        return toDTO(annonceRepository.save(annonce));
    }

    // ─── REJETER (ADMIN) ──────────────────────────────────────
    public AnnonceDTO rejeter(Long id) {
        Annonce annonce = annonceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Annonce introuvable !"));
        annonce.setStatut(StatutAnnonce.REJETEE);
        return toDTO(annonceRepository.save(annonce));
    }

    // ─── ARCHIVER (ADMIN) ─────────────────────────────────────
    public AnnonceDTO archiver(Long id) {
        Annonce annonce = annonceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Annonce introuvable !"));
        annonce.setStatut(StatutAnnonce.ARCHIVEE);
        return toDTO(annonceRepository.save(annonce));
    }

    // ─── SUPPRIMER ────────────────────────────────────────────
    public void supprimer(Long id) {
        if (!annonceRepository.existsById(id)) {
            throw new RuntimeException("Annonce introuvable !");
        }
        annonceRepository.deleteById(id);
    }

    // ─── toDTO ───────────────────────────────────────────────
    private AnnonceDTO toDTO(Annonce annonce) {
        AnnonceDTO dto = new AnnonceDTO();
        dto.setId(annonce.getId());
        dto.setTitre(annonce.getTitre());
        dto.setDescription(annonce.getDescription());
        dto.setPrix(annonce.getPrix());
        dto.setLocalisation(annonce.getLocalisation());
        dto.setLatitude(annonce.getLatitude());
        dto.setLongitude(annonce.getLongitude());
        dto.setDisponibiliteDebut(annonce.getDisponibiliteDebut());
        dto.setDisponibiliteFin(annonce.getDisponibiliteFin());
        dto.setStatut(annonce.getStatut().name());
        dto.setCreatedAt(annonce.getCreatedAt());
        dto.setUserId(annonce.getUser().getId());
        dto.setUserNom(annonce.getUser().getNom());
        dto.setUserPrenom(annonce.getUser().getPrenom());
        return dto;
    }
}