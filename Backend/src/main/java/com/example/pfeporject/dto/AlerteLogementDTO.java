package com.example.pfeporject.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class AlerteLogementDTO {
    private Long id;
    private Long userId;
    private String localisation;
    private BigDecimal prixMax;
    private boolean active;
    private LocalDateTime createdAt;
}
