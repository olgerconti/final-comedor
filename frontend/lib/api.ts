import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  AuthResponse,
  UsuarioResponse,
  InsumoResponse,
  LoteResponse,
  MovimientoResponse,
  MovimientoSalidaResponse,
  RacionResponse,
  BeneficiarioResponse,
  DashboardResponse,
  ReporteMensualResponse,
  ReporteMermasResponse,
  ReporteRotacionResponse,
  ReporteBeneficiariosResponse,
  ReporteInventarioResponse,
  ReporteSalidasResponse,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const TOKEN_KEY = 'comedor_auth_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

export function getAuthHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearToken();
      removeCookie(TOKEN_KEY);
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as Record<string, unknown> | undefined;
    if (data?.message && typeof data.message === 'string') {
      return data.message;
    }
    if (data?.detalles && typeof data.detalles === 'object') {
      const detalles = data.detalles as Record<string, string>;
      return Object.values(detalles).join(', ');
    }
    if (error.response?.status === 401) return 'Sesión expirada. Inicie sesión nuevamente.';
    if (error.response?.status === 403) return 'No tiene permisos para realizar esta acción.';
    if (error.response?.status === 404) return 'Recurso no encontrado.';
    if (error.response?.status === 500) return 'Error interno del servidor.';
  }
  return 'Error de conexión. Verifique que el servidor esté disponible.';
}

export async function login(correo: string, password: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', { correo, password });
  setToken(response.data.token);
  setCookie(TOKEN_KEY, response.data.token, 1);
  return response.data;
}

export function logout(): void {
  clearToken();
  removeCookie(TOKEN_KEY);
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

export async function fetchMe(): Promise<UsuarioResponse> {
  const response = await api.get<UsuarioResponse>('/auth/me');
  return response.data;
}

export async function fetchDashboard(): Promise<DashboardResponse> {
  const response = await api.get<DashboardResponse>('/dashboard');
  return response.data;
}

export async function fetchInsumos(categoria?: string): Promise<InsumoResponse[]> {
  const response = await api.get<InsumoResponse[]>('/insumos', {
    params: categoria ? { categoria } : undefined,
  });
  return response.data;
}

export async function fetchInsumo(id: number): Promise<InsumoResponse> {
  const response = await api.get<InsumoResponse>(`/insumos/${id}`);
  return response.data;
}

export async function createInsumo(data: {
  nombre: string;
  unidadMedida: string;
  categoria: string;
}): Promise<InsumoResponse> {
  const response = await api.post<InsumoResponse>('/insumos', data);
  return response.data;
}

export async function updateInsumo(
  id: number,
  data: { nombre: string; unidadMedida: string; categoria: string }
): Promise<InsumoResponse> {
  const response = await api.put<InsumoResponse>(`/insumos/${id}`, data);
  return response.data;
}

export async function deleteInsumo(id: number): Promise<void> {
  await api.delete(`/insumos/${id}`);
}

export async function fetchLotes(idInsumo?: number): Promise<LoteResponse[]> {
  const response = await api.get<LoteResponse[]>('/lotes', {
    params: idInsumo ? { idInsumo } : undefined,
  });
  return response.data;
}

export async function fetchLote(id: number): Promise<LoteResponse> {
  const response = await api.get<LoteResponse>(`/lotes/${id}`);
  return response.data;
}

export async function createLote(data: {
  idInsumo: number;
  cantidad: number;
  fechaVencimiento: string;
}): Promise<LoteResponse> {
  const response = await api.post<LoteResponse>('/lotes', data);
  return response.data;
}

export async function fetchMovimientos(params?: {
  tipo?: string;
  fechaInicio?: string;
  fechaFin?: string;
}): Promise<MovimientoResponse[]> {
  const response = await api.get<MovimientoResponse[]>('/movimientos', { params });
  return response.data;
}

export async function fetchMovimiento(id: number): Promise<MovimientoResponse> {
  const response = await api.get<MovimientoResponse>(`/movimientos/${id}`);
  return response.data;
}

export async function registrarSalida(data: {
  idInsumo: number;
  cantidad: number;
  pesoBruto?: number;
  pesoNeto?: number;
}): Promise<MovimientoSalidaResponse> {
  const response = await api.post<MovimientoSalidaResponse>('/movimientos/salida', data);
  return response.data;
}

function todayLocal(): string {
  if (typeof window === 'undefined') return '';
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getTodayLocal(): string {
  return todayLocal();
}

export async function fetchRaciones(params?: {
  fecha?: string;
  idBeneficiario?: number;
}): Promise<RacionResponse[]> {
  const response = await api.get<RacionResponse[]>('/raciones', { params });
  return response.data;
}

export async function fetchRacion(id: number): Promise<RacionResponse> {
  const response = await api.get<RacionResponse>(`/raciones/${id}`);
  return response.data;
}

export async function registrarRacion(data: {
  idBeneficiario: number;
  fechaEntrega?: string;
}): Promise<RacionResponse> {
  const response = await api.post<RacionResponse>('/raciones', data);
  return response.data;
}

export async function fetchBeneficiarios(): Promise<BeneficiarioResponse[]> {
  const response = await api.get<BeneficiarioResponse[]>('/beneficiarios');
  return response.data;
}

export async function fetchBeneficiario(id: number): Promise<BeneficiarioResponse> {
  const response = await api.get<BeneficiarioResponse>(`/beneficiarios/${id}`);
  return response.data;
}

export async function createBeneficiario(data: {
  dni: string;
  nombresApellidos: string;
  condicion: string;
}): Promise<BeneficiarioResponse> {
  const response = await api.post<BeneficiarioResponse>('/beneficiarios', data);
  return response.data;
}

export async function updateBeneficiario(
  id: number,
  data: { dni: string; nombresApellidos: string; condicion: string }
): Promise<BeneficiarioResponse> {
  const response = await api.put<BeneficiarioResponse>(`/beneficiarios/${id}`, data);
  return response.data;
}

export async function fetchReporteMensual(mes: string): Promise<ReporteMensualResponse> {
  const response = await api.get<ReporteMensualResponse>('/reportes/mensual', {
    params: { mes },
  });
  return response.data;
}

export async function fetchReporteMermas(mes: string): Promise<ReporteMermasResponse> {
  const response = await api.get<ReporteMermasResponse>('/reportes/mermas', {
    params: { mes },
  });
  return response.data;
}

export async function fetchReporteRotacion(mes: string): Promise<ReporteRotacionResponse> {
  const response = await api.get<ReporteRotacionResponse>('/reportes/rotacion', {
    params: { mes },
  });
  return response.data;
}

export async function fetchReporteBeneficiarios(
  mes: string
): Promise<ReporteBeneficiariosResponse> {
  const response = await api.get<ReporteBeneficiariosResponse>('/reportes/beneficiarios', {
    params: { mes },
  });
  return response.data;
}

export async function fetchReporteInventario(
  categoria?: string
): Promise<ReporteInventarioResponse> {
  const response = await api.get<ReporteInventarioResponse>('/reportes/inventario', {
    params: categoria ? { categoria } : undefined,
  });
  return response.data;
}

export async function fetchReporteSalidas(params: {
  fechaInicio: string;
  fechaFin: string;
}): Promise<ReporteSalidasResponse> {
  const response = await api.get<ReporteSalidasResponse>('/reportes/salidas', {
    params,
  });
  return response.data;
}