package com.comedor.service;

import com.comedor.dto.request.RacionRequest;
import com.comedor.dto.response.RacionResponse;
import com.comedor.exception.RecursoNoEncontradoException;
import com.comedor.model.Beneficiario;
import com.comedor.model.Racion;
import com.comedor.repository.BeneficiarioRepository;
import com.comedor.repository.RacionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RacionService {

    private final RacionRepository racionRepository;
    private final BeneficiarioRepository beneficiarioRepository;

    public RacionService(RacionRepository racionRepository,
                         BeneficiarioRepository beneficiarioRepository) {
        this.racionRepository = racionRepository;
        this.beneficiarioRepository = beneficiarioRepository;
    }

    public RacionResponse create(RacionRequest request) {
        Beneficiario beneficiario = beneficiarioRepository.findById(request.getIdBeneficiario())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Beneficiario", request.getIdBeneficiario()));

        if (racionRepository.existsByBeneficiarioIdBeneficiarioAndFechaEntrega(
                request.getIdBeneficiario(), request.getFechaEntrega())) {
            throw new IllegalArgumentException(
                    "El beneficiario ya tiene una ración registrada para esta fecha");
        }

        Racion racion = Racion.builder()
                .beneficiario(beneficiario)
                .fechaEntrega(request.getFechaEntrega())
                .build();

        racion = racionRepository.save(racion);
        return toResponse(racion);
    }

    public List<RacionResponse> findAll(java.time.LocalDate fecha, Long idBeneficiario) {
        List<Racion> raciones;

        if (fecha != null) {
            raciones = racionRepository.findByFechaEntrega(fecha);
        } else if (idBeneficiario != null) {
            raciones = racionRepository.findByBeneficiarioIdBeneficiario(idBeneficiario);
        } else {
            raciones = racionRepository.findAll();
        }

        return raciones.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public RacionResponse findById(Long id) {
        Racion racion = racionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Ración", id));
        return toResponse(racion);
    }

    private RacionResponse toResponse(Racion racion) {
        Beneficiario b = racion.getBeneficiario();
        return RacionResponse.builder()
                .idRacion(racion.getIdRacion())
                .idBeneficiario(b.getIdBeneficiario())
                .dni(b.getDni())
                .nombresApellidos(b.getNombresApellidos())
                .fechaEntrega(racion.getFechaEntrega())
                .build();
    }
}