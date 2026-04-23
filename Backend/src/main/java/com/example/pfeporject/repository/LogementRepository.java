package com.example.pfeporject.repository;

import com.example.pfeporject.entity.Logement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LogementRepository extends JpaRepository<Logement, Long> {

    Optional<Logement> findByAnnonceId(Long annonceId);
}