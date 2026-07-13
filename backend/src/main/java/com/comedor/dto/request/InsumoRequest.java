package com.comedor.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsumoRequest {

    @NotBlank(message = "El nombre del insumo es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    private String nombre;

    @NotBlank(message = "La unidad de medida es obligatoria")
    @Size(max = 20, message = "La unidad de medida no debe exceder 20 caracteres")
    private String unidadMedida;

    @NotBlank(message = "La categoría es obligatoria")
    @Size(max = 50, message = "La categoría no debe exceder 50 caracteres")
    private String categoria;
}