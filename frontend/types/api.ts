export interface AuthResponse {
  token: string;
  rol: string;
  correo: string;
}

export interface UsuarioResponse {
  idUsuario: number;
  correo: string;
  rol: string;
}

export interface InsumoResponse {
  idInsumo: number;
  nombre: string;
  unidadMedida: string;
  categoria: string;
}

export interface LoteResponse {
  idLote: number;
  idInsumo: number;
  nombreInsumo: string;
  cantidadActual: number;
  fechaVencimiento: string;
  diasRestantes: number;
}

export interface MovimientoResponse {
  idMovimiento: number;
  tipoMovimiento: string;
  cantidadMovida: number;
  pesoBruto: number | null;
  pesoNeto: number | null;
  fechaRegistro: string;
  nombreInsumo: string;
  categoria: string;
  idLote: number;
}

export interface LoteAfectado {
  idLote: number;
  cantidadDescontada: number;
  loteRestante: number;
}

export interface MovimientoSalidaResponse {
  mensaje: string;
  movimientosGenerados: LoteAfectado[];
}

export interface RacionResponse {
  idRacion: number;
  idBeneficiario: number;
  dni: string;
  nombresApellidos: string;
  fechaEntrega: string;
}

export interface BeneficiarioResponse {
  idBeneficiario: number;
  dni: string;
  nombresApellidos: string;
  condicion: string;
}

export interface StockTotal {
  totalInsumos: number;
  totalCategorias: number;
}

export interface AlertaLote {
  idLote: number;
  nombreInsumo: string;
  cantidadActual: number;
  fechaVencimiento: string;
  diasRestantes: number;
  nivelAlerta: string;
}

export interface ProductoRotacion {
  nombreInsumo: string;
  salidasMes?: number;
  vecesSalida?: number;
  cantidadTotalSalida: number;
}

export interface UltimoMovimiento {
  tipo: string;
  nombreInsumo: string;
  cantidad: number;
  fechaRegistro: string;
}

export interface DashboardResponse {
  stockTotal: StockTotal;
  alertas: AlertaLote[];
  racionesEntregadasHoy: number;
  mermaPromedioSemanal: number;
  productosMayorRotacion: ProductoRotacion[];
  ultimosMovimientos: UltimoMovimiento[];
}

export interface InsumoConsumido {
  nombre: string;
  cantidadTotal: number;
}

export interface DetalleMerma {
  nombreInsumo: string;
  pesoBrutoTotal: number;
  pesoNetoTotal: number;
  mermaPorcentaje: number;
}

export interface StockCategoria {
  categoria: string;
  cantidadTotal: number;
  items: number;
}

export interface DetalleSalida {
  fecha: string;
  nombreInsumo: string;
  cantidad: number;
}

export interface ReporteMensualResponse {
  periodo: string;
  totalIngresos: number;
  totalSalidas: number;
  insumosConsumidos: InsumoConsumido[];
}

export interface ReporteMermasResponse {
  periodo: string;
  mermaPromedioGlobal: number;
  detalle: DetalleMerma[];
}

export interface ReporteRotacionResponse {
  periodo: string;
  productos: ProductoRotacion[];
}

export interface ReporteBeneficiariosResponse {
  periodo: string;
  totalBeneficiarios: number;
  totalRacionesEntregadas: number;
  promedioDiario: number;
}

export interface ReporteInventarioResponse {
  fecha: string;
  stockPorCategoria: StockCategoria[];
}

export interface Periodo {
  inicio: string;
  fin: string;
}

export interface ReporteSalidasResponse {
  periodo: Periodo;
  totalSalidas: number;
  detalle: DetalleSalida[];
}

export interface ApiError {
  message: string;
  status: number;
  detalles?: Record<string, string>;
}