package com.example.pfeporject.service;

import com.example.pfeporject.dto.AnnonceDTO;
import com.example.pfeporject.dto.AISearchResponseDTO;
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
    private final AlerteLogementService alerteLogementService;
    private final AiModerationService aiModerationService;

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

        if (dto.getCategorie() != null) {
            try {
                annonce.setCategorie(Annonce.CategorieAnnonce.valueOf(dto.getCategorie().toUpperCase()));
            } catch (Exception e) {
                annonce.setCategorie(Annonce.CategorieAnnonce.ETUDIANT);
            }
        } else {
            annonce.setCategorie(Annonce.CategorieAnnonce.ETUDIANT);
        }
        annonce.setDuree(dto.getDuree() != null ? dto.getDuree() : 12);
        
        if (dto.getImages() != null) {
            annonce.setImages(new java.util.ArrayList<>(dto.getImages()));
        }

        // Analyze moderation
        int userAnnonceCount = (int) annonceRepository.countByUserId(userId);
        Integer accountAgeDays = null;
        if (user.getCreatedAt() != null) {
            accountAgeDays = (int) java.time.temporal.ChronoUnit.DAYS.between(user.getCreatedAt(), java.time.LocalDateTime.now());
        }
        com.example.pfeporject.dto.ModerationResultDTO modResult = aiModerationService.moderateAnnonce(
                dto.getTitre(), dto.getDescription(), dto.getPrix() != null ? dto.getPrix().doubleValue() : 0.0, 
                dto.getLocalisation(), userAnnonceCount, dto.getImages(), null, accountAgeDays, user.getEnabled());
        if (modResult != null) {
            annonce.setFlagged(modResult.isFlagged());
            annonce.setRiskScore(modResult.getRiskScore());
            annonce.setRawScore(modResult.getRawScore());
            annonce.setFlagReason(modResult.getExplanation());
            if (modResult.getSignals() != null) {
                try {
                    annonce.setSignalsJson(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(modResult.getSignals()));
                } catch (Exception e) {
                    // ignore
                }
            }
        }

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
        return rechercher(localisation, prixMax, null, null);
    }

    public List<AnnonceDTO> rechercher(String localisation, BigDecimal prixMax, String categorie, Integer duree) {
        Annonce.CategorieAnnonce catEnum = null;
        if (categorie != null && !categorie.trim().isEmpty()) {
            try {
                catEnum = Annonce.CategorieAnnonce.valueOf(categorie.trim().toUpperCase());
            } catch (Exception e) {
                // Ignore invalid
            }
        }
        String locParam = (localisation != null && !localisation.trim().isEmpty()) 
                ? "%" + localisation.trim().toLowerCase() + "%" 
                : null;
        return annonceRepository.rechercherAvancee(
                locParam,
                prixMax,
                catEnum,
                duree
        ).stream().map(this::toDTO).toList();
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

        if (dto.getCategorie() != null) {
            try {
                annonce.setCategorie(Annonce.CategorieAnnonce.valueOf(dto.getCategorie().toUpperCase()));
            } catch (Exception e) {
                // ignore
            }
        }
        if (dto.getDuree() != null) {
            annonce.setDuree(dto.getDuree());
        }
        if (dto.getImages() != null) {
            annonce.setImages(new java.util.ArrayList<>(dto.getImages()));
        }

        // Analyze moderation
        int userAnnonceCount = (int) annonceRepository.countByUserId(annonce.getUser().getId());
        Integer accountAgeDays = null;
        if (annonce.getUser().getCreatedAt() != null) {
            accountAgeDays = (int) java.time.temporal.ChronoUnit.DAYS.between(annonce.getUser().getCreatedAt(), java.time.LocalDateTime.now());
        }
        com.example.pfeporject.dto.ModerationResultDTO modResult = aiModerationService.moderateAnnonce(
                dto.getTitre(), dto.getDescription(), dto.getPrix() != null ? dto.getPrix().doubleValue() : 0.0, 
                dto.getLocalisation(), userAnnonceCount, dto.getImages(), null, accountAgeDays, annonce.getUser().getEnabled());
        if (modResult != null) {
            annonce.setFlagged(modResult.isFlagged());
            annonce.setRiskScore(modResult.getRiskScore());
            annonce.setRawScore(modResult.getRawScore());
            annonce.setFlagReason(modResult.getExplanation());
            if (modResult.getSignals() != null) {
                try {
                    annonce.setSignalsJson(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(modResult.getSignals()));
                } catch (Exception e) {
                    // ignore
                }
            }
        }

        return toDTO(annonceRepository.save(annonce));
    }

    // ─── VALIDER (ADMIN) ──────────────────────────────────────
    public AnnonceDTO valider(Long id) {
        Annonce annonce = annonceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Annonce introuvable !"));
        annonce.setStatut(StatutAnnonce.VALIDEE);
        Annonce savedAnnonce = annonceRepository.save(annonce);
        
        // Trigger alerts
        alerteLogementService.checkAndNotifyAlerts(savedAnnonce);
        
        return toDTO(savedAnnonce);
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

    // ─── INCREMENTER VUES ─────────────────────────────────────
    public void incrementerViews(Long id) {
        Annonce annonce = annonceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Annonce introuvable !"));
        if (annonce.getVues() == null) {
            annonce.setVues(0);
        }
        annonce.setVues(annonce.getVues() + 1);
        annonceRepository.save(annonce);
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
        dto.setCategorie(annonce.getCategorie() != null ? annonce.getCategorie().name() : null);
        dto.setDuree(annonce.getDuree());
        dto.setUserId(annonce.getUser().getId());
        dto.setUserNom(annonce.getUser().getNom());
        dto.setUserPrenom(annonce.getUser().getPrenom());
        dto.setFlagged(annonce.getFlagged() != null ? annonce.getFlagged() : false);
        dto.setFlagReason(annonce.getFlagReason());
        dto.setRiskScore(annonce.getRiskScore() != null ? annonce.getRiskScore() : 0);
        dto.setRawScore(annonce.getRawScore() != null ? annonce.getRawScore() : 0.0);
        dto.setSignalsJson(annonce.getSignalsJson());
        dto.setImages(annonce.getImages());
        return dto;
    }

    // ─── AI SEARCH ────────────────────────────────────────────
    public AISearchResponseDTO aiRechercher(String query) {
        String parsedLocalisation = null;
        BigDecimal parsedPrixMax = null;
        String parsedCategorie = null;
        Integer parsedDuree = null;

        String lowerQuery = query.toLowerCase();

        // 1. Parse Localisation (dynamic matching against DB and standard list)
        try {
            List<String> dbLocations = annonceRepository.findDistinctLocalisations();
            for (String loc : dbLocations) {
                if (loc != null && !loc.trim().isEmpty() && lowerQuery.contains(loc.trim().toLowerCase())) {
                    parsedLocalisation = loc.trim();
                    break;
                }
            }
        } catch (Exception e) {
            // fallback if query fails
        }

        if (parsedLocalisation == null) {
            String[] standardLocations = {
                "tunis", "bizerte", "sousse", "monastir", "mahdia", "sfax", 
                "gabes", "medenine", "tozeur", "gafsa", "kairouan", "nabeul", 
                "hammamet", "djerba", "ariana", "ben arous", "manouba"
            };
            for (String loc : standardLocations) {
                if (lowerQuery.contains(loc)) {
                    parsedLocalisation = loc;
                    break;
                }
            }
        }

        // 2. Parse Category
        if (lowerQuery.contains("etudiant") || lowerQuery.contains("étudiant") || lowerQuery.contains("student") || 
            lowerQuery.contains("etude") || lowerQuery.contains("études") || lowerQuery.contains("coloc") || 
            lowerQuery.contains("fac") || lowerQuery.contains("universite") || lowerQuery.contains("université")) {
            parsedCategorie = "ETUDIANT";
        } else if (lowerQuery.contains("vacance") || lowerQuery.contains("holiday") || lowerQuery.contains("summer") || 
                   lowerQuery.contains("ete") || lowerQuery.contains("été") || lowerQuery.contains("plage") || 
                   lowerQuery.contains("saison")) {
            parsedCategorie = "VACANCES";
        } else if (lowerQuery.contains("hote") || lowerQuery.contains("hôte") || lowerQuery.contains("hotel") || 
                   lowerQuery.contains("hôtel") || lowerQuery.contains("guest") || lowerQuery.contains("chambre d'hote") || 
                   lowerQuery.contains("maison d'hote") || lowerQuery.contains("maison d'hôte")) {
            parsedCategorie = "MAISON_HOTE_HOTEL";
        }

        // 3. Parse Price Limit (budget)
        BigDecimal budget = parseNumberPattern(query, "\\b(?:under|max|budget|de|a|moins de|prix|prixmax)?\\s*(\\d+)\\s*(?:tnd|dt|dinar|dinars)?\\b");
        if (budget != null) {
            parsedPrixMax = budget;
        }

        // 4. Parse Stay Duration (months)
        BigDecimal dur = parseNumberPattern(query, "\\b(\\d+)\\s*(?:month|months|mois)\\b");
        if (dur != null) {
            parsedDuree = dur.intValue();
        }

        // Query advanced search using extracted criteria
        List<AnnonceDTO> results = rechercher(parsedLocalisation, parsedPrixMax, parsedCategorie, parsedDuree);

        return AISearchResponseDTO.builder()
                .parsedLocalisation(parsedLocalisation)
                .parsedPrixMax(parsedPrixMax)
                .parsedCategorie(parsedCategorie)
                .parsedDuree(parsedDuree)
                .results(results)
                .build();
    }

    private BigDecimal parseNumberPattern(String text, String regex) {
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(regex, java.util.regex.Pattern.CASE_INSENSITIVE);
        java.util.regex.Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            try {
                return new BigDecimal(matcher.group(1));
            } catch (Exception e) {
                // ignore
            }
        }
        return null;
    }
}