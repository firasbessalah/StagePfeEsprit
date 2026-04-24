package com.example.pfeporject.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {

    @NotBlank(message = "L'email est requis.")
    @Email(message = "Email invalide.")
    private String email;
}
