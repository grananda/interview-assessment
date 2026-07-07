# Guía de entrevista — Angular + NestJS Assessment

Guía para el **entrevistador**. El repo es una lista de tareas (flat): backend
**NestJS 11 / SQLite / caching** y frontend **Angular 22** (standalone + signals),
en un monorepo **Turborepo** con un paquete `@repo/shared` de contratos.

El candidato completa **2 tareas** (1 back, 1 front) y luego se le hacen
**preguntas de comprensión**. El objetivo es evaluar criterio y comprensión real,
no que memorice ni copie de una IA.

```
apps/backend/    NestJS · better-sqlite3 · cache-manager · class-validator
apps/frontend/   Angular 22 (signals, @if/@for) · Vitest
packages/shared/ @repo/shared — TaskDto + enum TaskStatus (contrato back/front)
```

---

## Las 2 tareas y cómo evaluarlas

| # | Capa | Fichero / método | Qué evalúa |
|---|------|------------------|------------|
| 1 | Back | `tasks.controller.ts → updateStatus` (`PUT /api/tasks/:id/status`) | Cablear controller→service, mapeo a DTO, 404 de dominio |
| 2 | Front | `task-list.ts → changeStatus` + `task-list.html` | Control de UI + `Observable`/`subscribe` + refresco con signals |

**Qué buscar en cada una:**

1. **`updateStatus`** — que lea `id` del param (con `ParseIntPipe`) y el `status`
   del body (`UpdateTaskStatusDto`), llame a `tasksService.updateStatus`, mapee con
   `TaskResponseDto.fromEntity`, y traduzca `TaskNotFoundError` → `NotFoundException`
   (404). Que **siga el patrón** de `findOne` (try/catch del error de dominio) en
   vez de inventar otro. Señal de alarma: devolver la entidad cruda, o dejar que el
   error de dominio se escape como 500.
2. **`changeStatus`** — que añada el control en la plantilla, llame a
   `TaskService.updateStatus(id, status)`, se **suscriba** y **refresque la lista**
   en `next` (no antes), y gestione el `error`. Bonus: no llamar si el estado no
   cambia. Señal de alarma: mutar el signal a mano sin recargar, o no manejar error.

> **Nota anti-trampa:** ambas piezas tienen tests ya escritos (Jest en back, Vitest
> en front) que deben pasar de rojo a verde. Pide que **expliquen** su código y el
> existente; ahí se ve si lo entienden o lo pegaron.

---

## Preguntas de Backend (NestJS / TypeScript)

### Arquitectura y capas
- **¿Por qué `controllers → services → repositories` con la lógica en el servicio?**
  Busca: separación de responsabilidades, testabilidad, el controller solo traduce
  HTTP.
- **Hay `entity`, `schema` y `dto` para lo mismo. ¿Por qué tres formas?**
  `TaskSchema` = fila de persistencia (snake_case, `status` string); `Task` = modelo
  de dominio (`Task.fromSchema`); `TaskResponseDto` = contrato de salida
  (`fromEntity`, con `createdAt` recortado a `YYYY-MM-DD`). Desacopla BD ↔ dominio ↔ API.

### Inyección de dependencias
- **¿Qué son `TASK_REPOSITORY`, `SQLITE_CONNECTION`, `TASK_SEEDER`… (Symbols)?**
  Tokens de inyección para interfaces (que no existen en runtime). Permiten
  `provide: TOKEN, useClass/useValue/useFactory` y cambiar la implementación.
- **¿Por qué inyectar `TaskRepository` (interfaz) y no la clase SQLite directa?**
  Inversión de dependencias: el servicio no conoce la implementación; testeable con
  un mock.
- **¿Qué hace `OnModuleInit` en `TasksModule`?** Crea el esquema y siembra datos al
  arrancar (`schema initializer` + `seeder`, ambos por DI).

### Caching (núcleo de este back)
- **Explica la estrategia de caché de `TasksService`.** Cachea listas
  (`tasks:all` / `tasks:<status>`) y tareas sueltas (`task:<id>`) con TTL 30s.
- **¿Qué pasa en `updateStatus` con la caché?** **Invalida** todas las listas
  (`tasks:all` + una por estado) y refresca `task:<id>`. Pregunta: ¿por qué invalidar
  *todas* las listas y no solo una?
