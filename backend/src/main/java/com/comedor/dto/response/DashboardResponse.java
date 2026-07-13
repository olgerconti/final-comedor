package com.comedor.dto.response;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {

    private StockTotal stockTotal;
    private List<AlertaLote> alertas;
    private long racionesEntregadasHoy;
    private Double mermaPromedioSemanal;
    private List<ProductoRotacion> productosMayorRotacion;
    private List<UltimoMovimiento> ultimosMovimientos;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StockTotal {
        private long totalInsumos;
        private long totalCategorias;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AlertaLote {
        private Long idLote;
        private String nombreInsumo;
        private Double cantidadActual;
        private java.time.LocalDate fechaVencimiento;
        private Long diasRestantes;
        private String nivelAlerta;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductoRotacion {
        private String nombreInsumo;
        private long salidasMes;
        private Double cantidadTotalSalida;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UltimoMovimiento {
        private String tipo;
        private String nombreInsumo;
        private Double cantidad;
        private java.time.LocalDateTime fechaRegistro;
    }
}