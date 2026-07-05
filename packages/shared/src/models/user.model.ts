import type { UserRole } from '../types/user-role.type';

/** Entidad de dominio Usuario tal como la expone el API. */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  /** Fecha de creación en formato ISO 8601. */
  createdAt: string;
}
