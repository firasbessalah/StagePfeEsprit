package com.example.pfeporject.service;

import com.example.pfeporject.dto.AvisDTO;
import com.example.pfeporject.entity.Annonce;
import com.example.pfeporject.entity.Avis;
import com.example.pfeporject.entity.User;
import com.example.pfeporject.repository.AnnonceRepository;
import com.example.pfeporject.repository.AvisRepository;
import com.example.pfeporject.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AvisService {

    private final AvisRepository avisRepository;
    private final UserRepository userRepository;
    private final AnnonceRepository annonceRepository;
    private final AiModerationService aiModerationService;

    // ─── PUBLIER UN AVIS ─────────────────────────────────────
    public AvisDTO publier(AvisDTO dto, Long userId, Long annonceId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable !"));

        Annonce annonce = annonceRepository.findById(annonceId)
                .orElseThrow(() -> new RuntimeException("Annonce introuvable !"));

        if (dto.getNote() < 1 || dto.getNote() > 5) {
            throw new RuntimeException("La note doit être entre 1 et 5 !");
        }

        Avis avis = new Avis();
        avis.setNote(dto.getNote());
        avis.setCommentaire(dto.getCommentaire());
        avis.setModere(false);
        avis.setUser(user);
        avis.setAnnonce(annonce);

        // Analyze sentiment using Python microservice
        String sentiment = aiModerationService.analyzeSentiment(dto.getCommentaire());
        avis.setSentiment(sentiment);

        // Analyze moderation
        com.example.pfeporject.dto.ModerationResultDTO modResult = aiModerationService.moderateContent(dto.getCommentaire(), "AVIS");
        if (modResult != null) {
            avis.setFlagged(modResult.isFlagged());
            avis.setRiskScore(modResult.getRiskScore());
            avis.setFlagReason(modResult.getExplanation());
        }

        return toDTO(avisRepository.save(avis));
    }

    // ─── AVIS D'UNE ANNONCE ──────────────────────────────────
    public List<AvisDTO> getAvisByAnnonce(Long annonceId) {
        return avisRepository.findByAnnonceId(annonceId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ─── TOUS LES AVIS (ADMIN) ──────────────────────────────
    public List<AvisDTO> getAllAvis() {
        return avisRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toDTO)
                .toList();
    }

    // ─── NOTE MOYENNE D'UNE ANNONCE ──────────────────────────
    public Double getNoteMoyenne(Long annonceId) {
        return avisRepository.findAverageNoteByAnnonceId(annonceId);
    }

    // ─── MODÉRER UN AVIS (ADMIN) ─────────────────────────────
    public AvisDTO moderer(Long id) {
        Avis avis = avisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Avis introuvable !"));
        avis.setModere(true);
        return toDTO(avisRepository.save(avis));
    }

    // ─── SUPPRIMER UN AVIS ───────────────────────────────────
    public void supprimer(Long id) {
        if (!avisRepository.existsById(id)) {
            throw new RuntimeException("Avis introuvable !");
        }
        avisRepository.deleteById(id);
    }



    // ─── toDTO ───────────────────────────────────────────────
    private AvisDTO toDTO(Avis a) {
        AvisDTO dto = new AvisDTO();
        dto.setId(a.getId());
        dto.setNote(a.getNote());
        dto.setCommentaire(a.getCommentaire());
        dto.setModere(a.isModere());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setUserId(a.getUser().getId());
        dto.setUserNom(a.getUser().getNom());
        dto.setUserPrenom(a.getUser().getPrenom());
        dto.setAnnonceId(a.getAnnonce().getId());
        dto.setSentiment(a.getSentiment() != null ? a.getSentiment() : "NEUTRE");
        dto.setFlagged(a.isFlagged());
        dto.setFlagReason(a.getFlagReason());
        dto.setRiskScore(a.getRiskScore());
        return dto;
    }
}