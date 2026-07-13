package com.comedor.service;

import com.comedor.dto.request.InsumoRequest;
import com.comedor.dto.response.InsumoResponse;
import com.comedor.exception.RecursoNoEncontradoException;
import com.comedor.model.Insumo;
import com.comedor.repository.InsumoRepository;
import com.comedor.repository.LoteInventarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InsumoService {

    private final InsumoRepository insumoRepository;
    private final LoteInventarioRepository loteInventarioRepository;

    public InsumoService(InsumoRepository insumoRepository,
                         LoteInventarioRepository loteInventarioRepository) {
        this.insumoRepository = insumoRepository;
        this.loteInventarioRepository = loteInventarioRepository;
    }

    public InsumoResponse create(InsumoRequest request) {
        if (insumoRepository.existsByNombre(request.getNombre())) {
            throw new IllegalArgumentException("Ya existe un insumo con el nombre '" + request.getNombre() + "'");
        }

        Insumo insumo = Insumo.builder()
                .nombre(request.getNombre())
                .unidadMedida(request.getUnidadMedida())
                .categoria(request.getCategoria())
                .build();

        insumo = insumoRepository.save(insumo);
        return toResponse(insumo);
    }

    public List<InsumoResponse> findAll() {
        return insumoRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<InsumoResponse> findByCategoria(String categoria) {
        return insumoRepository.findByCategoria(categoria).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public InsumoResponse findById(Long id) {
        Insumo insumo = insumoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Insumo", id));
        return toResponse(insumo);
    }

    public InsumoResponse update(Long id, InsumoRequest request) {
        Insumo insumo = insumoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Insumo", id));

        if (!insumo.getNombre().equals(request.getNombre())
                && insumoRepository.existsByNombre(request.getNombre())) {
            throw new IllegalArgumentException("Ya existe un insumo con el nombre '" + request.getNombre() + "'");
        }

        insumo.setNombre(request.getNombre());
        insumo.setUnidadMedida(request.getUnidadMedida());
        insumo.setCategoria(request.getCategoria());

        insumo = insumoRepository.save(insumo);
        return toResponse(insumo);
    }

    public void delete(Long id) {
        Insumo insumo = insumoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Insumo", id));

        if (!loteInventarioRepository.findByInsumoIdInsumo(id).isEmpty()) {
            throw new IllegalArgumentException(
                    "No se puede eliminar el insumo porque tiene lotes asociados");
        }

        insumoRepository.delete(insumo);
    }

    private InsumoResponse toResponse(Insumo insumo) {
        return InsumoResponse.builder()
                .idInsumo(insumo.getIdInsumo())
                .nombre(insumo.getNombre())
                .unidadMedida(insumo.getUnidadMedida())
                .categoria(insumo.getCategoria())
                .build();
    }
}