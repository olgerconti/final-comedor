package com.comedor.service;

import com.comedor.dto.request.MovimientoSalidaRequest;
import com.comedor.dto.response.MovimientoResponse;
import com.comedor.dto.response.MovimientoSalidaResponse;
import com.comedor.exception.RecursoNoEncontradoException;
import com.comedor.exception.StockInsuficienteException;
import com.comedor.model.Insumo;
import com.comedor.model.LoteInventario;
import com.comedor.model.Movimiento;
import com.comedor.repository.InsumoRepository;
import com.comedor.repository.LoteInventarioRepository;
import com.comedor.repository.MovimientoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MovimientoService {

    private final MovimientoRepository movimientoRepository;
    private final LoteInventarioRepository loteInventarioRepository;
    private final InsumoRepository insumoRepository;

    public MovimientoService(MovimientoRepository movimientoRepository,
                             LoteInventarioRepository loteInventarioRepository,
                             InsumoRepository insumoRepository) {
        this.movimientoRepository = movimientoRepository;
        this.loteInventarioRepository = loteInventarioRepository;
        this.insumoRepository = insumoRepository;
    }

    /**
     * Registra una salida de inventario aplicando el algoritmo PEPS
     * (Primero en Entrar, Primero en Salir).
     *
     * El algoritmo consulta los lotes activos del insumo ordenados por
     * fecha de vencimiento ascendente. Descuenta secuencialmente del
     * más antiguo al más nuevo hasta completar la cantidad solicitada.
     */
    @Transactional
    public MovimientoSalidaResponse registrarSalida(MovimientoSalidaRequest request) {
        Insumo insumo = insumoRepository.findById(request.getIdInsumo())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Insumo", request.getIdInsumo()));

        List<LoteInventario> lotesOrdenados = loteInventarioRepository
                .findByInsumoIdInsumoAndCantidadActualGreaterThanOrderByFechaVencimientoAsc(
                        request.getIdInsumo(), 0.0);

        double cantidadRestante = request.getCantidad();
        double stockTotal = lotesOrdenados.stream()
                .mapToDouble(LoteInventario::getCantidadActual)
                .sum();

        if (cantidadRestante > stockTotal) {
            throw new StockInsuficienteException(
                    insumo.getNombre(), request.getCantidad(), stockTotal);
        }

        List<MovimientoSalidaResponse.LoteAfectado> lotesAfectados = new ArrayList<>();

        for (LoteInventario lote : lotesOrdenados) {
            if (cantidadRestante <= 0) break;

            double cantidadADescontar = Math.min(cantidadRestante, lote.getCantidadActual());

            lote.setCantidadActual(lote.getCantidadActual() - cantidadADescontar);
            loteInventarioRepository.save(lote);

            Movimiento movimiento = Movimiento.builder()
                    .lote(lote)
                    .tipoMovimiento("SALIDA")
                    .cantidadMovida(cantidadADescontar)
                    .pesoBruto(request.getPesoBruto())
                    .pesoNeto(request.getPesoNeto())
                    .fechaRegistro(LocalDateTime.now())
                    .build();

            movimientoRepository.save(movimiento);

            lotesAfectados.add(MovimientoSalidaResponse.LoteAfectado.builder()
                    .idLote(lote.getIdLote())
                    .cantidadDescontada(cantidadADescontar)
                    .loteRestante(lote.getCantidadActual())
                    .build());

            cantidadRestante -= cantidadADescontar;
        }

        return MovimientoSalidaResponse.builder()
                .mensaje("Salida registrada con PEPS")
                .movimientosGenerados(lotesAfectados)
                .build();
    }

    public List<MovimientoResponse> findAll(String tipo, LocalDateTime inicio, LocalDateTime fin) {
        List<Movimiento> movimientos;

        if (tipo != null && inicio != null && fin != null) {
            movimientos = movimientoRepository.findByTipoMovimientoAndFechaRegistroBetween(
                    tipo, inicio, fin);
        } else if (tipo != null) {
            movimientos = movimientoRepository.findByTipoMovimiento(tipo);
        } else if (inicio != null && fin != null) {
            movimientos = movimientoRepository.findByFechaRegistroBetween(inicio, fin);
        } else {
            movimientos = movimientoRepository.findAll();
        }

        return movimientos.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public MovimientoResponse findById(Long id) {
        Movimiento movimiento = movimientoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Movimiento", id));
        return toResponse(movimiento);
    }

    private MovimientoResponse toResponse(Movimiento movimiento) {
        String nombreInsumo = movimiento.getLote() != null
                && movimiento.getLote().getInsumo() != null
                ? movimiento.getLote().getInsumo().getNombre()
                : null;
        String categoria = movimiento.getLote() != null
                && movimiento.getLote().getInsumo() != null
                ? movimiento.getLote().getInsumo().getCategoria()
                : null;

        return MovimientoResponse.builder()
                .idMovimiento(movimiento.getIdMovimiento())
                .tipoMovimiento(movimiento.getTipoMovimiento())
                .cantidadMovida(movimiento.getCantidadMovida())
                .pesoBruto(movimiento.getPesoBruto())
                .pesoNeto(movimiento.getPesoNeto())
                .fechaRegistro(movimiento.getFechaRegistro())
                .nombreInsumo(nombreInsumo)
                .categoria(categoria)
                .idLote(movimiento.getLote() != null ? movimiento.getLote().getIdLote() : null)
                .build();
    }
}