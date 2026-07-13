package com.comedor.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReporteSalidasResponse {

    private Periodo periodo;
    private long totalSalidas;
    private List<DetalleSalida> detalle;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Periodo {
        private LocalDate inicio;
        private LocalDate fin;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetalleSalida {
        private LocalDate fecha;
        private String nombreInsumo;
        private Double cantidad;
    }
}