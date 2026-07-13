package com.comedor.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RacionRequest {

    @NotNull(message = "El ID del beneficiario es obligatorio")
    private Long idBeneficiario;

    @NotNull(message = "La fecha de entrega es obligatoria")
    @PastOrPresent(message = "La fecha de entrega no puede ser futura")
    private LocalDate fechaEntrega;
}