package com.example.pfeporject.repository;

import com.example.pfeporject.entity.Reservation;
import com.example.pfeporject.entity.Reservation.StatutReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserId(Long userId);

    List<Reservation> findByAnnonceId(Long annonceId);

    List<Reservation> findByStatut(StatutReservation statut);

    boolean existsByUserIdAndAnnonceId(Long userId, Long annonceId);
}