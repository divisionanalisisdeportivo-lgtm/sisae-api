# SISAE - Sistema de Sanciones

Sistema completo para la gestión de sanciones deportivas de clubes y personas.

## Instalación Rápida

1. Instalar Node.js 18+ y PostgreSQL
2. Crear base de datos: `CREATE DATABASE sisae_db;`
3. Copiar `.env.example` a `.env` y configurar credenciales
4. Ejecutar: `npm install`
5. Ejecutar: `npm run db:push`
6. Ejecutar: `npm run dev`
7. Abrir: http://localhost:5000

## Funcionalidades

- Gestión de sanciones de clubes
- Gestión de sanciones personales (Tribuna Segura)
- Reportes PDF mensuales
- Sistema de respaldos
- Panel de administración

## Tecnologías

- **Backend:** Node.js, Express, TypeScript
- **Frontend:** React, Vite, Tailwind CSS
- **Base de datos:** PostgreSQL, Drizzle ORM
- **Autenticación:** Passport.js

Ver `INSTRUCCIONES.txt` para guía completa de instalación.
