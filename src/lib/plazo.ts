// Cálculo del plazo para quejas o sugerencias. Se usa en el servidor y en el navegador.
//
// El plazo corre desde el primer ingreso del propietario: si entró el 21 de octubre,
// su último día es el 31 de octubre (completo, hora de la zona del coto).
// Las fechas se manejan como "YYYY-MM-DD" para no depender de husos horarios.

import { PLAZO_DIAS, ZONA_HORARIA } from "./config";

const DIA_MS = 24 * 60 * 60 * 1000;

const formatoIso = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_HORARIA });
const formatoLargo = new Intl.DateTimeFormat("es-MX", { dateStyle: "full", timeZone: "UTC" });

/** Día calendario ("YYYY-MM-DD") de un instante en la zona horaria del coto. */
function diaLocal(instante: Date): string {
  return formatoIso.format(instante);
}

function aMs(dia: string): number {
  const [a, m, d] = dia.split("-").map(Number);
  return Date.UTC(a, m - 1, d);
}

/** Último día ("YYYY-MM-DD") para presentar quejas o sugerencias. */
export function ultimoDiaPlazo(primerIngreso: Date): string {
  return new Date(aMs(diaLocal(primerIngreso)) + PLAZO_DIAS * DIA_MS).toISOString().slice(0, 10);
}

/** Días que faltan: 0 = hoy es el último día; negativo = ya venció. */
export function diasRestantes(ultimoDia: string, ahora = new Date()): number {
  return Math.round((aMs(ultimoDia) - aMs(diaLocal(ahora))) / DIA_MS);
}

/** "sábado, 31 de octubre de 2026" */
export function formatearDia(dia: string): string {
  return formatoLargo.format(new Date(aMs(dia)));
}
