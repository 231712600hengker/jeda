// ============================================================
// Jeda v2.0 — Standardized API Responses
// ============================================================
import { NextResponse } from 'next/server';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status = 400, code?: string, details?: unknown) {
  return NextResponse.json(
    {
      error: message,
      ...(code && { code }),
      ...(details !== undefined && { details }),
    },
    { status }
  );
}

export function apiUnauthorized(message = 'Sesi tidak valid atau telah berakhir. Silakan login kembali.') {
  return apiError(message, 401, 'UNAUTHORIZED');
}

export function apiForbidden(message = 'Akses ditolak.') {
  return apiError(message, 403, 'FORBIDDEN');
}

export function apiNotFound(message = 'Sumber daya tidak ditemukan.') {
  return apiError(message, 404, 'NOT_FOUND');
}

export function apiInternalError(message = 'Terjadi kesalahan internal pada server.', details?: unknown) {
  return apiError(message, 500, 'INTERNAL_SERVER_ERROR', details);
}

