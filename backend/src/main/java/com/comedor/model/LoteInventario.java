package com.comedor.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "lotes_inventario", indexes = {
    @Index(name = "idx_lotes_peps", columnList = "id_insumo, fecha_vencimiento")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoteInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_lote")
    private Long idLote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_insumo", nullable = false, foreignKey = @ForeignKey(name = "fk_lotes_insumo"))
    private Insumo insumo;

    @Column(name = "cantidad_actual", nullable = false, columnDefinition = "DECIMAL(10,2)")
    private Double cantidadActual;

    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;
}