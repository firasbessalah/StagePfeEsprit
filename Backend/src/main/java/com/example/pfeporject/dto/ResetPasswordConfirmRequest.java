package com.example.pfeporject.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordConfirmRequest {

    @NotBlank(message = "Le jeton de réinitialisation est requis.")
    private String resetToken;

    @NotBlank(message = "Le nouveau mot de passe est requis.")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères.")
    private String newPassword;
}
