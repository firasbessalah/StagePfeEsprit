package com.example.pfeporject.repository;

import com.example.pfeporject.entity.Annonce;
import com.example.pfeporject.entity.Favori;
import com.example.pfeporject.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriRepository extends JpaRepository<Favori, Long> {
    List<Favori> findByUser(User user);
    Optional<Favori> findByUserAndAnnonce(User user, Annonce annonce);
    boolean existsByUserAndAnnonce(User user, Annonce annonce);
}
