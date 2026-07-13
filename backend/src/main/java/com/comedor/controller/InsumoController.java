package com.comedor.controller;

import com.comedor.dto.request.InsumoRequest;
import com.comedor.dto.response.InsumoResponse;
import com.comedor.service.InsumoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insumos")
public class InsumoController {

    private final InsumoService insumoService;

    public InsumoController(InsumoService insumoService) {
        this.insumoService = insumoService;
    }

    @GetMapping
    public ResponseEntity<List<InsumoResponse>> findAll(
            @RequestParam(required = false) String categoria) {
        if (categoria != null && !categoria.isEmpty()) {
            return ResponseEntity.ok(insumoService.findByCategoria(categoria));
        }
        return ResponseEntity.ok(insumoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsumoResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(insumoService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('Administradora')")
    public ResponseEntity<InsumoResponse> create(@Valid @RequestBody InsumoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(insumoService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Administradora')")
    public ResponseEntity<InsumoResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody InsumoRequest request) {
        return ResponseEntity.ok(insumoService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Administradora')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        insumoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}