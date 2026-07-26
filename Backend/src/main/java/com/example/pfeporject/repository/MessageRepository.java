package com.example.pfeporject.repository;

import com.example.pfeporject.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByExpediteurId(Long expediteurId);

    List<Message> findByDestinataireId(Long destinataireId);

    @Query("SELECT m FROM Message m WHERE " +
            "(m.expediteur.id = :userId1 AND m.destinataire.id = :userId2) OR " +
            "(m.expediteur.id = :userId2 AND m.destinataire.id = :userId1) " +
            "ORDER BY m.createdAt ASC")
    List<Message> findConversation(@Param("userId1") Long userId1,
                                   @Param("userId2") Long userId2);

    long countByDestinataireIdAndIsLu(Long destinataireId, boolean isLu);

    // ─── Analytics ──────────────────────────────────────────
    List<Message> findByCreatedAtAfter(LocalDateTime since);

    List<Message> findByFlaggedTrue();

    long countByFlaggedTrue();
}