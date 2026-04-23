package com.example.pfeporject.controller;

import com.example.pfeporject.dto.NotificationDTO;
import com.example.pfeporject.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class NotificationController {

    private final NotificationService notificationService;

    // GET /api/notifications?userId=1
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications(@RequestParam Long userId) {
        return ResponseEntity.ok(notificationService.getNotifications(userId));
    }

    // GET /api/notifications/non-lues?userId=1
    @GetMapping("/non-lues")
    public ResponseEntity<Long> countNonLues(@RequestParam Long userId) {
        return ResponseEntity.ok(notificationService.countNonLues(userId));
    }

    // PUT /api/notifications/5/lue
    @PutMapping("/{id}/lue")
    public ResponseEntity<NotificationDTO> marquerLue(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.marquerLue(id));
    }
}