package com.comedor.controller;

import com.comedor.dto.response.*;
import com.comedor.service.ReporteService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    private final ReporteService reporteService;

    public ReporteController(ReporteService reporteService) {
        this.reporteService = reporteService;
    }

    @GetMapping("/mensual")
    public ResponseEntity<ReporteMensualResponse> reporteMensual(
            @RequestParam String mes) {
        return ResponseEntity.ok(reporteService.generarReporteMensual(mes));
    }

    @GetMapping("/mermas")
    public ResponseEntity<ReporteMermasResponse> reporteMermas(
            @RequestParam String mes) {
        return ResponseEntity.ok(reporteService.generarReporteMermas(mes));
    }

    @GetMapping("/rotacion")
    public ResponseEntity<ReporteRotacionResponse> reporteRotacion(
            @RequestParam String mes) {
        return ResponseEntity.ok(reporteService.generarReporteRotacion(mes));
    }

    @GetMapping("/beneficiarios")
    public ResponseEntity<ReporteBeneficiariosResponse> reporteBeneficiarios(
            @RequestParam String mes) {
        return ResponseEntity.ok(reporteService.generarReporteBeneficiarios(mes));
    }

    @GetMapping("/inventario")
    public ResponseEntity<ReporteInventarioResponse> reporteInventario(
            @RequestParam(required = false) String categoria) {
        return ResponseEntity.ok(reporteService.generarReporteInventario(categoria));
    }

    @GetMapping("/salidas")
    public ResponseEntity<ReporteSalidasResponse> reporteSalidas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        return ResponseEntity.ok(
                reporteService.generarReporteSalidas(fechaInicio, fechaFin));
    }
}