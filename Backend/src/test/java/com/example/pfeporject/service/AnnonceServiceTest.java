package com.example.pfeporject.service;

import com.example.pfeporject.dto.AISearchResponseDTO;
import com.example.pfeporject.repository.AnnonceRepository;
import com.example.pfeporject.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AnnonceServiceTest {

    @Mock
    private AnnonceRepository annonceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AlerteLogementService alerteLogementService;

    @Mock
    private AiModerationService aiModerationService;

    @InjectMocks
    private AnnonceService annonceService;

    @BeforeEach
    void setUp() {
        // Mocking the distinct locations
        lenient().when(annonceRepository.findDistinctLocalisations()).thenReturn(List.of("tunis", "sousse", "monastir"));
        lenient().when(annonceRepository.rechercherAvancee(any(), any(), any(), any())).thenReturn(Collections.emptyList());
    }

    @Test
    void testAiRechercher_ExtractsCategoryAndLocation() {
        String query = "cherche coloc pour etudiant à sousse max 400 dt";
        
        AISearchResponseDTO result = annonceService.aiRechercher(query);
        
        assertNotNull(result);
        assertEquals("sousse", result.getParsedLocalisation());
        assertEquals("ETUDIANT", result.getParsedCategorie());
        assertEquals(new BigDecimal("400"), result.getParsedPrixMax());
        assertNull(result.getParsedDuree());
    }

    @Test
    void testAiRechercher_ExtractsVacancesAndDuration() {
        String query = "location vacances djerba budget 1000 pour 2 mois";
        
        AISearchResponseDTO result = annonceService.aiRechercher(query);
        
        assertNotNull(result);
        assertEquals("djerba", result.getParsedLocalisation());
        assertEquals("VACANCES", result.getParsedCategorie());
        assertEquals(new BigDecimal("1000"), result.getParsedPrixMax());
        assertEquals(2, result.getParsedDuree());
    }
    
    @Test
    void testAiRechercher_FallbackToNullIfNotFound() {
        String query = "je veux juste un truc sympa sans budget";
        
        AISearchResponseDTO result = annonceService.aiRechercher(query);
        
        assertNotNull(result);
        assertNull(result.getParsedLocalisation());
        assertNull(result.getParsedCategorie());
        assertNull(result.getParsedPrixMax());
        assertNull(result.getParsedDuree());
    }
}
