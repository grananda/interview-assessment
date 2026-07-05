/** Envoltura genérica de respuesta del API. */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}
