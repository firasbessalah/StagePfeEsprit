package com.example.pfeporject.repository;

import com.example.pfeporject.entity.Signalement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface SignalementRepository extends JpaRepository<Signalement, Long> {
    List<Signalement> findByAnnonceIdOrderByCreatedAtDesc(Long annonceId);
    
    @Transactional
    @Modifying
    void deleteByAnnonceId(Long annonceId);
}
