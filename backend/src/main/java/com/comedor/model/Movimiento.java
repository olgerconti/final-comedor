package com.comedor.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimientos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_movimiento")
    private Long idMovimiento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lote", nullable = false, foreignKey = @ForeignKey(name = "fk_movimientos_lote"))
    private LoteInventario lote;

    @Column(name = "tipo_movimiento", nullable = false, length = 10)
    private String tipoMovimiento;

    @Column(name = "cantidad_movida", nullable = false, columnDefinition = "DECIMAL(10,2)")
    private Double cantidadMovida;

    @Column(name = "peso_bruto", columnDefinition = "DECIMAL(10,2)")
    private Double pesoBruto;

    @Column(name = "peso_neto", columnDefinition = "DECIMAL(10,2)")
    private Double pesoNeto;

    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    @PrePersist
    protected void onCreate() {
        if (fechaRegistro == null) {
            fechaRegistro = LocalDateTime.now();
        }
    }
}