package com.comedor.service;

import com.comedor.dto.request.LoginRequest;
import com.comedor.dto.request.RegisterRequest;
import com.comedor.dto.response.AuthResponse;
import com.comedor.dto.response.UsuarioResponse;
import com.comedor.model.Usuario;
import com.comedor.repository.UsuarioRepository;
import com.comedor.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UsuarioRepository usuarioRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public AuthResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }

        Usuario usuario = Usuario.builder()
                .correo(request.getCorreo())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .rol(request.getRol())
                .build();

        usuario = usuarioRepository.save(usuario);

        String token = jwtTokenProvider.generateToken(usuario.getIdUsuario(), usuario.getRol());

        return AuthResponse.builder()
                .token(token)
                .rol(usuario.getRol())
                .correo(usuario.getCorreo())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new IllegalArgumentException("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash())) {
            throw new IllegalArgumentException("Credenciales inválidas");
        }

        String token = jwtTokenProvider.generateToken(usuario.getIdUsuario(), usuario.getRol());

        return AuthResponse.builder()
                .token(token)
                .rol(usuario.getRol())
                .correo(usuario.getCorreo())
                .build();
    }

    public UsuarioResponse getMe(Long userId) {
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        return UsuarioResponse.builder()
                .idUsuario(usuario.getIdUsuario())
                .correo(usuario.getCorreo())
                .rol(usuario.getRol())
                .build();
    }
}