package com.comedor.service;

import com.comedor.dto.response.DashboardResponse;
import com.comedor.model.LoteInventario;
import com.comedor.model.Movimiento;
import com.comedor.repository.InsumoRepository;
import com.comedor.repository.LoteInventarioRepository;
import com.comedor.repository.MovimientoRepository;
import com.comedor.repository.RacionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final LoteInventarioRepository loteInventarioRepository;
    private final InsumoRepository insumoRepository;
    private final RacionRepository racionRepository;
    private final MovimientoRepository movimientoRepository;

    public DashboardService(LoteInventarioRepository loteInventarioRepository,
                            InsumoRepository insumoRepository,
                            RacionRepository racionRepository,
                            MovimientoRepository movimientoRepository) {
        this.loteInventarioRepository = loteInventarioRepository;
        this.insumoRepository = insumoRepository;
        this.racionRepository = racionRepository;
        this.movimientoRepository = movimientoRepository;
    }

    /**
     * Genera los 7 indicadores del dashboard en una sola respuesta.
     */
    public DashboardResponse getDashboard() {
        LocalDate hoy = LocalDate.now();
        LocalDate inicioSemana = hoy.minusDays(7);

        // 1. Stock total
        long totalInsumos = insumoRepository.count();
        long totalCategorias = insumoRepository.findAll().stream()
                .map(i -> i.getCategoria())
                .distinct()
                .count();

        // 2. Alertas
        List<DashboardResponse.AlertaLote> alertas = loteInventarioRepository
                .findLotesActivosOrdenadosPorVencimiento()
                .stream()
                .map(lote -> {
                    long diasRestantes = ChronoUnit.DAYS.between(hoy, lote.getFechaVencimiento());
                    String nivelAlerta = clasificarAlerta(diasRestantes, lote.getCantidadActual());
                    return DashboardResponse.AlertaLote.builder()
                            .idLote(lote.getIdLote())
                            .nombreInsumo(lote.getInsumo().getNombre())
                            .cantidadActual(lote.getCantidadActual())
                            .fechaVencimiento(lote.getFechaVencimiento())
                            .diasRestantes(diasRestantes)
                            .nivelAlerta(nivelAlerta)
                            .build();
                })
                .collect(Collectors.toList());

        // Agregar lotes agotados o vencidos
        loteInventarioRepository.findLotesAgotadosOVencidos().forEach(lote -> {
            long diasRestantes = ChronoUnit.DAYS.between(hoy, lote.getFechaVencimiento());
            String nivelAlerta;

            if (lote.getCantidadActual() <= 0) {
                nivelAlerta = "stock_agotado";
            } else {
                nivelAlerta = "producto_vencido";
            }

            alertas.add(DashboardResponse.AlertaLote.builder()
                    .idLote(lote.getIdLote())
                    .nombreInsumo(lote.getInsumo().getNombre())
                    .cantidadActual(lote.getCantidadActual())
                    .fechaVencimiento(lote.getFechaVencimiento())
                    .diasRestantes(diasRestantes)
                    .nivelAlerta(nivelAlerta)
                    .build());
        });

        // Ordenar alertas por días restantes (más urgentes primero)
        alertas.sort(Comparator.comparingLong(DashboardResponse.AlertaLote::getDiasRestantes));

        // 3. Raciones entregadas hoy
        long racionesHoy = racionRepository.countByFechaEntrega(hoy);

        // 4. Merma promedio semanal
        Double mermaPromedio = calcularMermaPromedio(inicioSemana, hoy);

        // 5. Productos con mayor rotación (últimos 30 días)
        List<DashboardResponse.ProductoRotacion> rotacion = calcularRotacion(
                hoy.minusDays(30), hoy);

        // 6. Últimos movimientos (top 10)
        List<DashboardResponse.UltimoMovimiento> ultimos = movimientoRepository
                .findTop10ByOrderByFechaRegistroDesc()
                .stream()
                .map(m -> DashboardResponse.UltimoMovimiento.builder()
                        .tipo(m.getTipoMovimiento())
                        .nombreInsumo(m.getLote() != null && m.getLote().getInsumo() != null
                                ? m.getLote().getInsumo().getNombre() : "Desconocido")
                        .cantidad(m.getCantidadMovida())
                        .fechaRegistro(m.getFechaRegistro())
                        .build())
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .stockTotal(DashboardResponse.StockTotal.builder()
                        .totalInsumos(totalInsumos)
                        .totalCategorias(totalCategorias)
                        .build())
                .alertas(alertas)
                .racionesEntregadasHoy(racionesHoy)
                .mermaPromedioSemanal(mermaPromedio)
                .productosMayorRotacion(rotacion)
                .ultimosMovimientos(ultimos)
                .build();
    }

    /**
     * Clasifica el nivel de alerta según días restantes y stock.
     */
    private String clasificarAlerta(long diasRestantes, Double cantidadActual) {
        if (cantidadActual <= 0) return "stock_agotado";
        if (diasRestantes < 0) return "producto_vencido";
        if (diasRestantes <= 3) return "rojo";
        if (diasRestantes <= 5) return "naranja";
        if (diasRestantes <= 7) return "amarillo";
        return "normal";
    }

    /**
     * Calcula el promedio de merma en un período usando la fórmula:
     * MERMA = ((Peso Bruto - Peso Neto) / Peso Bruto) * 100
     */
    private Double calcularMermaPromedio(LocalDate inicio, LocalDate fin) {
        LocalDateTime inicioDt = inicio.atStartOfDay();
        LocalDateTime finDt = fin.plusDays(1).atStartOfDay();

        List<Movimiento> salidas = movimientoRepository
                .findByTipoMovimientoAndFechaRegistroBetween("SALIDA", inicioDt, finDt);

        if (salidas.isEmpty()) return 0.0;

        double mermaTotal = 0.0;
        int count = 0;

        for (Movimiento m : salidas) {
            if (m.getPesoBruto() != null && m.getPesoNeto() != null && m.getPesoBruto() > 0) {
                double merma = ((m.getPesoBruto() - m.getPesoNeto()) / m.getPesoBruto()) * 100;
                mermaTotal += merma;
                count++;
            }
        }

        return count > 0 ? mermaTotal / count : 0.0;
    }

    /**
     * Calcula los productos con mayor rotación en un período.
     */
    private List<DashboardResponse.ProductoRotacion> calcularRotacion(
            LocalDate inicio, LocalDate fin) {
        LocalDateTime inicioDt = inicio.atStartOfDay();
        LocalDateTime finDt = fin.plusDays(1).atStartOfDay();

        List<Movimiento> salidas = movimientoRepository
                .findByTipoMovimientoAndFechaRegistroBetween("SALIDA", inicioDt, finDt);

        Map<String, DashboardResponse.ProductoRotacion> mapa = new HashMap<>();

        for (Movimiento m : salidas) {
            String nombre = m.getLote() != null && m.getLote().getInsumo() != null
                    ? m.getLote().getInsumo().getNombre() : "Desconocido";

            mapa.compute(nombre, (k, v) -> {
                if (v == null) {
                    return DashboardResponse.ProductoRotacion.builder()
                            .nombreInsumo(k)
                            .salidasMes(1L)
                            .cantidadTotalSalida(m.getCantidadMovida())
                            .build();
                }
                v.setSalidasMes(v.getSalidasMes() + 1);
                v.setCantidadTotalSalida(v.getCantidadTotalSalida() + m.getCantidadMovida());
                return v;
            });
        }

        return mapa.values().stream()
                .sorted((a, b) -> Long.compare(b.getSalidasMes(), a.getSalidasMes()))
                .limit(5)
                .collect(Collectors.toList());
    }
}