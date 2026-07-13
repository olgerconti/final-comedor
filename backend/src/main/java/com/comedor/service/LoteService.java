package com.comedor.service;

import com.comedor.dto.request.LoteIngresoRequest;
import com.comedor.dto.response.LoteResponse;
import com.comedor.exception.RecursoNoEncontradoException;
import com.comedor.model.Insumo;
import com.comedor.model.LoteInventario;
import com.comedor.model.Movimiento;
import com.comedor.repository.InsumoRepository;
import com.comedor.repository.LoteInventarioRepository;
import com.comedor.repository.MovimientoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LoteService {

    private final LoteInventarioRepository loteInventarioRepository;
    private final InsumoRepository insumoRepository;
    private final MovimientoRepository movimientoRepository;

    public LoteService(LoteInventarioRepository loteInventarioRepository,
                       InsumoRepository insumoRepository,
                       MovimientoRepository movimientoRepository) {
        this.loteInventarioRepository = loteInventarioRepository;
        this.insumoRepository = insumoRepository;
        this.movimientoRepository = movimientoRepository;
    }

    @Transactional
    public LoteResponse create(LoteIngresoRequest request) {
        if (request.getFechaVencimiento().isBefore(LocalDate.now())
                || request.getFechaVencimiento().isEqual(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "La fecha de vencimiento debe ser posterior a hoy");
        }

        Insumo insumo = insumoRepository.findById(request.getIdInsumo())
                .orElseThrow(() -> new RecursoNoEncontradoException("Insumo", request.getIdInsumo()));

        LoteInventario lote = LoteInventario.builder()
                .insumo(insumo)
                .cantidadActual(request.getCantidad())
                .fechaVencimiento(request.getFechaVencimiento())
                .build();

        lote = loteInventarioRepository.save(lote);

        Movimiento movimiento = Movimiento.builder()
                .lote(lote)
                .tipoMovimiento("INGRESO")
                .cantidadMovida(request.getCantidad())
                .build();

        movimientoRepository.save(movimiento);

        return toResponse(lote);
    }

    public List<LoteResponse> findAll() {
        return loteInventarioRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<LoteResponse> findByInsumo(Long idInsumo) {
        return loteInventarioRepository.findByInsumoIdInsumo(idInsumo).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public LoteResponse findById(Long id) {
        LoteInventario lote = loteInventarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Lote", id));
        return toResponse(lote);
    }

    private LoteResponse toResponse(LoteInventario lote) {
        long diasRestantes = ChronoUnit.DAYS.between(LocalDate.now(), lote.getFechaVencimiento());

        return LoteResponse.builder()
                .idLote(lote.getIdLote())
                .idInsumo(lote.getInsumo().getIdInsumo())
                .nombreInsumo(lote.getInsumo().getNombre())
                .cantidadActual(lote.getCantidadActual())
                .fechaVencimiento(lote.getFechaVencimiento())
                .diasRestantes(diasRestantes)
                .build();
    }
}