package com.example.pfeporject.repository;

import com.example.pfeporject.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByUserEmailIgnoreCaseAndCode(String email, String code);

    Optional<PasswordResetToken> findBySessionToken(String sessionToken);

    void deleteByUser_Id(Long userId);
}
