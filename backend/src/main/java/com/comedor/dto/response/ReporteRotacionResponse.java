package com.comedor.dto.response;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReporteRotacionResponse {

    private String periodo;
    private List<ProductoRotacion> productos;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductoRotacion {
        private String nombreInsumo;
        private long vecesSalida;
        private Double cantidadTotalSalida;
    }
}