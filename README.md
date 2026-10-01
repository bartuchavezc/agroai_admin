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

## Métricas previstas

- **Usuarios y cuentas**: total de usuarios y cuentas (`Account`), altas por período, usuarios activos (DAU/WAU/MAU).
- **Permisos y roles**: distribución por `User.role` (owner / tecnico / staff) y estado de cada usuario (activo, inactivo, pendiente).
- **Fotos**: cantidad de fotos subidas (total, por período, por usuario/cuenta) y diagnósticos multimodales realizados.
- **Chats**: cantidad de conversaciones, mensajes por sesión, duración/largo de las sesiones, sesiones por usuario.
- **Agente**: uso de herramientas (búsqueda web, CRUD de huerta, memoria, clima), errores y latencias.
- **BYOK**: usuarios con clave de Gemini configurada vs. sin configurar (nunca se muestra la clave).
- **Huertas**: campos, ciclos de cultivo y eventos registrados.
- **Salud del sistema**: estado de la API, base de datos y worker.

> El alcance exacto se irá afinando contra el esquema real de la API; ninguna de estas métricas está implementada todavía.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Despliegue independiente en **Vercel**

## Datos

El panel consumirá endpoints de **admin** de `agroai_crops-agent-api` (agregados y metadata, nunca contenido privado de chats ni claves). Esos endpoints, protegidos por rol, aún no existen y se definirán en la API.

## Desarrollo

Requiere Node >= 20.9.

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

Variables de entorno (ver `.env.example` cuando se agregue): URL base de la API y credenciales de acceso del admin.

## Estado

Proyecto inicial (scaffold). Siguiente paso: autenticación de admin y primera vista de resumen (KPIs).
