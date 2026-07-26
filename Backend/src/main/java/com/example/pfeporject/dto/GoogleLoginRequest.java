package com.example.pfeporject.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginRequest {

    @NotBlank(message = "Google credential is required.")
    private String credential;

    /** Optional role for first Google login account creation (LOCATAIRE|BAILLEUR). */
    private String role;

    /** Telephone number required for non-admin Google users. */
    private String telephone;
}
