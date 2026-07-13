package com.comedor.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimientoResponse {

    private Long idMovimiento;
    private String tipoMovimiento;
    private Double cantidadMovida;
    private Double pesoBruto;
    private Double pesoNeto;
    private LocalDateTime fechaRegistro;
    private String nombreInsumo;
    private String categoria;
    private Long idLote;
}