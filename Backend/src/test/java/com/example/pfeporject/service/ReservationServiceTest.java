package com.example.pfeporject.service;

import com.example.pfeporject.dto.ReservationDTO;
import com.example.pfeporject.entity.Annonce;
import com.example.pfeporject.entity.Reservation;
import com.example.pfeporject.entity.User;
import com.example.pfeporject.repository.AnnonceRepository;
import com.example.pfeporject.repository.ReservationRepository;
import com.example.pfeporject.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AnnonceRepository annonceRepository;

    @InjectMocks
    private ReservationService reservationService;

    private User locataire;
    private User bailleur;
    private Annonce annonce;

    @BeforeEach
    void setUp() {
        locataire = new User();
        locataire.setId(1L);
        locataire.setNom("Locataire");

        bailleur = new User();
        bailleur.setId(2L);
        bailleur.setNom("Bailleur");

        annonce = new Annonce();
        annonce.setId(10L);
        annonce.setUser(bailleur);
        annonce.setPrix(new BigDecimal("50.0"));
    }

    @Test
    void testConfirmer_Success() {
        ReservationDTO dto = new ReservationDTO();
        dto.setDateDebut(LocalDate.now().plusDays(1));
        dto.setDateFin(LocalDate.now().plusDays(4)); // 3 days

        when(userRepository.findById(1L)).thenReturn(Optional.of(locataire));
        when(annonceRepository.findById(10L)).thenReturn(Optional.of(annonce));

        Reservation savedReservation = new Reservation();
        savedReservation.setId(100L);
        savedReservation.setPrixTotal(new BigDecimal("150.0")); // 50 * 3
        savedReservation.setStatut(Reservation.StatutReservation.EN_ATTENTE);
        savedReservation.setUser(locataire);
        savedReservation.setAnnonce(annonce);
        
        when(reservationRepository.save(any(Reservation.class))).thenReturn(savedReservation);

        ReservationDTO result = reservationService.confirmer(dto, 1L, 10L);

        assertNotNull(result);
        assertEquals(new BigDecimal("150.0"), result.getPrixTotal());
        assertEquals("EN_ATTENTE", result.getStatut());
        verify(reservationRepository, times(1)).save(any(Reservation.class));
    }

    @Test
    void testConfirmer_ThrowsException_WhenSelfBooking() {
        ReservationDTO dto = new ReservationDTO();
        dto.setDateDebut(LocalDate.now().plusDays(1));
        dto.setDateFin(LocalDate.now().plusDays(4));

        // The user trying to book is the bailleur
        when(userRepository.findById(2L)).thenReturn(Optional.of(bailleur));
        when(annonceRepository.findById(10L)).thenReturn(Optional.of(annonce));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            reservationService.confirmer(dto, 2L, 10L);
        });

        assertEquals("Vous ne pouvez pas réserver votre propre annonce !", exception.getMessage());
        verify(reservationRepository, never()).save(any(Reservation.class));
    }

    @Test
    void testConfirmer_ThrowsException_WhenInvalidDates() {
        ReservationDTO dto = new ReservationDTO();
        dto.setDateDebut(LocalDate.now().plusDays(5));
        dto.setDateFin(LocalDate.now().plusDays(2)); // End date before start date

        when(userRepository.findById(1L)).thenReturn(Optional.of(locataire));
        when(annonceRepository.findById(10L)).thenReturn(Optional.of(annonce));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            reservationService.confirmer(dto, 1L, 10L);
        });

        assertEquals("La date de fin doit être après la date de début !", exception.getMessage());
        verify(reservationRepository, never()).save(any(Reservation.class));
    }
}
