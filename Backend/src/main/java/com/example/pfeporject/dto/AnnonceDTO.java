package com.example.pfeporject.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnnonceDTO {

    private Long id;
    private String titre;
    private String description;
    private BigDecimal prix;
    private String localisation;
    private Double latitude;
    private Double longitude;
    private String statut;
    private LocalDateTime createdAt;
    private Long userId;
    private String userNom;
    private String userPrenom;
    private String categorie;
    private Integer duree;
    private Integer vues;
    private Integer riskScore;
    private Boolean flagged;
    private String flagReason;
    private String signalsJson;
    private List<String> images;
}