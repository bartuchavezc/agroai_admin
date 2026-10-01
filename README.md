# AgroAI Admin

Panel de administración (solo lectura, por ahora) de la plataforma **AgroAI**: una plataforma agéntica de agricultura a pequeña escala (huerta familiar).

Este repo es el **tercer proyecto** de la familia:

| Repo | Rol |
|---|---|
| `agroai_crops-agent-api` | Backend (FastAPI + agente Gemini/ADK + Postgres con TimescaleDB y pgvector) |
| `agroai_web-monitoring` | Cliente de usuarios (Next.js, mobile-first, chat con el agente) |
| **`agroai_admin`** | Panel del administrador de la plataforma (este repo) |

## Objetivo

Dar al admin de la plataforma una web limpia, simple y pulida para entender de un vistazo **cómo se usa AgroAI**: quiénes la usan, cuánto, y en qué estado está todo. No es una herramienta para agricultores; es metadata de negocio y operación.

## Qué muestra

**Resumen** (`/`, período de 7 / 30 / 90 días o 1 año):

- **Usuarios y cuentas**: totales, altas del período, DAU/WAU/MAU y stickiness, usuarios por cuenta, cuentas con equipo.
- **Permisos y roles**: distribución por `User.role` (owner / técnico / staff), activos vs. dados de baja, onboarding completo vs. pendiente.
- **BYOK**: usuarios con key de Gemini configurada vs. sin configurar (nunca se muestra la key).
- **Actividad diaria**: usuarios activos, mensajes, sesiones, fotos, eventos y altas por día.
- **Sesiones y chat**: sesiones de uso, duración mediana / promedio / p90, mensajes por sesión, distribución del largo; conversaciones y mensajes.
- **Fotos y análisis**: fotos subidas (y del plano del campo), por tipo de reporte y estado del análisis, tasa de éxito.
- **Huertas**: campos, superficie total / promedio / mediana y distribución por tamaño, ciclos por estado, cultivos más sembrados, eventos por tipo y por origen (usuario o agente).
- **Agente**: llamadas a herramientas y errores, uso por herramienta, búsquedas web, memorias.
- **Adopción de módulos**: cuántas cuentas usan chat, diagnóstico, campos, ciclos, eventos, inventario, compras, presupuesto, hoja de ruta, satélite.
- **Perfiles** del cuestionario de onboarding, **alertas** y **salud** (base de datos, frescura del worker SMN).

**Usuarios** (`/usuarios`) y **Cuentas** (`/cuentas`): tablas ordenables y con búsqueda, con rol, estado, última actividad y contadores de uso (sesiones, tiempo en chat, mensajes, fotos, eventos, campos, superficie, ciclos).

Definiciones (las calcula la API):
- *Activo*: mandó un mensaje al agente, subió una foto o cargó un evento.
- *Sesión*: mensajes de un usuario separados por menos de 30 min; dura del primer mensaje a la última respuesta del agente.
- *Foto*: cada subida (`POST /upload/image`) más las fotos del plano de cada campo.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Despliegue independiente en **Vercel**

## Datos y acceso

El panel consume `GET /api/v1/admin/{me,overview,timeseries,users,accounts}` de `agroai_crops-agent-api`: solo agregados y metadata, nunca el texto de los chats, las fotos ni las keys.

- Acceso: solo los emails listados en `PLATFORM_ADMIN_EMAILS` de la API (cualquier otro usuario recibe 404). Se ingresa con el usuario y contraseña normales de AgroAI.
- El login es una Server Action: el token queda en una cookie `httpOnly` y todas las llamadas a la API salen del servidor de Next, así que el navegador nunca ve el token ni habla con la API (no hace falta agregar el panel a `CORS_ORIGINS`).

## Desarrollo

Requiere Node >= 20.9.

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

Variables de entorno (ver `.env.example`): `AGROAI_API_URL`, la URL base de la API (con o sin `/api/v1`; también se acepta `NEXT_PUBLIC_API_URL`; las dos se leen en cada request, sin necesidad de rebuild). Si el login no conecta, abrí `/diagnostico`: muestra qué URL usa el servidor del panel y qué responde la API. En la API, agregar tu email a `PLATFORM_ADMIN_EMAILS`.

## Estado

Primera versión: login de admin, resumen de KPIs, usuarios y cuentas. Pendiente: latencias del agente (la API todavía no las guarda).
