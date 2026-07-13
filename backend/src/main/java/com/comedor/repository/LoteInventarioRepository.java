package com.comedor.repository;

import com.comedor.model.LoteInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LoteInventarioRepository extends JpaRepository<LoteInventario, Long> {

    /**
     * Consulta PEPS: lotes activos de un insumo ordenados por fecha de vencimiento más antigua.
     */
    List<LoteInventario> findByInsumoIdInsumoAndCantidadActualGreaterThanOrderByFechaVencimientoAsc(
            Long idInsumo, Double cantidadActual);

    List<LoteInventario> findByInsumoIdInsumo(Long idInsumo);

    /**
     * Lotes próximos a vencer (con stock > 0) ordenados por urgencia.
     */
    @Query("SELECT l FROM LoteInventario l WHERE l.cantidadActual > 0 ORDER BY l.fechaVencimiento ASC")
    List<LoteInventario> findLotesActivosOrdenadosPorVencimiento();

    /**
     * Lotes agotados o vencidos para alertas de dashboard.
     */
    @Query("SELECT l FROM LoteInventario l WHERE l.cantidadActual = 0 OR l.fechaVencimiento < CURRENT_DATE ORDER BY l.fechaVencimiento ASC")
    List<LoteInventario> findLotesAgotadosOVencidos();
}