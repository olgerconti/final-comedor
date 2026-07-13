package com.comedor.controller;

import com.comedor.dto.request.LoteIngresoRequest;
import com.comedor.dto.response.LoteResponse;
import com.comedor.service.LoteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lotes")
public class LoteController {

    private final LoteService loteService;

    public LoteController(LoteService loteService) {
        this.loteService = loteService;
    }

    @GetMapping
    public ResponseEntity<List<LoteResponse>> findAll(
            @RequestParam(required = false) Long idInsumo) {
        if (idInsumo != null) {
            return ResponseEntity.ok(loteService.findByInsumo(idInsumo));
        }
        return ResponseEntity.ok(loteService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoteResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(loteService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('Administradora')")
    public ResponseEntity<LoteResponse> create(@Valid @RequestBody LoteIngresoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(loteService.create(request));
    }
}