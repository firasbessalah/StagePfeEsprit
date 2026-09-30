package com.example.pfeporject.repository;

import com.example.pfeporject.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {

    Optional<VerificationToken> findByUserEmailIgnoreCaseAndToken(String email, String token);

    Optional<VerificationToken> findByUserId(Long userId);

    Optional<VerificationToken> findByToken(String token);

    void deleteByToken(String token);

    void deleteByUserId(Long userId);
}
