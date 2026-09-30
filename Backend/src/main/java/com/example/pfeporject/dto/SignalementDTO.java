package com.example.pfeporject.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class SignalementDTO {
    private Long id;
    private Long annonceId;
    private Long userId;
    private String userNom;
    private String userPrenom;
    private String reason;
    private LocalDateTime createdAt;
}
