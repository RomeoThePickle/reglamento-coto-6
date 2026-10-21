// Compartido por los formularios (retroalimentación inmediata) y la API (validación real).
// Debe coincidir con normalizar_iniciales / normalizar_casa en la base de datos.

const INICIALES_RE = /^[A-Z]{2,6}$/;
const CASA_RE = /^[0-9A-Z][0-9A-Z-]{0,9}$/;

/** "j. p. g." o "Ó.P.G." -> "JPG" / "OPG". Devuelve null si no son iniciales válidas. */
export function normalizarIniciales(valor: string): string | null {
  const limpio = valor
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toUpperCase()
    .replace(/[\s.-]/g, "");
  return INICIALES_RE.test(limpio) ? limpio : null;
}

/** " 12-b " -> "12-B". Devuelve null si no es un número de casa válido. */
export function normalizarCasa(valor: string): string | null {
  const limpio = valor.toUpperCase().replace(/\s/g, "");
  return CASA_RE.test(limpio) ? limpio : null;
}
