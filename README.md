# Sistema de Cobros — Documentación

Este repositorio contiene un sistema de cobros completo con frontend en Angular y backend en Node.js/Express sobre MySQL. Incluye gestión de clientes, planes, mensualidades/pagos, métricas de dashboard y envío de notificaciones.

## Arquitectura
- Frontend: Angular 18 con componentes standalone y Angular Material.
- Backend: Express en TypeScript con autenticación JWT y MySQL.
- Base de datos: MySQL con tablas `users`, `clientes`, `mensualidades`, `planes`, `notification_logs`.
- Integraciones:
  - Resolución de datos de clientes por DNI/RUC vía ApiPeru.
  - Envío de notificaciones vía un servicio externo (`WASAPI`).

## Requisitos
- Node.js 18+
- MySQL 8+
- NPM

## Configuración de entorno (Backend)
Crear `.env` en `backend/` con:
```
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=sistemacobros
JWT_SECRET=una_clave_segura
APIPERU_TOKEN=<token_apiperu>
WASAPI_URL=https://wasapi.tu-dominio.com
WASAPI_TOKEN=<token_wasapi>
SEED_ADMIN_USER=admin
SEED_ADMIN_PASS=admin123
```

Variables usadas en código:
- `backend/src/services/db.ts:8` `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `backend/src/controllers/auth.controller.ts:14` `JWT_SECRET`
- `backend/src/services/apiperu.service.ts:5` `APIPERU_TOKEN`
- `backend/src/services/notifications.service.ts:14` `WASAPI_URL`, `WASAPI_TOKEN`

## Instalación y ejecución
- Backend:
  ```
  cd backend
  npm install
  npm run init-db
  npm run seed
  npm run dev
  ```
- Frontend:
  ```
  cd frontend
  npm install
  npm start
  ```
El frontend apunta por defecto al backend en `http://localhost:4000` (`frontend/src/app/core/auth.interceptor.ts:5`).

## Estructura de carpetas
- `frontend/src/app`
  - `app.component.ts`: barra de navegación y `logout` (`frontend/src/app/app.component.ts:1`)
  - `app.routes.ts`: rutas y guards de roles (`frontend/src/app/app.routes.ts:11`)
  - `core`: `auth.service`, `auth.guard`, `role.guard`, `auth.interceptor`
  - `features`: `auth/login`, `dashboard`, `clients`, `plans`, `payments`, `notifications`
- `backend/src`
  - `app.ts`: define routers y middleware (`backend/src/app.ts:1`)
  - `server.ts`: arranque y prueba de conexión (`backend/src/server.ts:6`)
  - `routes`: `auth.routes`, `clients.routes`, `payments.routes`, `payments.metrics.routes`, `notifications.routes`, `plans.routes`
  - `controllers`: lógica de cada módulo
  - `services`: `db`, `apiperu.service`, `notifications.service`
  - `scripts`: `init-db.ts`, `seed.ts`
  - `db/schema.sql`: esquema de base de datos

## Autenticación y seguridad
- Login entrega JWT (`backend/src/controllers/auth.controller.ts:5`).
- Middleware `authenticate` valida el token (`backend/src/middleware/auth.ts:12`).
- Middleware `authorize` filtra por roles (`backend/src/middleware/auth.ts:23`).
- En el frontend, el interceptor adjunta `Authorization: Bearer <token>` y enruta hacia el backend (`frontend/src/app/core/auth.interceptor.ts:7`).

Roles disponibles:
- `admin`: acceso completo
- `cobrador`: gestión de clientes y pagos
- `supervisor`: consultas, métricas y notificaciones

## Frontend — Funcionalidades
- Login (`frontend/src/app/features/auth/login.component.ts:1`)
- Dashboard con métricas (`frontend/src/app/features/dashboard/dashboard.component.ts:1`)
- Clientes: búsqueda, alta/edición, activación/inactivación, eliminación, asignación de plan, resolución de DNI/RUC (`frontend/src/app/features/clients/clients.component.ts:1`)
- Planes: CRUD, activar/desactivar, paginación y orden (`frontend/src/app/features/plans/plans.component.ts:15`)
- Mensualidades/Pagos: alta, pago directo, CSV, marcar vencidos (`frontend/src/app/features/payments/payments.component.ts:1`)
- Notificaciones: envío masivo a morosos y consulta de logs (`frontend/src/app/features/notifications/notifications.component.ts:1`)

## Backend — API

Autenticación:
- `POST /auth/login` → devuelve `{ token, role, username }` (`backend/src/routes/auth.routes.ts:6`, `backend/src/controllers/auth.controller.ts:5`)

Clientes:
- `GET /clients` lista con filtros y paginación (`backend/src/routes/clients.routes.ts:9`, `backend/src/controllers/clients.controller.ts:33`)
- `GET /clients/:id` detalle (`backend/src/routes/clients.routes.ts:10`, `backend/src/controllers/clients.controller.ts:70`)
- `POST /clients` crear (admin) (`backend/src/routes/clients.routes.ts:11`, `backend/src/controllers/clients.controller.ts:78`)
- `PUT /clients/:id` actualizar (admin) (`backend/src/routes/clients.routes.ts:12`)
- `PATCH /clients/:id/toggle` activar/inactivar (admin) (`backend/src/routes/clients.routes.ts:13`, `backend/src/controllers/clients.controller.ts:116`)
- `DELETE /clients/:id` eliminar (admin) (`backend/src/routes/clients.routes.ts:14`, `backend/src/controllers/clients.controller.ts:126`)
- `POST /clients/resolve` resolver datos por DNI/RUC (`backend/src/routes/clients.routes.ts:15`, `backend/src/controllers/clients.controller.ts:135`)
- Al asignar/editar `plan_id`, se garantiza una mensualidad pendiente futura (`backend/src/controllers/clients.controller.ts:12`)

