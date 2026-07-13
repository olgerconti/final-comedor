package com.comedor.controller;

import com.comedor.dto.request.BeneficiarioRequest;
import com.comedor.dto.response.BeneficiarioResponse;
import com.comedor.service.BeneficiarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beneficiarios")
public class BeneficiarioController {

    private final BeneficiarioService beneficiarioService;

    public BeneficiarioController(BeneficiarioService beneficiarioService) {
        this.beneficiarioService = beneficiarioService;
    }

    @GetMapping
    public ResponseEntity<List<BeneficiarioResponse>> findAll() {
        return ResponseEntity.ok(beneficiarioService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BeneficiarioResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(beneficiarioService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('Administradora')")
    public ResponseEntity<BeneficiarioResponse> create(
            @Valid @RequestBody BeneficiarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(beneficiarioService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Administradora')")
    public ResponseEntity<BeneficiarioResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody BeneficiarioRequest request) {
        return ResponseEntity.ok(beneficiarioService.update(id, request));
    }
}