- **`findAll` devuelve `[...cached]`. ¿Por qué la copia?** Para que quien la reciba
  no pueda mutar el array cacheado por referencia.

### Repositorio y SQLite
- **¿Por qué `better-sqlite3` con `prepare(...)`/statements?** Consultas parametrizadas
  (evita inyección) y rendimiento. `:memory:` para una demo autocontenida.

### Validación y contrato HTTP
- **`ValidationPipe` global con `whitelist`, `forbidNonWhitelisted`, `transform`. ¿Qué
  hace cada uno?** Filtra props no declaradas / rechaza props extra / transforma tipos.
- **`@IsEnum(TaskStatus)` en los DTOs.** Valida el `status` de query y de body; un valor
  inválido → 400 automático.
- **¿Cómo se convierte `TaskNotFoundError` (dominio) en un 404?** El controller la captura
  y lanza `NotFoundException`. ¿Por qué no lanzar el `HttpException` desde el servicio?
  Para no acoplar la capa de dominio a HTTP.

### Contrato compartido
- **`@repo/shared` (TaskDto, enum TaskStatus).** Fuente de verdad de tipos entre back y
  front; se consume **compilado** (`dist`), por eso hay que buildear antes de arrancar.

---

## Preguntas de Frontend (Angular 22)

### Standalone y signals
- **¿Qué es un standalone component?** Sin `NgModule`; declara sus `imports`.
- **`signal`, y `tasks`/`loading`/`error`/`statusFilter` como señales. ¿Ventaja?**
  Estado reactivo granular; la plantilla se actualiza sola.
- **`inject()` vs constructor.** Estilo moderno; `inject(TaskService)` fuera del constructor.

### Flujo de datos y HTTP
- **Explica `load()` y `onFilterChange`.** Setea loading, llama a `getTasks(filter)`,
  actualiza signals en `next`/`error`; el filtro re-consulta con el `status`.
- **`changeStatus` (la tarea).** `updateStatus(id,status)` → `subscribe` → `load()`
  para reflejar el estado del server. ¿Por qué recargar en vez de tocar el array local?
- **`proxy.conf.json`.** Redirige `/api` → `http://localhost:3000` en dev; por eso el
  front no hardcodea el host del backend.

### Control flow y plantilla
- **`@if` / `@for` con `track`.** Nuevo control flow (no `*ngIf`/`*ngFor`); `track` para
  reconciliar listas eficientemente.
- **`statuses`/`filters` derivados de `Object.values(TaskStatus)`.** Andamiaje; no es
  parte de la tarea, se puede mejorar.

### Testing
- **Back (Jest):** unit del servicio (mock de repo **y de la caché**), spec del
  controller (404 de dominio), spec del DTO (formato de fecha).
- **Front (Vitest):** render de la lista, estado vacío/erroneo, re-query al filtrar, y
  `changeStatus` (mock de `TaskService`).

---

## Preguntas transversales (perfil senior)

- **El contrato back/front vive en `@repo/shared` y se consume compilado.** ¿Ventajas y
  peligros de un paquete compartido en monorepo? (una fuente de verdad vs acoplamiento /
  necesidad de build).
- **Caché con TTL + invalidación manual.** ¿Qué problemas de consistencia puede haber?
  ¿Cómo lo harías con más nodos (caché distribuida)?
- **Turborepo.** ¿Qué aporta el pipeline `dev`/`build` con `dependsOn`? (orden y cache
  de tareas: `shared` se buildea antes que las apps).
- **Si creciera:** paginación, autenticación, migraciones en vez de `:memory:`, DTOs de
  entrada/salida versionados.

---

## Cómo arrancar para revisar

```bash
npm install
npm run build      # compila @repo/shared + apps (1 vez)
npm run dev        # backend :3000 + frontend :4200 (turbo)

# Tests
cd apps/backend  && npm test          # Jest (unit)  ·  npm run test:e2e
cd apps/frontend && npm test          # Vitest
```

- Frontend: http://localhost:4200 · API: http://localhost:3000/api/tasks
- `TaskStatus`: `pending` · `in_progress` · `done`.
