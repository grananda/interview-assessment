import type { CreateUserDto } from './create-user.dto';

/** Payload para actualizar un usuario: todos los campos opcionales. */
export type UpdateUserDto = Partial<CreateUserDto>;
