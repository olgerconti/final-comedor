package com.comedor.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioResponse {

    private Long idUsuario;
    private String correo;
    private String rol;
}