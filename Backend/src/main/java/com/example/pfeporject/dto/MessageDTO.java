package com.example.pfeporject.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MessageDTO {
    private Long id;
    private String contenu;
    private boolean isLu;
    private boolean isModere;
    private boolean flagged;
    private String flagReason;
    private Integer riskScore;
    private LocalDateTime createdAt;
    private Long expediteurId;
    private String expediteurNom;
    private Long destinataireId;
    private String destinataireNom;
}