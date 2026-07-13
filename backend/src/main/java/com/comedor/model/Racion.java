package com.comedor.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "raciones", uniqueConstraints = {
    @UniqueConstraint(name = "uq_racion_diaria", columnNames = {"id_beneficiario", "fecha_entrega"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Racion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_racion")
    private Long idRacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_beneficiario", nullable = false, foreignKey = @ForeignKey(name = "fk_raciones_beneficiario"))
    private Beneficiario beneficiario;

    @Column(name = "fecha_entrega", nullable = false)
    private LocalDate fechaEntrega;
}