package com.example.pfeporject.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AISearchResponseDTO {
    private String parsedLocalisation;
    private BigDecimal parsedPrixMax;
    private String parsedCategorie;
    private Integer parsedDuree;
    private List<AnnonceDTO> results;
}
