package com.comedor.dto.response;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoteResponse {

    private Long idLote;
    private Long idInsumo;
    private String nombreInsumo;
    private Double cantidadActual;
    private LocalDate fechaVencimiento;
    private Long diasRestantes;
}