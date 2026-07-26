package com.example.pfeporject.service;

import com.example.pfeporject.dto.FavoriDTO;
import com.example.pfeporject.entity.Annonce;
import com.example.pfeporject.entity.Favori;
import com.example.pfeporject.entity.User;
import com.example.pfeporject.repository.AnnonceRepository;
import com.example.pfeporject.repository.FavoriRepository;
import com.example.pfeporject.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriService {

    private final FavoriRepository favoriRepository;
    private final AnnonceRepository annonceRepository;
    private final UserRepository userRepository;

    public List<FavoriDTO> getMyFavoris() {
        User currentUser = getCurrentUser();
        return favoriRepository.findByUser(currentUser)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public FavoriDTO addFavori(Long annonceId) {
        User currentUser = getCurrentUser();
        Annonce annonce = annonceRepository.findById(annonceId)
                .orElseThrow(() -> new RuntimeException("Annonce not found"));

        if (favoriRepository.existsByUserAndAnnonce(currentUser, annonce)) {
            throw new RuntimeException("Annonce is already in your favorites");
        }

        Favori favori = Favori.builder()
                .user(currentUser)
                .annonce(annonce)
                .build();
        
        return toDTO(favoriRepository.save(favori));
    }

    public void removeFavori(Long annonceId) {
        User currentUser = getCurrentUser();
        Annonce annonce = annonceRepository.findById(annonceId)
                .orElseThrow(() -> new RuntimeException("Annonce not found"));

        Favori favori = favoriRepository.findByUserAndAnnonce(currentUser, annonce)
                .orElseThrow(() -> new RuntimeException("Favorite not found"));

        favoriRepository.delete(favori);
    }

    private FavoriDTO toDTO(Favori f) {
        FavoriDTO dto = new FavoriDTO();
        dto.setId(f.getId());
        dto.setUserId(f.getUser().getId());
        dto.setAnnonceId(f.getAnnonce().getId());
        dto.setAnnonceTitre(f.getAnnonce().getTitre());
        dto.setAnnonceLocalisation(f.getAnnonce().getLocalisation());
        dto.setAnnoncePrix(f.getAnnonce().getPrix());
        dto.setCreatedAt(f.getCreatedAt());
        return dto;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