Planes:
- `GET /plans` lista con filtros (`backend/src/app.ts:19`, `backend/src/controllers/plans.controller.ts:1`)
- `GET /plans/:id` detalle (`backend/src/controllers/plans.controller.ts:15`)
- `POST /plans` crear (admin/supervisor según rutas) (`backend/src/controllers/plans.controller.ts:25`)
- `PUT /plans/:id` actualizar (`backend/src/controllers/plans.controller.ts:25`)
- `PATCH /plans/:id/toggle` activar/desactivar (`backend/src/controllers/plans.controller.ts:45`)
- `DELETE /plans/:id` eliminar

Mensualidades y pagos:
- `GET /payments` listar, opcional `cliente_id` (`backend/src/routes/payments.routes.ts:9`, `backend/src/controllers/payments.controller.ts:5`)
- `POST /payments` crear mensualidad (admin) (`backend/src/routes/payments.routes.ts:10`, `backend/src/controllers/payments.controller.ts:17`)
- `POST /payments/:id/pagar` marcar pagado y notificar (`backend/src/routes/payments.routes.ts:11`, `backend/src/controllers/payments.controller.ts:28`)
- `POST /payments/pago-directo` registrar pago directo y notificar (`backend/src/routes/payments.routes.ts:12`, `backend/src/controllers/payments.controller.ts:40`)
- `GET /payments/export.csv` exportar CSV (`backend/src/routes/payments.routes.ts:13`, `backend/src/controllers/payments.controller.ts:57`)
- `POST /payments/mark-vencidos` marcar vencidos (`backend/src/routes/payments.routes.ts:14`, `backend/src/controllers/payments.controller.ts:100`)

Métricas:
- `GET /payments/metrics` métricas para dashboard (`backend/src/routes/payments.metrics.routes.ts:9`, `backend/src/controllers/metrics.controller.ts:4`)

Notificaciones:
- `POST /notifications/morosos/mass` envío masivo a morosos (`backend/src/routes/notifications.routes.ts:9`, `backend/src/controllers/notifications.controller.ts:1`)
- `GET /notifications/logs` últimos logs de notificación (`backend/src/routes/notifications.routes.ts:10`, `backend/src/controllers/notifications.controller.ts:22`)

Salud:
- `GET /health` verificación de servicio (`backend/src/app.ts:21`)

## Esquema de BD
Definido en `backend/db/schema.sql` con las tablas y claves necesarias. Se inicializa con `npm run init-db` y se siembra un usuario admin con `npm run seed`.

## Comandos útiles
- Backend:
  - `npm run dev` arranca el servidor en desarrollo.
  - `npm run build` compila a `dist/`.
  - `npm run start` corre desde `dist/`.
  - `npm run init-db` crea la base de datos y aplica migraciones simples.
  - `npm run seed` crea el usuario admin.
- Frontend:
  - `npm start` sirve la app en desarrollo.
  - `npm run build` genera el build de producción.

## Cambios y mejoras clave
- Integración de planes y vínculo con clientes, generando mensualidades futuras automáticamente (`backend/src/controllers/clients.controller.ts:12`).
- Exportación CSV de mensualidades (`backend/src/controllers/payments.controller.ts:57`).
- Métricas para dashboard (`backend/src/controllers/metrics.controller.ts:4`).
- Pago directo con notificación (`backend/src/controllers/payments.controller.ts:40`).
- Marcado masivo de mensualidades vencidas (`backend/src/controllers/payments.controller.ts:100`).
- Resolución de clientes por DNI/RUC con ApiPeru (`backend/src/services/apiperu.service.ts:1`).
- Envío de notificaciones con reintentos y registro de logs (`backend/src/services/notifications.service.ts:18`, `backend/src/controllers/notifications.controller.ts:1`).
- Guards de autenticación y roles en frontend (`frontend/src/app/core/auth.guard.ts:5`, `frontend/src/app/core/role.guard.ts:5`).

## Notas de seguridad
- No exponer `JWT_SECRET`, `APIPERU_TOKEN` ni `WASAPI_TOKEN` en el código o logs.
- Usar HTTPS para el servicio de notificaciones.
- Limitar roles y revisar permisos de rutas (`backend/src/middleware/auth.ts:23`).

## Probando el sistema
1. Iniciar backend (`npm run dev`) y frontend (`npm start`).
2. Ingresar con el usuario sembrado (`SEED_ADMIN_USER` / `SEED_ADMIN_PASS`).
3. Crear un plan y asignarlo a un cliente; verificar que se genere una mensualidad pendiente.
4. Registrar un pago y revisar el log de notificaciones.
5. Consultar métricas en el dashboard.

