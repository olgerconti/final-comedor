package com.comedor.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BeneficiarioRequest {

    @NotBlank(message = "El DNI es obligatorio")
    @Pattern(regexp = "\\d{8}", message = "El DNI debe tener 8 dígitos numéricos")
    private String dni;

    @NotBlank(message = "Los nombres y apellidos son obligatorios")
    @Size(min = 5, max = 200, message = "Debe tener entre 5 y 200 caracteres")
    private String nombresApellidos;

    @NotBlank(message = "La condición es obligatoria")
    @Size(max = 100, message = "La condición no debe exceder 100 caracteres")
    private String condicion;
}