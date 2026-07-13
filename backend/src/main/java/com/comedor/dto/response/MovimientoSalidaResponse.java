package com.comedor.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimientoSalidaResponse {

    private String mensaje;
    private java.util.List<LoteAfectado> movimientosGenerados;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoteAfectado {
        private Long idLote;
        private Double cantidadDescontada;
        private Double loteRestante;
    }
}