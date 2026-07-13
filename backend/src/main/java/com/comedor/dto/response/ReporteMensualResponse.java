package com.comedor.dto.response;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReporteMensualResponse {

    private String periodo;
    private Double totalIngresos;
    private Double totalSalidas;
    private List<InsumoConsumido> insumosConsumidos;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InsumoConsumido {
        private String nombre;
        private Double cantidadTotal;
    }
}