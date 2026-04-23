package com.example.pfeporject.service;

import com.example.pfeporject.dto.MessageDTO;
import com.example.pfeporject.entity.Message;
import com.example.pfeporject.entity.User;
import com.example.pfeporject.repository.MessageRepository;
import com.example.pfeporject.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    // ─── ENVOYER UN MESSAGE ──────────────────────────────────
    public MessageDTO envoyer(MessageDTO dto, Long expediteurId, Long destinataireId) {

        User expediteur = userRepository.findById(expediteurId)
                .orElseThrow(() -> new RuntimeException("Expéditeur introuvable !"));

        User destinataire = userRepository.findById(destinataireId)
                .orElseThrow(() -> new RuntimeException("Destinataire introuvable !"));

        Message message = new Message();
        message.setContenu(dto.getContenu());
        message.setLu(false);
        message.setModere(false);
        message.setExpediteur(expediteur);
        message.setDestinataire(destinataire);

        return toDTO(messageRepository.save(message));
    }

    // ─── CONVERSATION ENTRE DEUX USERS ───────────────────────
    public List<MessageDTO> getConversation(Long userId1, Long userId2) {
        return messageRepository.findConversation(userId1, userId2)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ─── MARQUER COMME LU ────────────────────────────────────
    public MessageDTO marquerLu(Long id) {
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message introuvable !"));
        message.setLu(true);
        return toDTO(messageRepository.save(message));
    }

    // ─── MESSAGES NON LUS ────────────────────────────────────
    public long countNonLus(Long destinataireId) {
        return messageRepository.countByDestinataireIdAndIsLu(destinataireId, false);
    }

    // ─── toDTO ───────────────────────────────────────────────
    private MessageDTO toDTO(Message m) {
        MessageDTO dto = new MessageDTO();
        dto.setId(m.getId());
        dto.setContenu(m.getContenu());
        dto.setLu(m.isLu());
        dto.setModere(m.isModere());
        dto.setCreatedAt(m.getCreatedAt());
        dto.setExpediteurId(m.getExpediteur().getId());
        dto.setExpediteurNom(m.getExpediteur().getNom());
        dto.setDestinataireId(m.getDestinataire().getId());
        dto.setDestinataireNom(m.getDestinataire().getNom());
        return dto;
    }
}