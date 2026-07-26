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
public class ModerationResultDTO {
    private boolean flagged;
    private int riskScore;
    private double rawScore;
    private List<String> categories;
    private List<java.util.Map<String, Object>> signals;
    private String explanation;
    private String confidence;
}
