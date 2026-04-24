package com.example.pfeporject.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 6)
    private String code;

    @Column(name = "code_expires_at")
    private LocalDateTime codeExpiresAt;

    @Column(name = "session_token", unique = true)
    private String sessionToken;

    @Column(name = "session_expires_at")
    private LocalDateTime sessionExpiresAt;
}
