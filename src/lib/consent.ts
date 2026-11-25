// Eleccion de cookies de estadisticas (Google Analytics), guardada en localStorage.
export type Consent = 'granted' | 'denied';

export const CONSENT_KEY = 'rosalu-cookies-v1';

/** Lo guardado o undefined si todavia no eligio (o el valor es basura): en ese caso se pregunta. */
export function decodeConsent(raw: string | null): Consent | undefined {
  return raw === 'granted' || raw === 'denied' ? raw : undefined;
}
