package com.example.pfeporject.repository;

import com.example.pfeporject.entity.Avis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvisRepository extends JpaRepository<Avis, Long> {

    List<Avis> findByAnnonceId(Long annonceId);

    List<Avis> findByUserId(Long userId);

    List<Avis> findByIsModere(boolean isModere);

    @Query("SELECT AVG(a.note) FROM Avis a WHERE a.annonce.id = :annonceId")
    Double findAverageNoteByAnnonceId(@Param("annonceId") Long annonceId);
}