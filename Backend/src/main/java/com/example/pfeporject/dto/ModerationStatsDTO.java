package com.example.pfeporject.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModerationStatsDTO {
    private long totalFlaggedAnnonces;
    private long totalFlaggedAvis;
    private long totalFlaggedMessages;
    private long totalAnalyzed;
    private List<AnnonceDTO> flaggedAnnonces;
    private List<AvisDTO> flaggedAvis;
    private List<MessageDTO> flaggedMessages;
}
