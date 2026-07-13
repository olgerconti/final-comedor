package com.comedor.controller;

import com.comedor.dto.request.MovimientoSalidaRequest;
import com.comedor.dto.response.MovimientoResponse;
import com.comedor.dto.response.MovimientoSalidaResponse;
import com.comedor.service.MovimientoService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/movimientos")
public class MovimientoController {

    private final MovimientoService movimientoService;

    public MovimientoController(MovimientoService movimientoService) {
        this.movimientoService = movimientoService;
    }

    @GetMapping
    public ResponseEntity<List<MovimientoResponse>> findAll(
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        return ResponseEntity.ok(movimientoService.findAll(tipo, fechaInicio, fechaFin));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovimientoResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(movimientoService.findById(id));
    }

    @PostMapping("/salida")
    @PreAuthorize("hasRole('Administradora')")
    public ResponseEntity<MovimientoSalidaResponse> registrarSalida(
            @Valid @RequestBody MovimientoSalidaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(movimientoService.registrarSalida(request));
    }
}