package com.comedor.controller;

import com.comedor.dto.request.RacionRequest;
import com.comedor.dto.response.RacionResponse;
import com.comedor.service.RacionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/raciones")
public class RacionController {

    private final RacionService racionService;

    public RacionController(RacionService racionService) {
        this.racionService = racionService;
    }

    @GetMapping
    public ResponseEntity<List<RacionResponse>> findAll(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) Long idBeneficiario) {
        return ResponseEntity.ok(racionService.findAll(fecha, idBeneficiario));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RacionResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(racionService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('Administradora')")
    public ResponseEntity<RacionResponse> create(@Valid @RequestBody RacionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(racionService.create(request));
    }
}