package com.comedor.repository;

import com.comedor.model.Movimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {

    List<Movimiento> findByTipoMovimiento(String tipoMovimiento);

    List<Movimiento> findByLoteIdLote(Long idLote);

    List<Movimiento> findByFechaRegistroBetween(LocalDateTime inicio, LocalDateTime fin);

    List<Movimiento> findByTipoMovimientoAndFechaRegistroBetween(
            String tipoMovimiento, LocalDateTime inicio, LocalDateTime fin);

    List<Movimiento> findTop10ByOrderByFechaRegistroDesc();
}