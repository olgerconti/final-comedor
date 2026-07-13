package com.comedor.exception;

public class StockInsuficienteException extends RuntimeException {

    public StockInsuficienteException(String mensaje) {
        super(mensaje);
    }

    public StockInsuficienteException(String nombreInsumo, Double solicitado, Double disponible) {
        super(String.format("Stock insuficiente para '%s': solicitado %.2f, disponible %.2f",
                nombreInsumo, solicitado, disponible));
    }
}