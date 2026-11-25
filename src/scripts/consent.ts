// Aviso de cookies y carga de Google Analytics. gtag.js no se descarga hasta que la persona
// acepta: antes de eso el sitio no deja ninguna cookie de estadisticas.
import { CONSENT_KEY, decodeConsent, type Consent } from '../lib/consent';

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

const banner = document.querySelector<HTMLElement>('[data-consent]');
const id = banner?.dataset.consent;

function read(): Consent | undefined {
  try {
    return decodeConsent(localStorage.getItem(CONSENT_KEY));
  } catch {
    return undefined;
  }
}

function save(consent: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, consent);
  } catch {
    // Sin localStorage (modo privado estricto) la eleccion vale solo para esta pagina.
  }
}

let loaded = false;
function loadAnalytics(measurementId: string) {
  if (loaded) return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  // gtag necesita el objeto arguments tal cual, no un array.
  function gtag(..._args: unknown[]) {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', measurementId);
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.append(script);
}

// Al rechazar despues de haber aceptado, borra las cookies _ga que ya se habian guardado.
function clearAnalyticsCookies() {
  const host = location.hostname;
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0]?.trim();
    if (!name?.startsWith('_ga')) continue;
    for (const domain of ['', `; domain=${host}`, `; domain=.${host}`]) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
    }
  }
}

if (banner && id) {
  const consent = read();
  if (consent === 'granted') loadAnalytics(id);
  // Se borra tambien al cargar: si rechazo con Analytics corriendo, gtag pudo reescribirlas antes del reload.
  else if (consent === 'denied') clearAnalyticsCookies();
  else banner.hidden = false;

  banner.querySelector('[data-consent-accept]')?.addEventListener('click', () => {
    save('granted');
    banner.hidden = true;
    loadAnalytics(id);
  });
  banner.querySelector('[data-consent-reject]')?.addEventListener('click', () => {
    const wasGranted = read() === 'granted';
    save('denied');
    banner.hidden = true;
    clearAnalyticsCookies();
    // Si Analytics ya estaba corriendo en esta pagina, recargar lo corta del todo.
    if (wasGranted && loaded) location.reload();
  });
  // Boton "Cambiar mi eleccion" de la pagina /cookies.
  for (const button of document.querySelectorAll('[data-consent-open]')) {
    button.addEventListener('click', () => {
      banner.hidden = false;
      banner.querySelector<HTMLButtonElement>('[data-consent-accept]')?.focus();
    });
  }
}
