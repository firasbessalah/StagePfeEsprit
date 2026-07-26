package com.example.pfeporject.repository;

import com.example.pfeporject.entity.Annonce;
import com.example.pfeporject.entity.Annonce.StatutAnnonce;
import com.example.pfeporject.entity.Annonce.CategorieAnnonce;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnnonceRepository extends JpaRepository<Annonce, Long> {

    List<Annonce> findByUserId(Long userId);

    List<Annonce> findByStatut(StatutAnnonce statut);

    List<Annonce> findByLocalisationContainingIgnoreCase(String localisation);

    List<Annonce> findByPrixLessThanEqual(BigDecimal prixMax);

    @Query("SELECT a FROM Annonce a WHERE " +
            "(:localisation IS NULL OR LOWER(a.localisation) LIKE :localisation) AND " +
            "(:prixMax IS NULL OR a.prix <= :prixMax) AND " +
            "a.statut = 'VALIDEE'")
    List<Annonce> rechercher(@Param("localisation") String localisation,
                             @Param("prixMax") BigDecimal prixMax);

    @Query("SELECT a FROM Annonce a WHERE " +
            "(:localisation IS NULL OR LOWER(a.localisation) LIKE :localisation) AND " +
            "(:prixMax IS NULL OR a.prix <= :prixMax) AND " +
            "(:categorie IS NULL OR a.categorie = :categorie) AND " +
            "(:duree IS NULL OR a.duree <= :duree) AND " +
            "a.statut = 'VALIDEE'")
    List<Annonce> rechercherAvancee(@Param("localisation") String localisation,
                                   @Param("prixMax") BigDecimal prixMax,
                                   @Param("categorie") CategorieAnnonce categorie,
                                   @Param("duree") Integer duree);

    @Query("SELECT DISTINCT LOWER(a.localisation) FROM Annonce a WHERE a.localisation IS NOT NULL")
    List<String> findDistinctLocalisations();

    // ─── Analytics ──────────────────────────────────────────
    long countByCreatedAtAfter(LocalDateTime since);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(DISTINCT a.user.id) FROM Annonce a")
    long countDistinctUsers();

    @Query("SELECT FUNCTION('TO_CHAR', a.createdAt, 'YYYY-MM') AS label, COUNT(a) " +
            "FROM Annonce a WHERE a.createdAt >= :since " +
            "GROUP BY FUNCTION('TO_CHAR', a.createdAt, 'YYYY-MM') " +
            "ORDER BY label")
    List<Object[]> countMonthlyAnnonces(@Param("since") LocalDateTime since);

    List<Annonce> findByCreatedAtAfter(LocalDateTime since);

    List<Annonce> findTop5ByOrderByVuesDesc();

    List<Annonce> findByFlaggedTrue();

    long countByFlaggedTrue();

    long countByUserId(Long userId);
}