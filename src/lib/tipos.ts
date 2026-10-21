// Tipos compartidos entre la API y los componentes del navegador.

export type Comprobante = {
  folio: number;
  numeroCasa: string;
  iniciales: string;
  aceptadoEn: string;
  fechaLimite: string;
};

/** Respuesta de /api/verificar: propietario validado y enlace temporal al PDF. */
export type Sesion = {
  numeroCasa: string;
  iniciales: string;
  version: string;
  url: string;
  aceptacion: Comprobante | null;
};
