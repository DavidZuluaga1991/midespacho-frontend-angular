# MiDespacho Frontend (Angular SSR + TailwindCSS)

Frontend SSR del modulo de expediente juridico para la prueba tecnica de MiDespacho.

## Objetivo del modulo
Vista de administracion de expediente enfocada en:
- Contexto del expediente (cliente, estado, fechas, codigo).
- Carga multiple de archivos por lote (`batchTitle` + `batchDescription`).
- Listado de archivos del expediente con estados de UI y paginacion.

No incluye visor de documentos.

## Stack
- Angular 20 (standalone + SSR)
- TailwindCSS 3
- RxJS
- SCSS

## Arquitectura
Feature `cases` organizada por capas:
- `src/app/features/cases/domain`: modelos de dominio.
- `src/app/features/cases/application`: puertos y casos de uso.
- `src/app/features/cases/infrastructure`: repositorio HTTP, DTOs y mappers.
- `src/app/features/cases/presentation`: pagina y componentes UI.

Elementos transversales:
- `src/app/core/http/with-credentials.interceptor.ts`
- `src/app/core/config/api-base-url.token.ts`

## Requisitos
- Node.js 22+
- npm 10+
- Backend corriendo en `http://localhost:3000`

## Configuracion de entorno
Archivo usado en desarrollo:

`midespacho-frontend-angular/.env.development`

```env
API_BASE_URL=http://localhost:3000/api/v1
```

Resolucion de `API_BASE_URL`:
1. `process.env.API_BASE_URL`
2. `<meta name="api-base-url" ...>`
3. `globalThis.__env.API_BASE_URL`
4. fallback `'/api/v1'`

En SSR server-side, fallback:
- `http://localhost:3000/api/v1`

## Instalacion
```powershell
cd E:\Entrevista\MiDespacho\midespacho-frontend-angular
npm.cmd install
```

## Ejecutar proyecto
```powershell
# SSR en desarrollo
npm.cmd run dev:ssr
```

URL local:
- `http://localhost:4000`

Rutas principales:
- `/` (home)
- `/app/cases/:id` (detalle de expediente)

## Build SSR
```powershell
npm.cmd run build
npm.cmd run start:ssr
```

## Integracion con backend
El frontend consume:
- `GET /cases/:id`
- `GET /cases/:id/files`
- `POST /cases/:id/files`

Flujo esperado:
1. Entra a `/app/cases/:id`.
2. Carga detalle + archivos (pagina 1).
3. Usuario sube lote de archivos.
4. Al exito, refresca listado automaticamente.

Caso demo sugerido (despues de correr `npm.cmd run seed:demo` en backend):
- `/app/cases/b8e5a63e-f8d3-427f-8f59-1f30fce8d001`

## Calidad y pruebas
```powershell
# build SSR
npm.cmd run build

# unit/component/integration tests frontend
npm.cmd run test -- --watch=false --browsers=ChromeHeadless
```

Nota:
- El proyecto no define script `lint` en `package.json`; la validacion automatizada actual del frontend se basa en build + tests.

## UX y accesibilidad
- Diseno mobile-first.
- Estados de pantalla: loading, empty, success, error.
- `aria-live` para mensajes de feedback.
- Navegacion por teclado y focus-visible.
- Drag and drop accesible en formulario de carga.
