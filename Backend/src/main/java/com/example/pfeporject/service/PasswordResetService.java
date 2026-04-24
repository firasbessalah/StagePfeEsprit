package com.example.pfeporject.service;

import com.example.pfeporject.dto.ResetPasswordConfirmRequest;
import com.example.pfeporject.dto.ResetPasswordVerifyRequest;
import com.example.pfeporject.entity.PasswordResetToken;
import com.example.pfeporject.entity.User;
import com.example.pfeporject.exception.InvalidTokenException;
import com.example.pfeporject.repository.PasswordResetTokenRepository;
import com.example.pfeporject.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    /**
     * Always succeeds from the caller's perspective (no email enumeration).
     */
    @Transactional
    public void requestReset(String emailRaw) {
        String email = emailRaw.trim();
        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user == null) {
            return;
        }

        passwordResetTokenRepository.deleteByUser_Id(user.getId());

        String code = generateSixDigitCode();
        PasswordResetToken token = PasswordResetToken.builder()
                .user(user)
                .code(code)
                .codeExpiresAt(LocalDateTime.now().plusMinutes(15))
                .build();
        passwordResetTokenRepository.save(token);

        emailService.sendPasswordResetCode(user.getEmail(), code);
    }

    @Transactional
    public String verifyCode(ResetPasswordVerifyRequest request) {
        String email = request.getEmail().trim();
        String code = request.getCode().trim();

        PasswordResetToken row = passwordResetTokenRepository
                .findByUserEmailIgnoreCaseAndCode(email, code)
                .orElseThrow(() -> new InvalidTokenException("Email ou code incorrect."));

        if (row.getCode() == null || row.getCodeExpiresAt() == null) {
            throw new InvalidTokenException("Ce code n'est plus valide.");
        }
        if (LocalDateTime.now().isAfter(row.getCodeExpiresAt())) {
            passwordResetTokenRepository.delete(row);
            throw new InvalidTokenException("Le code a expiré. Demandez un nouveau code.");
        }

        String sessionToken = UUID.randomUUID().toString();
        row.setCode(null);
        row.setCodeExpiresAt(null);
        row.setSessionToken(sessionToken);
        row.setSessionExpiresAt(LocalDateTime.now().plusMinutes(15));
        passwordResetTokenRepository.save(row);

        return sessionToken;
    }

    @Transactional
    public void confirmNewPassword(ResetPasswordConfirmRequest request) {
        String sessionToken = request.getResetToken().trim();
        PasswordResetToken row = passwordResetTokenRepository
                .findBySessionToken(sessionToken)
                .orElseThrow(() -> new InvalidTokenException("Lien de réinitialisation invalide ou expiré."));

        if (row.getSessionExpiresAt() == null || LocalDateTime.now().isAfter(row.getSessionExpiresAt())) {
            passwordResetTokenRepository.delete(row);
            throw new InvalidTokenException("La session a expiré. Recommencez depuis « Mot de passe oublié ».");
        }

        User user = row.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        passwordResetTokenRepository.delete(row);
    }

    private static String generateSixDigitCode() {
        int n = 100_000 + SECURE_RANDOM.nextInt(900_000);
        return String.valueOf(n);
    }
}
