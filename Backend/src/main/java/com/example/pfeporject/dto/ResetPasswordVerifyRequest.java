package com.example.pfeporject.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ResetPasswordVerifyRequest {

    @NotBlank(message = "L'email est requis.")
    @Email(message = "Email invalide.")
    private String email;

    @NotBlank(message = "Le code est requis.")
    @Pattern(regexp = "\\d{6}", message = "Le code doit contenir exactement 6 chiffres.")
    private String code;
}
