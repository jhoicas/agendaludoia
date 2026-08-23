/**
 * MSW (Mock Service Worker) handlers for intercepting API calls during tests.
 * These handlers simulate Supabase and gRPC-Web responses.
 */
import { http, HttpResponse } from 'msw';

export const handlers = [
  // ── Supabase Auth ──────────────────────────────────────────────────
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-jwt-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'mock-user-id',
        email: 'test@agendaLudoia.com',
        role: 'authenticated',
      },
    });
  }),

  // ── Appointments ───────────────────────────────────────────────────
  http.get('*/rest/v1/appointments', () => {
    return HttpResponse.json([]);
  }),

  // ── Pain Observations ──────────────────────────────────────────────
  http.get('*/rest/v1/pain_observations', () => {
    return HttpResponse.json([]);
  }),

  http.post('*/rest/v1/pain_observations', () => {
    return HttpResponse.json({ id: 'mock-observation-id' }, { status: 201 });
  }),
];
