package com.example.pfeporject.repository;

import com.example.pfeporject.entity.AlerteLogement;
import com.example.pfeporject.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface AlerteLogementRepository extends JpaRepository<AlerteLogement, Long> {
    List<AlerteLogement> findByUser(User user);

    @Query("SELECT a FROM AlerteLogement a WHERE a.active = true " +
           "AND (:localisation IS NULL OR a.localisation IS NULL OR LOWER(:localisation) LIKE LOWER(CONCAT('%', a.localisation, '%')) OR LOWER(a.localisation) LIKE LOWER(CONCAT('%', :localisation, '%'))) " +
           "AND (a.prixMax IS NULL OR :prix <= a.prixMax)")
    List<AlerteLogement> findMatchingAlerts(@Param("localisation") String localisation, @Param("prix") BigDecimal prix);
}
