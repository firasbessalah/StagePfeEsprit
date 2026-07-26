package com.example.pfeporject.repository;

import com.example.pfeporject.entity.Reservation;
import com.example.pfeporject.entity.Reservation.StatutReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserId(Long userId);

    List<Reservation> findByAnnonceId(Long annonceId);

    List<Reservation> findByStatut(StatutReservation statut);

    boolean existsByUserIdAndAnnonceId(Long userId, Long annonceId);

    // ─── Analytics ──────────────────────────────────────────
    long countByCreatedAtAfter(LocalDateTime since);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(DISTINCT r.user.id) FROM Reservation r")
    long countDistinctUsers();

    @Query("SELECT FUNCTION('TO_CHAR', r.createdAt, 'YYYY-MM') AS label, COUNT(r) " +
            "FROM Reservation r WHERE r.createdAt >= :since " +
            "GROUP BY FUNCTION('TO_CHAR', r.createdAt, 'YYYY-MM') " +
            "ORDER BY label")
    List<Object[]> countMonthlyReservations(@Param("since") LocalDateTime since);

    List<Reservation> findByCreatedAtAfter(LocalDateTime since);

    @Query("SELECT SUM(r.prixTotal) FROM Reservation r WHERE r.statut IN :statuts")
    java.math.BigDecimal sumPrixTotalByStatutIn(@Param("statuts") List<StatutReservation> statuts);
}