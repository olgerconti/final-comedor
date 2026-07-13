package com.comedor.dto.response;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReporteMermasResponse {

    private String periodo;
    private Double mermaPromedioGlobal;
    private List<DetalleMerma> detalle;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetalleMerma {
        private String nombreInsumo;
        private Double pesoBrutoTotal;
        private Double pesoNetoTotal;
        private Double mermaPorcentaje;
    }
}