package com.example.pfeporject.entity;



import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "annonces")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Annonce {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;
    private String description;
    private BigDecimal prix;
    private String localisation;
    private Double latitude;
    private Double longitude;
    private LocalDate disponibiliteDebut;
    private LocalDate disponibiliteFin;

    @Enumerated(EnumType.STRING)
    private StatutAnnonce statut;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.statut == null) this.statut = StatutAnnonce.EN_ATTENTE;
    }

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToOne(mappedBy = "annonce", cascade = CascadeType.ALL)
    private Logement logement;

    @OneToMany(mappedBy = "annonce", cascade = CascadeType.ALL)
    private List<Reservation> reservations;

    @OneToMany(mappedBy = "annonce", cascade = CascadeType.ALL)
    private List<Avis> avis;

    public enum StatutAnnonce {
        EN_ATTENTE, VALIDEE, REJETEE, SUSPENDUE
    }
}