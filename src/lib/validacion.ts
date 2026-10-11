// Compartido por el formulario (retroalimentación inmediata) y la API (validación real).

const INICIALES_RE = /^[A-ZÁÉÍÓÚÜÑ]{2,6}$/u;
const CASA_RE = /^[0-9A-Z][0-9A-Z-]{0,9}$/;

/** "j. p. g." -> "JPG". Devuelve null si no son iniciales válidas. */
export function normalizarIniciales(valor: string): string | null {
  const limpio = valor.normalize("NFC").toUpperCase().replace(/[\s.]/g, "");
  return INICIALES_RE.test(limpio) ? limpio : null;
}

/** " 12-b " -> "12-B". Devuelve null si no es un número de casa válido. */
export function normalizarCasa(valor: string): string | null {
  const limpio = valor.trim().toUpperCase().replace(/\s+/g, "");
  return CASA_RE.test(limpio) ? limpio : null;
}
