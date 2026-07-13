-- V1__init_schema.sql
-- Schema inicial: Sistema de Gestión Integrado para Comedores Populares
-- 3FN: Tercera Forma Normal

CREATE TABLE insumos (
    id_insumo BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    unidad_medida VARCHAR(20) NOT NULL,
    categoria VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE lotes_inventario (
    id_lote BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_insumo BIGINT NOT NULL,
    cantidad_actual DECIMAL(10,2) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    CONSTRAINT fk_lotes_insumo FOREIGN KEY (id_insumo) REFERENCES insumos(id_insumo),
    CONSTRAINT chk_cantidad_positiva CHECK (cantidad_actual > 0),
    INDEX idx_lotes_peps (id_insumo, fecha_vencimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE movimientos (
    id_movimiento BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_lote BIGINT NOT NULL,
    tipo_movimiento VARCHAR(10) NOT NULL,
    cantidad_movida DECIMAL(10,2) NOT NULL,
    peso_bruto DECIMAL(10,2),
    peso_neto DECIMAL(10,2),
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_movimientos_lote FOREIGN KEY (id_lote) REFERENCES lotes_inventario(id_lote),
    CONSTRAINT chk_tipo_movimiento CHECK (tipo_movimiento IN ('INGRESO', 'SALIDA')),
    CONSTRAINT chk_cantidad_movida CHECK (cantidad_movida > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE usuarios (
    id_usuario BIGINT AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL,
    CONSTRAINT chk_rol CHECK (rol IN ('Administradora', 'Supervisor Municipal'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE beneficiarios (
    id_beneficiario BIGINT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(8) NOT NULL UNIQUE,
    nombres_apellidos VARCHAR(200) NOT NULL,
    condicion VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE raciones (
    id_racion BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_beneficiario BIGINT NOT NULL,
    fecha_entrega DATE NOT NULL,
    CONSTRAINT fk_raciones_beneficiario FOREIGN KEY (id_beneficiario) REFERENCES beneficiarios(id_beneficiario),
    CONSTRAINT uq_racion_diaria UNIQUE (id_beneficiario, fecha_entrega)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;