package com.example.pfeporject.controller;

import com.example.pfeporject.dto.MessageDTO;
import com.example.pfeporject.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    // ─── ENVOYER UN MESSAGE ──────────────────────────────────
    // POST /api/messages?expediteurId=1&destinataireId=2
    @PostMapping
    public ResponseEntity<MessageDTO> envoyer(
            @Valid @RequestBody MessageDTO dto,
            @RequestParam Long expediteurId,
            @RequestParam Long destinataireId) {

        MessageDTO savedMessage = messageService.envoyer(dto, expediteurId, destinataireId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedMessage);
    }

    // ─── CONVERSATION ENTRE DEUX UTILISATEURS ────────────────
    // GET /api/messages/conversation?userId1=1&userId2=2
    @GetMapping("/conversation")
    public ResponseEntity<List<MessageDTO>> getConversation(
            @RequestParam Long userId1,
            @RequestParam Long userId2) {

        List<MessageDTO> conversation = messageService.getConversation(userId1, userId2);
        return ResponseEntity.ok(conversation);
    }

    // ─── MARQUER UN MESSAGE COMME LU ─────────────────────────
    // PUT /api/messages/5/lu
    @PutMapping("/{id}/lu")
    public ResponseEntity<MessageDTO> marquerLu(@PathVariable Long id) {
        return ResponseEntity.ok(messageService.marquerLu(id));
    }

    // ─── COMPTER MESSAGES NON LUS ────────────────────────────
    // GET /api/messages/non-lus?destinataireId=2
    @GetMapping("/non-lus")
    public ResponseEntity<Long> countNonLus(@RequestParam Long destinataireId) {
        long count = messageService.countNonLus(destinataireId);
        return ResponseEntity.ok(count);
    }
}