package com.example.pfeporject.entity;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "logements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Logement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer nbChambres;
    private Double superficie;
    private String description;
    private Integer dureeMin;
    private Integer dureeMax;

    @OneToOne
    @JoinColumn(name = "annonce_id")
    private Annonce annonce;
}