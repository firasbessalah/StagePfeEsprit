package com.example.pfeporject.repository;

import com.example.pfeporject.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserId(Long userId);

    List<Notification> findByUserIdAndIsLu(Long userId, boolean isLu);

    long countByUserIdAndIsLu(Long userId, boolean isLu);
}