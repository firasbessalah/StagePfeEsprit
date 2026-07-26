package com.example.pfeporject.service;

import com.example.pfeporject.dto.ModerationResultDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class AiModerationService {

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    public ModerationResultDTO moderateContent(String text, String contentType) {
        if (text == null || text.trim().length() < 3) {
            return safeResult("Texte trop court.");
        }
        Map<String, String> body = new HashMap<>();
        body.put("text", text);
        body.put("content_type", contentType);
        return post("/moderate-content", body);
    }

    public ModerationResultDTO moderateAnnonce(String titre, String description,
                                                double prix, String localisation,
                                                int userAnnonceCount, List<String> images,
                                                Double surface, Integer accountAgeDays, Boolean userVerified) {
        Map<String, Object> body = new HashMap<>();
        body.put("titre", titre != null ? titre : "");
        body.put("description", description != null ? description : "");
        body.put("prix", prix);
        body.put("localisation", localisation != null ? localisation : "");
        body.put("user_annonce_count", userAnnonceCount);
        if (images != null) {
            body.put("images", images);
        }
        if (surface != null) {
            body.put("surface", surface);
        }
        if (accountAgeDays != null) {
            body.put("account_age_days", accountAgeDays);
        }
        if (userVerified != null) {
            body.put("user_verified", userVerified);
        }
        return post("/moderate-annonce", body);
    }

    public String analyzeSentiment(String text) {
        if (text == null || text.trim().isEmpty()) {
            return "NEUTRE";
        }
        try {
            Map<String, String> body = Map.of("text", text);
            String json = mapper.writeValueAsString(body);
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            org.springframework.http.HttpEntity<String> request = new org.springframework.http.HttpEntity<>(json, headers);
            org.springframework.http.ResponseEntity<String> response = restTemplate.postForEntity(aiServiceUrl + "/analyze", request, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode node = mapper.readTree(response.getBody());
                String sentiment = node.path("sentiment").asText("NEUTRE");
                if (sentiment.matches("POSITIF|NEGATIF|NEUTRE")) {
                    return sentiment;
                }
            }
        } catch (Exception e) {
            log.warn("[AI] Sentiment service unavailable: {}", e.getMessage());
        }
        return "NEUTRE";
    }

    private final org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

    private ModerationResultDTO post(String path, Object body) {
        try {
            String json = mapper.writeValueAsString(body);
            log.info("[AI] Sending request to {}: {}", path, json);
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            org.springframework.http.HttpEntity<String> request = new org.springframework.http.HttpEntity<>(json, headers);
            org.springframework.http.ResponseEntity<String> response = restTemplate.postForEntity(aiServiceUrl + path, request, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return parseModerationResponse(mapper.readTree(response.getBody()));
            }
        } catch (Exception e) {
            log.warn("[AI] Moderation service unavailable ({}): {}", path, e.getMessage());
        }
        return safeResult("Service IA indisponible — analyse reportée.");
    }

    private ModerationResultDTO parseModerationResponse(JsonNode node) {
        List<String> categories = new ArrayList<>();
        if (node.has("categories") && node.get("categories").isArray()) {
            node.get("categories").forEach(c -> categories.add(c.asText()));
        }
        
        List<Map<String, Object>> signals = new ArrayList<>();
        if (node.has("signals") && node.get("signals").isArray()) {
            try {
                signals = mapper.readValue(node.get("signals").traverse(), new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {});
            } catch (Exception e) {
                log.warn("Could not parse signals", e);
            }
        }
        
        return ModerationResultDTO.builder()
                .flagged(node.path("flagged").asBoolean(false))
                .riskScore(node.path("risk_score").asInt(0))
                .rawScore(node.path("raw_score").asDouble(0.0))
                .categories(categories)
                .signals(signals)
                .explanation(node.path("explanation").asText(""))
                .confidence(node.path("confidence").asText("LOW"))
                .build();
    }

    private ModerationResultDTO safeResult(String explanation) {
        return ModerationResultDTO.builder()
                .flagged(false)
                .riskScore(0)
                .rawScore(0.0)
                .categories(List.of())
                .signals(List.of())
                .explanation(explanation)
                .confidence("HIGH")
                .build();
    }
}
