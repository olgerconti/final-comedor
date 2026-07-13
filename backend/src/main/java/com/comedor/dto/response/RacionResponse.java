package com.comedor.dto.response;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RacionResponse {

    private Long idRacion;
    private Long idBeneficiario;
    private String dni;
    private String nombresApellidos;
    private LocalDate fechaEntrega;
}