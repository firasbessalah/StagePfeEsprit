package com.example.pfeporject.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ReservationDTO {
    private Long id;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String message;
    private BigDecimal prixTotal;
    private String statut;
    private LocalDateTime createdAt;
    private Long userId;
    private String userNom;
    private String userPrenom;
    private String userEmail;
    private String userTelephone;
    private Long annonceId;
    private String annonceTitre;
}