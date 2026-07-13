package com.comedor.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReporteBeneficiariosResponse {

    private String periodo;
    private long totalBeneficiarios;
    private long totalRacionesEntregadas;
    private Double promedioDiario;
}