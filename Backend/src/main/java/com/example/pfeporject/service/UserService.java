package com.example.pfeporject.service;



import com.example.pfeporject.config.JwtService;
import com.example.pfeporject.dto.AuthRequest;
import com.example.pfeporject.dto.AuthResponse;
import com.example.pfeporject.dto.UserDTO;
import com.example.pfeporject.entity.User;
import com.example.pfeporject.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    // ─── REGISTER ───────────────────────────────────────────
    public UserDTO register(User user) {

        // 1. Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email déjà utilisé !");
        }

        // 2. Encoder le mot de passe avant de sauvegarder
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // 3. Rôle par défaut = LOCATAIRE
        if (user.getRole() == null) {
            user.setRole(User.Role.LOCATAIRE);
        }

        // 4. Sauvegarder dans la base de données
        User saved = userRepository.save(user);

        // 5. Retourner le DTO (sans le password)
        return toDTO(saved);
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

        // 3. Générer le token JWT
        String token = jwtService.generateToken(user.getEmail());

        // 4. Retourner token + user
        return new AuthResponse(token, toDTO(user));
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