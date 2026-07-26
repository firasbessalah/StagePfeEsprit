package com.example.pfeporject.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AvisDTO {
    private Long id;
    private Integer note;
    private String commentaire;
    private boolean isModere;
    private LocalDateTime createdAt;
    private Long userId;
    private String userNom;
    private String userPrenom;
    private Long annonceId;
    private String sentiment;
    private boolean flagged;
    private String flagReason;
    private Integer riskScore;
}