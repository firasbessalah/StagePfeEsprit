package com.example.pfeporject.repository;

import com.example.pfeporject.entity.Annonce;
import com.example.pfeporject.entity.Annonce.StatutAnnonce;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface AnnonceRepository extends JpaRepository<Annonce, Long> {

    List<Annonce> findByUserId(Long userId);

    List<Annonce> findByStatut(StatutAnnonce statut);

    List<Annonce> findByLocalisationContainingIgnoreCase(String localisation);

    List<Annonce> findByPrixLessThanEqual(BigDecimal prixMax);

    @Query("SELECT a FROM Annonce a WHERE " +
            "(:localisation IS NULL OR LOWER(a.localisation) LIKE LOWER(CONCAT('%', :localisation, '%'))) AND " +
            "(:prixMax IS NULL OR a.prix <= :prixMax) AND " +
            "a.statut = 'VALIDEE'")
    List<Annonce> rechercher(@Param("localisation") String localisation,
                             @Param("prixMax") BigDecimal prixMax);
}