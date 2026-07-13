package com.comedor.repository;

import com.comedor.model.Racion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface RacionRepository extends JpaRepository<Racion, Long> {

    List<Racion> findByFechaEntrega(LocalDate fechaEntrega);

    List<Racion> findByBeneficiarioIdBeneficiario(Long idBeneficiario);

    boolean existsByBeneficiarioIdBeneficiarioAndFechaEntrega(Long idBeneficiario, LocalDate fechaEntrega);

    long countByFechaEntrega(LocalDate fechaEntrega);

    @org.springframework.data.jpa.repository.Query(
        "SELECT COUNT(r) FROM Racion r WHERE r.fechaEntrega BETWEEN :inicio AND :fin")
    long countByFechaEntregaBetween(
            @org.springframework.data.repository.query.Param("inicio") LocalDate inicio,
            @org.springframework.data.repository.query.Param("fin") LocalDate fin);
}