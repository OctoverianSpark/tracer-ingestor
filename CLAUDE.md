# tracer-ingestor

API REST construida con **Express 5 + TypeScript + Prisma (MySQL)**. Actúa como backend central para el agente Tracer: recibe telemetría de máquinas (estados, uso de apps, capturas de pantalla) y expone endpoints de control.

## Arquitectura

Patrón de 3 capas:

```
src/routes/        →  definición de rutas Express
src/controllers/   →  lógica de negocio (extienden Controller<TService>)
src/services/      →  acceso a datos con Prisma
```

Punto de entrada: `src/server.ts` → `src/api.ts` (registro de rutas y middleware).

## Rutas registradas

| Prefijo | Archivo de rutas |
|---|---|
| `/tracer` | `tracer.routes.ts` |
| `/appuser` | `appuser.routes.ts` |
| `/machines` | `computer.routes.ts` |
| `/schedules` | `schedules.routes.ts` |
| `/programations` | `programation.routes.ts` |
| `/groups` | `groups.routes.ts` |
| `/roles` | `roles.routes.ts` |
| `/categorization-apps` | `categorization_apps.routes.ts` |
| `/app-usage-logs` | `app_usage_logs.routes.ts` |

## Endpoint de actualizaciones (`/tracer/updates`)

Permite distribuir el instalador del agente Tracer a las máquinas cliente.

### Carpeta de instaladores

Por defecto: `src/installers/` (se crea automáticamente).
Configurable con la variable de entorno `INSTALLERS_PATH`.

Colocar el instalador en esa carpeta (cualquier nombre de archivo). El endpoint siempre sirve el archivo con la **fecha de modificación más reciente**.

### Endpoints

#### `GET /tracer/updates`
Devuelve metadata del instalador disponible.

```json
{
  "ok": true,
  "filename": "tracer-setup-1.2.0.exe",
  "size": 45234688,
  "updatedAt": "2026-05-07T14:30:00.000Z"
}
```

Si no hay instalador: `404 { "error": "No installer available" }`.

#### `GET /tracer/updates/download`
Descarga el instalador más reciente como archivo adjunto (`Content-Disposition: attachment`).

#### `POST /tracer/updates`
Sube un nuevo instalador. Reemplaza el anterior si tiene el mismo nombre.

- **Content-Type:** `multipart/form-data`
- **Campo:** `file` (el binario del instalador)
- **Límite:** 512 MB

```json
{ "ok": true, "filename": "tracer-setup-1.2.0.exe", "size": 45234688 }
```

### Flujo de actualización típico

1. El cliente llama `GET /tracer/updates` y compara `filename` o `updatedAt` con su versión local.
2. Si hay actualización, descarga con `GET /tracer/updates/download`.
3. Para publicar una nueva versión, subir el instalador con `POST /tracer/updates`.

### Archivos relevantes

- [src/config/multer.ts](src/config/multer.ts) — configuración de `uploadInstaller` y `INSTALLERS_DIR`
- [src/controllers/tracer.controller.ts](src/controllers/tracer.controller.ts) — métodos `getUpdateInfo`, `downloadUpdate`, `uploadUpdate`
- [src/routes/tracer.routes.ts](src/routes/tracer.routes.ts) — rutas `/updates`

## Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `CORS_ORIGIN` | Orígenes permitidos (coma-separados) | deshabilitado |
| `SCREENSHOTS_PATH` | Ruta absoluta para guardar screenshots | `src/screenshots/` |
| `INSTALLERS_PATH` | Ruta absoluta para la carpeta de instaladores | `src/installers/` |
| `DATABASE_URL` | Connection string MySQL para Prisma | — |

## Convenciones

- Nuevas rutas: crear archivo en `src/routes/`, registrar en `src/api.ts`.
- Nuevos controladores: extender `Controller<TService>` de `src/controllers/controller.ts`.
- Uploads de archivos: usar `multer` desde `src/config/multer.ts`; agregar nueva instancia si el destino es diferente.
- El constructor base de `Controller` hace auto-bind de todos los métodos — no hace falta `.bind(this)` al exportar.
