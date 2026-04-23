package com.example.pfeporject.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class AnnonceDTO {

    private Long id;
    private String titre;
    private String description;
    private BigDecimal prix;
    private String localisation;
    private Double latitude;
    private Double longitude;
    private LocalDate disponibiliteDebut;
    private LocalDate disponibiliteFin;
    private String statut;
    private LocalDateTime createdAt;
    private Long userId;
    private String userNom;
    private String userPrenom;
}