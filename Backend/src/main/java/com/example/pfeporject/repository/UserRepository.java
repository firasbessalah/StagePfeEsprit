package com.example.pfeporject.repository;

import com.example.pfeporject.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmail(String email);

    // ─── Analytics ──────────────────────────────────────────
    long countByCreatedAtAfter(LocalDateTime since);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT FUNCTION('TO_CHAR', u.createdAt, 'YYYY-MM') AS label, COUNT(u) " +
            "FROM User u WHERE u.createdAt >= :since " +
            "GROUP BY FUNCTION('TO_CHAR', u.createdAt, 'YYYY-MM') " +
            "ORDER BY label")
    List<Object[]> countMonthlyRegistrations(@Param("since") LocalDateTime since);
}