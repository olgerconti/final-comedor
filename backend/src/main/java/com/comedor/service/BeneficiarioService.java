package com.comedor.service;

import com.comedor.dto.request.BeneficiarioRequest;
import com.comedor.dto.response.BeneficiarioResponse;
import com.comedor.exception.RecursoNoEncontradoException;
import com.comedor.model.Beneficiario;
import com.comedor.repository.BeneficiarioRepository;
import com.comedor.repository.RacionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BeneficiarioService {

    private final BeneficiarioRepository beneficiarioRepository;
    private final RacionRepository racionRepository;

    public BeneficiarioService(BeneficiarioRepository beneficiarioRepository,
                               RacionRepository racionRepository) {
        this.beneficiarioRepository = beneficiarioRepository;
        this.racionRepository = racionRepository;
    }

    public BeneficiarioResponse create(BeneficiarioRequest request) {
        if (beneficiarioRepository.existsByDni(request.getDni())) {
            throw new IllegalArgumentException("Ya existe un beneficiario con el DNI " + request.getDni());
        }

        Beneficiario beneficiario = Beneficiario.builder()
                .dni(request.getDni())
                .nombresApellidos(request.getNombresApellidos())
                .condicion(request.getCondicion())
                .build();

        beneficiario = beneficiarioRepository.save(beneficiario);
        return toResponse(beneficiario);
    }

    public List<BeneficiarioResponse> findAll() {
        return beneficiarioRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public BeneficiarioResponse findById(Long id) {
        Beneficiario beneficiario = beneficiarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Beneficiario", id));
        return toResponse(beneficiario);
    }

    public BeneficiarioResponse update(Long id, BeneficiarioRequest request) {
        Beneficiario beneficiario = beneficiarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Beneficiario", id));

        if (!beneficiario.getDni().equals(request.getDni())
                && beneficiarioRepository.existsByDni(request.getDni())) {
            throw new IllegalArgumentException("Ya existe un beneficiario con el DNI " + request.getDni());
        }

        beneficiario.setDni(request.getDni());
        beneficiario.setNombresApellidos(request.getNombresApellidos());
        beneficiario.setCondicion(request.getCondicion());

        beneficiario = beneficiarioRepository.save(beneficiario);
        return toResponse(beneficiario);
    }

    private BeneficiarioResponse toResponse(Beneficiario b) {
        return BeneficiarioResponse.builder()
                .idBeneficiario(b.getIdBeneficiario())
                .dni(b.getDni())
                .nombresApellidos(b.getNombresApellidos())
                .condicion(b.getCondicion())
                .build();
    }
}