package com.example.pfeporject.controller;

import com.example.pfeporject.dto.AlerteLogementDTO;
import com.example.pfeporject.service.AlerteLogementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alertes")
@RequiredArgsConstructor
public class AlerteLogementController {

    private final AlerteLogementService alerteLogementService;

    @GetMapping
    public ResponseEntity<List<AlerteLogementDTO>> getMyAlerts() {
        return ResponseEntity.ok(alerteLogementService.getMyAlerts());
    }

    @PostMapping
    public ResponseEntity<AlerteLogementDTO> createAlert(@RequestBody AlerteLogementDTO dto) {
        return ResponseEntity.ok(alerteLogementService.createAlert(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlert(@PathVariable Long id) {
        alerteLogementService.deleteAlert(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<AlerteLogementDTO> toggleAlert(@PathVariable Long id) {
        return ResponseEntity.ok(alerteLogementService.toggleAlert(id));
    }
}
