import type { UsuarioResponse } from '@/types';

let cachedUser: UsuarioResponse | null = null;

export function setCurrentUser(user: UsuarioResponse | null): void {
  cachedUser = user;
}

export function getCurrentUser(): UsuarioResponse | null {
  return cachedUser;
}

export function getUserRole(): string | null {
  return cachedUser?.rol ?? null;
}

export function isAdmin(): boolean {
  return getUserRole() === 'Administradora';
}

export function clearCurrentUser(): void {
  cachedUser = null;
}