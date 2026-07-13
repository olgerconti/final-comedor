package com.comedor.dto.response;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReporteInventarioResponse {

    private String fecha;
    private List<StockCategoria> stockPorCategoria;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StockCategoria {
        private String categoria;
        private Double cantidadTotal;
        private long items;
    }
}