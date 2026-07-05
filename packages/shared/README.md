# @repo/shared

Contratos compartidos entre el frontend (Angular) y el backend (NestJS): **DTOs, modelos de dominio y tipos**. Es la única fuente de verdad del "contrato" del API, así ambos lados no se desincronizan.

## Uso

En cualquiera de las apps (`apps/frontend`, `apps/backend`):

```ts
import { User, CreateUserDto, ApiResponse } from '@repo/shared';
```

## Estructura

```
src/
├── dtos/      Payloads de peticiones (CreateUserDto, UpdateUserDto)
├── models/    Entidades de dominio expuestas por el API (User)
├── types/     Tipos y uniones auxiliares (UserRole, ApiResponse<T>)
└── index.ts   Barrel raíz que reexporta todo
```

## Convención

- Solo **tipos e interfaces** (sin lógica en runtime) → el bundle de Angular queda limpio y tree-shakeable.
- Los **DTOs con validación** de NestJS (decoradores `class-validator`) viven en el backend; aquí se mantienen las formas agnósticas al framework.
- El paquete se **compila** (`tsc` → `dist/`); Turborepo lo construye antes que las apps gracias a `dependsOn: ["^build"]`.
- Al añadir un archivo nuevo, expórtalo desde el `index.ts` de su carpeta.
