package com.example.pfeporject.controller;

import com.example.pfeporject.dto.FavoriDTO;
import com.example.pfeporject.service.FavoriService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favoris")
@RequiredArgsConstructor
public class FavoriController {

    private final FavoriService favoriService;

    @GetMapping
    public ResponseEntity<List<FavoriDTO>> getMyFavoris() {
        return ResponseEntity.ok(favoriService.getMyFavoris());
    }

    @PostMapping("/{annonceId}")
    public ResponseEntity<FavoriDTO> addFavori(@PathVariable Long annonceId) {
        return ResponseEntity.ok(favoriService.addFavori(annonceId));
    }

    @DeleteMapping("/{annonceId}")
    public ResponseEntity<Void> removeFavori(@PathVariable Long annonceId) {
        favoriService.removeFavori(annonceId);
        return ResponseEntity.noContent().build();
    }
}
