package com.example.pfeporject.service;



import com.example.pfeporject.config.JwtService;
import com.example.pfeporject.dto.AuthRequest;
import com.example.pfeporject.dto.AuthResponse;
import com.example.pfeporject.dto.UserDTO;
import com.example.pfeporject.dto.VerifyEmailRequest;
import com.example.pfeporject.entity.User;
import com.example.pfeporject.entity.VerificationToken;
import com.example.pfeporject.exception.AccountNotVerifiedException;
import com.example.pfeporject.exception.DuplicateEmailException;
import com.example.pfeporject.exception.InvalidTokenException;
import com.example.pfeporject.repository.UserRepository;
import com.example.pfeporject.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final RestClient GOOGLE_REST = RestClient.create("https://oauth2.googleapis.com");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final VerificationTokenRepository verificationTokenRepository;
    private final EmailService emailService;

    @Value("${google.client-id:}")
    private String googleClientId;

    // ─── REGISTER ───────────────────────────────────────────
    @Transactional
    public UserDTO register(User user) {

        // 1. Vérifier si l'email existe déjà
        if (checkEmailExists(user.getEmail())) {
            throw new DuplicateEmailException("Email déjà utilisé !");
        }

        // 2. Encoder le mot de passe avant de sauvegarder
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // 3. Rôle par défaut = LOCATAIRE
        if (user.getRole() == null) {
            user.setRole(User.Role.LOCATAIRE);
        }

        // 4. Account is NOT active until email is verified
        user.setEnabled(false);

        // 5. Sauvegarder dans la base de données
        User saved = userRepository.save(user);

        // 6. Generate 6-digit code (expires in 15 minutes)
        String code = generateVerificationCode();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(code)
                .user(saved)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .build();
        verificationTokenRepository.save(verificationToken);

        // 7. Send verification email
        emailService.sendVerificationEmail(saved.getEmail(), code);

        // 8. Retourner le DTO (sans le password)
        return toDTO(saved);
    }

    public boolean checkEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    // ─── VERIFY EMAIL ───────────────────────────────────────
    @Transactional
    public void verifyEmail(VerifyEmailRequest request) {
        String email = request.getEmail().trim();
        String code = request.getCode().trim();

        VerificationToken verificationToken = verificationTokenRepository
                .findByUserEmailIgnoreCaseAndToken(email, code)
                .orElseThrow(() -> new InvalidTokenException("Email ou code de vérification incorrect."));

        if (verificationToken.isExpired()) {
            verificationTokenRepository.delete(verificationToken);
            throw new InvalidTokenException("Le code a expiré. Veuillez vous réinscrire pour en recevoir un nouveau.");
        }

        User user = verificationToken.getUser();
        user.setEnabled(true);
        userRepository.save(user);

        verificationTokenRepository.delete(verificationToken);
    }

    private static String generateVerificationCode() {
        int n = 100_000 + SECURE_RANDOM.nextInt(900_000);
        return String.valueOf(n);
    }

    // ─── LOGIN ──────────────────────────────────────────────
    // ─── LOGIN ──────────────────────────────────────────────
    public AuthResponse login(AuthRequest request) {

        // 1. Chercher l'utilisateur par email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email introuvable !"));

        // 2. Vérifier le mot de passe
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Mot de passe incorrect !");
        }

        // 3. Check if account is verified
        if (!user.getEnabled()) {
            throw new AccountNotVerifiedException("Votre compte n'est pas encore vérifié. Veuillez vérifier votre email.");
        }

        // 4. Générer le token JWT
        String token = jwtService.generateToken(user.getEmail());

        // 5. Retourner token + user
        return new AuthResponse(token, toDTO(user));
    }

    @Transactional
    public AuthResponse loginWithGoogle(String credential, String requestedRole) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new RuntimeException("Google login n'est pas configuré sur le serveur.");
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> tokenInfo = GOOGLE_REST.get()
                .uri(uriBuilder -> uriBuilder.path("/tokeninfo").queryParam("id_token", credential).build())
                .retrieve()
                .body(Map.class);

        if (tokenInfo == null) {
            throw new RuntimeException("Réponse Google invalide.");
        }

        String audience = String.valueOf(tokenInfo.getOrDefault("aud", ""));
        if (!googleClientId.equals(audience)) {
            throw new RuntimeException("Google token audience invalide.");
        }

        String email = String.valueOf(tokenInfo.getOrDefault("email", "")).trim();
        if (email.isEmpty()) {
            throw new RuntimeException("Email Google introuvable.");
        }

        String verified = String.valueOf(tokenInfo.getOrDefault("email_verified", "false"));
        if (!"true".equalsIgnoreCase(verified)) {
            throw new RuntimeException("Le compte Google doit avoir un email vérifié.");
        }

        String givenName = String.valueOf(tokenInfo.getOrDefault("given_name", "")).trim();
        String familyName = String.valueOf(tokenInfo.getOrDefault("family_name", "")).trim();
        String fullName = String.valueOf(tokenInfo.getOrDefault("name", "")).trim();

        User user = userRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
            User.Role role = resolveGoogleRole(requestedRole);
            User created = new User();
            created.setEmail(email);
            created.setNom(!familyName.isBlank() ? familyName : (!fullName.isBlank() ? fullName : "Google"));
            created.setPrenom(!givenName.isBlank() ? givenName : "User");
            created.setPassword(passwordEncoder.encode("google-auth-" + java.util.UUID.randomUUID()));
            created.setRole(role);
            created.setEnabled(true);
            return userRepository.save(created);
        });

        if (!user.getEnabled()) {
            user.setEnabled(true);
            userRepository.save(user);
        }

        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token, toDTO(user));
    }

    private User.Role resolveGoogleRole(String requestedRole) {
        if (requestedRole == null || requestedRole.isBlank()) {
            return User.Role.LOCATAIRE;
        }
        try {
            User.Role role = User.Role.valueOf(requestedRole.trim().toUpperCase());
            if (role == User.Role.ADMIN) {
                throw new RuntimeException("Le rôle ADMIN n'est pas autorisé pour Google signup.");
            }
            return role;
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Rôle invalide pour Google signup.");
        }
    }

    // ─── GET USER BY ID ─────────────────────────────────────
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable !"));
        return toDTO(user);
    }

    // ─── CONVERTIR User → UserDTO ────────────────────────────
    private UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setEmail(user.getEmail());
        dto.setTelephone(user.getTelephone());
        dto.setPhotoProfil(user.getPhotoProfil());
        dto.setRole(user.getRole().name());
        return dto;
    }
    // ─── GET ALL USERS ───────────────────────────────────────
    public java.util.List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ─── UPDATE USER ─────────────────────────────────────────
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable !"));

        user.setNom(userDTO.getNom());
        user.setPrenom(userDTO.getPrenom());
        user.setTelephone(userDTO.getTelephone());
        user.setPhotoProfil(userDTO.getPhotoProfil());

        User updated = userRepository.save(user);
        return toDTO(updated);
    }

    // ─── DELETE USER ─────────────────────────────────────────
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur introuvable !");
        }
        userRepository.deleteById(id);
    }

    // ─── CHANGE PASSWORD ─────────────────────────────────────
    public void changePassword(Long id, com.example.pfeporject.dto.ChangePasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable !"));
                
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Mot de passe actuel incorrect !");
        }
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

}