package com.comedor.repository;

import com.comedor.model.Insumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InsumoRepository extends JpaRepository<Insumo, Long> {

    Optional<Insumo> findByNombre(String nombre);

    boolean existsByNombre(String nombre);

    List<Insumo> findByCategoria(String categoria);
}