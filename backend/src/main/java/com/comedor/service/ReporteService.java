package com.comedor.service;

import com.comedor.dto.response.*;
import com.comedor.model.LoteInventario;
import com.comedor.model.Movimiento;
import com.comedor.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReporteService {

    private final MovimientoRepository movimientoRepository;
    private final BeneficiarioRepository beneficiarioRepository;
    private final RacionRepository racionRepository;
    private final InsumoRepository insumoRepository;
    private final LoteInventarioRepository loteInventarioRepository;

    public ReporteService(MovimientoRepository movimientoRepository,
                          BeneficiarioRepository beneficiarioRepository,
                          RacionRepository racionRepository,
                          InsumoRepository insumoRepository,
                          LoteInventarioRepository loteInventarioRepository) {
        this.movimientoRepository = movimientoRepository;
        this.beneficiarioRepository = beneficiarioRepository;
        this.racionRepository = racionRepository;
        this.insumoRepository = insumoRepository;
        this.loteInventarioRepository = loteInventarioRepository;
    }

    /**
     * Reporte mensual de consumo (ingresos vs salidas por insumo).
     */
    public ReporteMensualResponse generarReporteMensual(String periodo) {
        LocalDate inicio = LocalDate.parse(periodo + "-01");
        LocalDate fin = inicio.plusMonths(1).minusDays(1);
        LocalDateTime inicioDt = inicio.atStartOfDay();
        LocalDateTime finDt = fin.plusDays(1).atStartOfDay();

        List<Movimiento> movimientos = movimientoRepository
                .findByFechaRegistroBetween(inicioDt, finDt);

        double totalIngresos = 0.0;
        double totalSalidas = 0.0;
        Map<String, Double> consumoPorInsumo = new HashMap<>();

        for (Movimiento m : movimientos) {
            String nombreInsumo = m.getLote() != null && m.getLote().getInsumo() != null
                    ? m.getLote().getInsumo().getNombre() : "Desconocido";

            if ("INGRESO".equals(m.getTipoMovimiento())) {
                totalIngresos += m.getCantidadMovida();
            } else if ("SALIDA".equals(m.getTipoMovimiento())) {
                totalSalidas += m.getCantidadMovida();
                consumoPorInsumo.merge(nombreInsumo, m.getCantidadMovida(), Double::sum);
            }
        }

        List<ReporteMensualResponse.InsumoConsumido> insumos = consumoPorInsumo.entrySet().stream()
                .map(e -> ReporteMensualResponse.InsumoConsumido.builder()
                        .nombre(e.getKey())
                        .cantidadTotal(e.getValue())
                        .build())
                .sorted((a, b) -> Double.compare(b.getCantidadTotal(), a.getCantidadTotal()))
                .collect(Collectors.toList());

        return ReporteMensualResponse.builder()
                .periodo(periodo)
                .totalIngresos(totalIngresos)
                .totalSalidas(totalSalidas)
                .insumosConsumidos(insumos)
                .build();
    }

    /**
     * Reporte de mermas: MERMA = ((Peso Bruto - Peso Neto) / Peso Bruto) * 100.
     */
    public ReporteMermasResponse generarReporteMermas(String periodo) {
        LocalDate inicio = LocalDate.parse(periodo + "-01");
        LocalDate fin = inicio.plusMonths(1).minusDays(1);
        LocalDateTime inicioDt = inicio.atStartOfDay();
        LocalDateTime finDt = fin.plusDays(1).atStartOfDay();

        List<Movimiento> salidas = movimientoRepository
                .findByTipoMovimientoAndFechaRegistroBetween("SALIDA", inicioDt, finDt);

        Map<String, ReporteMermasResponse.DetalleMerma> detallePorInsumo = new HashMap<>();
        double mermaTotal = 0.0;
        int count = 0;

        for (Movimiento m : salidas) {
            if (m.getPesoBruto() != null && m.getPesoNeto() != null && m.getPesoBruto() > 0) {
                String nombre = m.getLote() != null && m.getLote().getInsumo() != null
                        ? m.getLote().getInsumo().getNombre() : "Desconocido";
                double merma = ((m.getPesoBruto() - m.getPesoNeto()) / m.getPesoBruto()) * 100;

                detallePorInsumo.compute(nombre, (k, v) -> {
                    if (v == null) {
                        return ReporteMermasResponse.DetalleMerma.builder()
                                .nombreInsumo(k)
                                .pesoBrutoTotal(m.getPesoBruto())
                                .pesoNetoTotal(m.getPesoNeto())
                                .mermaPorcentaje(merma)
                                .build();
                    }
                    v.setPesoBrutoTotal(v.getPesoBrutoTotal() + m.getPesoBruto());
                    v.setPesoNetoTotal(v.getPesoNetoTotal() + m.getPesoNeto());
                    double nuevoTotalBruto = v.getPesoBrutoTotal();
                    double nuevoTotalNeto = v.getPesoNetoTotal();
                    v.setMermaPorcentaje(
                            ((nuevoTotalBruto - nuevoTotalNeto) / nuevoTotalBruto) * 100);
                    return v;
                });

                mermaTotal += merma;
                count++;
            }
        }

        return ReporteMermasResponse.builder()
                .periodo(periodo)
                .mermaPromedioGlobal(count > 0 ? mermaTotal / count : 0.0)
                .detalle(new ArrayList<>(detallePorInsumo.values()))
                .build();
    }

    /**
     * Reporte de rotación de productos.
     */
    public ReporteRotacionResponse generarReporteRotacion(String periodo) {
        LocalDate inicio = LocalDate.parse(periodo + "-01");
        LocalDate fin = inicio.plusMonths(1).minusDays(1);
        LocalDateTime inicioDt = inicio.atStartOfDay();
        LocalDateTime finDt = fin.plusDays(1).atStartOfDay();

        List<Movimiento> salidas = movimientoRepository
                .findByTipoMovimientoAndFechaRegistroBetween("SALIDA", inicioDt, finDt);

        Map<String, ReporteRotacionResponse.ProductoRotacion> mapa = new HashMap<>();

        for (Movimiento m : salidas) {
            String nombre = m.getLote() != null && m.getLote().getInsumo() != null
                    ? m.getLote().getInsumo().getNombre() : "Desconocido";

            mapa.compute(nombre, (k, v) -> {
                if (v == null) {
                    return ReporteRotacionResponse.ProductoRotacion.builder()
                            .nombreInsumo(k)
                            .vecesSalida(1L)
                            .cantidadTotalSalida(m.getCantidadMovida())
                            .build();
                }
                v.setVecesSalida(v.getVecesSalida() + 1);
                v.setCantidadTotalSalida(v.getCantidadTotalSalida() + m.getCantidadMovida());
                return v;
            });
        }

        return ReporteRotacionResponse.builder()
                .periodo(periodo)
                .productos(mapa.values().stream()
                        .sorted((a, b) -> Long.compare(b.getVecesSalida(), a.getVecesSalida()))
                        .collect(Collectors.toList()))
                .build();
    }

    /**
     * Reporte de beneficiarios y raciones.
     */
    public ReporteBeneficiariosResponse generarReporteBeneficiarios(String periodo) {
        LocalDate inicio = LocalDate.parse(periodo + "-01");
        LocalDate fin = inicio.plusMonths(1).minusDays(1);

        long totalBeneficiarios = beneficiarioRepository.count();
        long totalRaciones = racionRepository.countByFechaEntregaBetween(inicio, fin);
        long diasEnPeriodo = java.time.temporal.ChronoUnit.DAYS.between(inicio, fin) + 1;
        double promedioDiario = diasEnPeriodo > 0 ? (double) totalRaciones / diasEnPeriodo : 0.0;

        return ReporteBeneficiariosResponse.builder()
                .periodo(periodo)
                .totalBeneficiarios(totalBeneficiarios)
                .totalRacionesEntregadas(totalRaciones)
                .promedioDiario(Math.round(promedioDiario * 10.0) / 10.0)
                .build();
    }

    /**
     * Reporte de inventario actual por categoría.
     */
    public ReporteInventarioResponse generarReporteInventario(String categoria) {
        List<Object[]> resultados;

        if (categoria != null && !categoria.isEmpty()) {
            resultados = loteInventarioRepository.findAll().stream()
                    .filter(lote -> lote.getInsumo().getCategoria().equals(categoria))
                    .collect(Collectors.groupingBy(
                            lote -> lote.getInsumo().getCategoria(),
                            Collectors.collectingAndThen(Collectors.toList(), lotes -> {
                                double total = lotes.stream()
                                        .mapToDouble(LoteInventario::getCantidadActual)
                                        .sum();
                                long items = lotes.stream()
                                        .map(l -> l.getInsumo().getIdInsumo())
                                        .distinct()
                                        .count();
                                return new Object[]{total, items};
                            })))
                    .entrySet().stream()
                    .map(e -> new Object[]{e.getKey(), ((Object[]) e.getValue())[0], ((Object[]) e.getValue())[1]})
                    .collect(Collectors.toList());
        } else {
            resultados = loteInventarioRepository.findAll().stream()
                    .collect(Collectors.groupingBy(
                            lote -> lote.getInsumo().getCategoria(),
                            Collectors.collectingAndThen(Collectors.toList(), lotes -> {
                                double total = lotes.stream()
                                        .mapToDouble(LoteInventario::getCantidadActual)
                                        .sum();
                                long items = lotes.stream()
                                        .map(l -> l.getInsumo().getIdInsumo())
                                        .distinct()
                                        .count();
                                return new Object[]{total, items};
                            })))
                    .entrySet().stream()
                    .map(e -> new Object[]{e.getKey(), ((Object[]) e.getValue())[0], ((Object[]) e.getValue())[1]})
                    .collect(Collectors.toList());
        }

        List<ReporteInventarioResponse.StockCategoria> stock = resultados.stream()
                .map(r -> ReporteInventarioResponse.StockCategoria.builder()
                        .categoria((String) r[0])
                        .cantidadTotal((Double) r[1])
                        .items((Long) r[2])
                        .build())
                .collect(Collectors.toList());

        return ReporteInventarioResponse.builder()
                .fecha(LocalDate.now().toString())
                .stockPorCategoria(stock)
                .build();
    }

    /**
     * Reporte de salidas por rango de fechas.
     */
    public ReporteSalidasResponse generarReporteSalidas(LocalDate fechaInicio, LocalDate fechaFin) {
        LocalDateTime inicioDt = fechaInicio.atStartOfDay();
        LocalDateTime finDt = fechaFin.plusDays(1).atStartOfDay();

        List<Movimiento> salidas = movimientoRepository
                .findByTipoMovimientoAndFechaRegistroBetween("SALIDA", inicioDt, finDt);

        List<ReporteSalidasResponse.DetalleSalida> detalle = salidas.stream()
                .map(m -> ReporteSalidasResponse.DetalleSalida.builder()
                        .fecha(m.getFechaRegistro().toLocalDate())
                        .nombreInsumo(m.getLote() != null && m.getLote().getInsumo() != null
                                ? m.getLote().getInsumo().getNombre() : "Desconocido")
                        .cantidad(m.getCantidadMovida())
                        .build())
                .sorted(Comparator.comparing(ReporteSalidasResponse.DetalleSalida::getFecha))
                .collect(Collectors.toList());

        return ReporteSalidasResponse.builder()
                .periodo(ReporteSalidasResponse.Periodo.builder()
                        .inicio(fechaInicio)
                        .fin(fechaFin)
                        .build())
                .totalSalidas(salidas.size())
                .detalle(detalle)
                .build();
    }
}