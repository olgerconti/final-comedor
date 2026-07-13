package com.comedor.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsumoResponse {

    private Long idInsumo;
    private String nombre;
    private String unidadMedida;
    private String categoria;
}