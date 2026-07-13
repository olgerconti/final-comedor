package com.comedor.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BeneficiarioResponse {

    private Long idBeneficiario;
    private String dni;
    private String nombresApellidos;
    private String condicion;
}