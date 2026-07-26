package com.example.pfeporject.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class FavoriDTO {
    private Long id;
    private Long userId;
    private Long annonceId;
    private String annonceTitre;
    private String annonceLocalisation;
    private BigDecimal annoncePrix;
    private String annoncePhoto; // We might just need the first photo or null if we don't map it here. Let's omit photo for now or keep it simple.
    private LocalDateTime createdAt;
}
