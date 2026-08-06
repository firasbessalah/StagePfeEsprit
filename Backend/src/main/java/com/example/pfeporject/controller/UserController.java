package com.example.pfeporject.controller;



import com.example.pfeporject.dto.AuthRequest;
import com.example.pfeporject.dto.AuthResponse;
import com.example.pfeporject.dto.ForgotPasswordRequest;
import com.example.pfeporject.dto.GoogleLoginRequest;
import com.example.pfeporject.dto.ResetPasswordConfirmRequest;
import com.example.pfeporject.dto.ResetPasswordVerifyRequest;
import com.example.pfeporject.dto.UserDTO;
import com.example.pfeporject.dto.VerifyEmailRequest;
import com.example.pfeporject.entity.User;
import com.example.pfeporject.service.PasswordResetService;
import com.example.pfeporject.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final PasswordResetService passwordResetService;

    // ─── REGISTER ────────────────────────────────────────────
    // POST http://localhost:8080/api/auth/register
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody User user) {
        userService.register(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Inscription réussie ! Un code de vérification a été envoyé à votre email."));
    }

    // GET http://localhost:8080/api/auth/check-email?email=...
    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        boolean exists = userService.checkEmailExists(email);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    // GET http://localhost:8080/api/auth/purge-test-email?email=...
    @GetMapping("/purge-test-email")
    public ResponseEntity<Map<String, String>> purgeTestEmail(@RequestParam String email) {
        userService.deleteUserByEmail(email);
        return ResponseEntity.ok(Map.of("message", "Utilisateur supprimé avec succès."));
    }

    // GET http://localhost:8080/api/auth/purge-all-users
    @GetMapping("/purge-all-users")
    public ResponseEntity<Map<String, String>> purgeAllUsers() {
        userService.purgeAllUsers();
        return ResponseEntity.ok(Map.of("message", "Tous les utilisateurs ont été supprimés avec succès."));
    }

    // ─── VERIFY EMAIL ────────────────────────────────────────
    // POST http://localhost:8080/api/auth/verify  { "email": "...", "code": "123456" }
    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        userService.verifyEmail(request);
        return ResponseEntity.ok(Map.of("message", "Votre email a été vérifié avec succès ! Vous pouvez maintenant vous connecter."));
    }

    // ─── LOGIN ───────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        AuthResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        AuthResponse response = userService.loginWithGoogle(request.getCredential(), request.getRole(), request.getTelephone());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.requestReset(request.getEmail());
        return ResponseEntity.ok(Map.of(
                "message",
                "Si cette adresse est associée à un compte, un code de réinitialisation vient d'y être envoyé."
        ));
    }

    @PostMapping("/reset-password/verify-code")
    public ResponseEntity<Map<String, String>> verifyResetCode(@Valid @RequestBody ResetPasswordVerifyRequest request) {
        String resetToken = passwordResetService.verifyCode(request);
        return ResponseEntity.ok(Map.of("resetToken", resetToken));
    }

    @PostMapping("/reset-password/confirm")
    public ResponseEntity<Map<String, String>> confirmResetPassword(@Valid @RequestBody ResetPasswordConfirmRequest request) {
        passwordResetService.confirmNewPassword(request);
        return ResponseEntity.ok(Map.of("message", "Votre mot de passe a été modifié. Vous pouvez vous connecter."));
    }
    // ─── GET USER PAR ID ─────────────────────────────────────
    // GET http://localhost:8080/api/auth/users/1
    @GetMapping("/users/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    // ─── GET ALL USERS ───────────────────────────────────────
    // GET http://localhost:8080/api/auth/users
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ─── UPDATE USER ─────────────────────────────────────────
    // PUT http://localhost:8080/api/auth/users/1
    @PutMapping("/users/{id}")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long id,
            @RequestBody UserDTO userDTO) {
        UserDTO updated = userService.updateUser(id, userDTO);
        return ResponseEntity.ok(updated);
    }

    // ─── DELETE USER ─────────────────────────────────────────
    // DELETE http://localhost:8080/api/auth/users/1
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // ─── CHANGE PASSWORD ─────────────────────────────────────
    // PUT http://localhost:8080/api/auth/users/1/password
    @PutMapping("/users/{id}/password")
    public ResponseEntity<Void> changePassword(
            @PathVariable Long id,
            @RequestBody com.example.pfeporject.dto.ChangePasswordRequest request) {
        userService.changePassword(id, request);
        return ResponseEntity.ok().build();
    }
}