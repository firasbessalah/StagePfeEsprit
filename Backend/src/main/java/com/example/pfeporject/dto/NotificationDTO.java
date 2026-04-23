package com.example.pfeporject.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long id;
    private String titre;
    private String message;
    private boolean isLu;
    private String type;
    private LocalDateTime createdAt;
    private Long userId;
}