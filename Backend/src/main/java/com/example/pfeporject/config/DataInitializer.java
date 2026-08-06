package com.example.pfeporject.config;

import com.example.pfeporject.entity.User;
import com.example.pfeporject.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createAdminUser();
    }

    public void createAdminUser() {
        String adminEmail = "firas.bessalah@cynapcom.com";
        userRepository.findByEmail(adminEmail).ifPresentOrElse(
            user -> {
                user.setRole(User.Role.ADMIN);
                user.setEnabled(true);
                user.setPassword(passwordEncoder.encode("123456789"));
                userRepository.save(user);
                System.out.println(">>> ADMIN USER UPDATED SUCCESSFULLY: " + adminEmail);
            },
            () -> {
                User admin = User.builder()
                        .nom("Bessalah")
                        .prenom("Firas")
                        .email(adminEmail)
                        .password(passwordEncoder.encode("123456789"))
                        .telephone("20000000")
                        .role(User.Role.ADMIN)
                        .enabled(true)
                        .build();
                userRepository.save(admin);
                System.out.println(">>> ADMIN USER CREATED SUCCESSFULLY: " + adminEmail);
            }
        );
    }
}
