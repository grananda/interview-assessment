import type { UserRole } from '../types/user-role.type';

/** Payload para crear un usuario (contrato de la petición). */
export interface CreateUserDto {
  email: string;
  name: string;
  role?: UserRole;
}
