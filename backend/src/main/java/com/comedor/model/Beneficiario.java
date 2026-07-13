package com.comedor.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "beneficiarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Beneficiario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_beneficiario")
    private Long idBeneficiario;

    @Column(nullable = false, unique = true, length = 8)
    private String dni;

    @Column(name = "nombres_apellidos", nullable = false, length = 200)
    private String nombresApellidos;

    @Column(nullable = false, length = 100)
    private String condicion;
}