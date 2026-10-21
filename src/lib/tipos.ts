// Tipos compartidos entre la API y los componentes del navegador.

/** Registro de la aceptación de los términos del plazo. */
export type Comprobante = {
  folio: number;
  aceptadoEn: string;
};

/** Plazo para quejas o sugerencias, contado desde el primer ingreso del propietario. */
export type Plazo = {
  primerIngreso: string;
  /** Último día válido, "YYYY-MM-DD" en la zona horaria del coto. */
  ultimoDia: string;
  esPrimerIngreso: boolean;
};

/** Respuesta de /api/verificar: propietario validado y enlace temporal al PDF. */
export type Sesion = {
  numeroCasa: string;
  iniciales: string;
  url: string;
  plazo: Plazo;
  aceptacion: Comprobante;
};
