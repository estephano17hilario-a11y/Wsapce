# Sistema de Enlaces de Referidos

## Qué es un enlace de referencia

- Un enlace de referencia es una URL única que rastrea y atribuye nuevos registros a quien lo comparte.
- El formato usado es `https://tu-dominio/?ref=CODIGO`, donde `CODIGO` es alfanumérico en mayúsculas.
- Estos enlaces permiten atribución justa y precisa, con seguimiento automático sin depender de la introducción manual del código.

## Arquitectura y almacenamiento

- Persistencia primaria: Vercel KV si se configuran `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
- Persistencia secundaria: archivo `data/referrals.json` cuando KV no está disponible.
- Recomendación: habilitar KV en producción para evitar caducidades falsas al usar múltiples instancias.

## Generación y validez

- Generación: disponible para usuarios con plan `PLATA` vía `POST /api/referrals/generate`.
- Caducidad: mínimo 24 horas; configurado a 90 días por defecto.
- Código: 9 caracteres alfanuméricos en mayúsculas.
- Enlace de compartir: `origin/?ref=CODE`, incluye `expiresAt` para mostrar la fecha de expiración.

## Verificación y estados

- Estados soportados al validar un código:
  - `valid`: código activo y no expirado.
  - `expired`: código existente pero caducado.
  - `inactive`: código existente pero marcado inactivo.
  - `not_found`: código inexistente.
- Mensajes mostrados en UI:
  - `ref_invalid`: Enlace inválido.
  - `ref_expired`: Enlace caducado.
  - `ref_inactive`: Enlace inactivo.
  - `self_referral_not_allowed`: No puedes auto-referenciarte.
  - `invite_limit_reached`: Límite de invitaciones alcanzado.

## Flujo de registro con referidos

- Registro `POST /api/register`:
  - Recibe `email` y `referralLink` (opcional, puede ser URL o sólo código).
  - Normaliza y verifica el código; distingue claramente entre inválido, caducado e inactivo.
  - Crea usuario y registra relación de referido si el código es válido.

## Límites y reglas

- Auto-referencias: prohibidas, se rechaza si el referrer usa su propio email.
- Límite de invitaciones: `inviteLimit` en `data/referrals.json`.

## Pruebas automatizadas

- Endpoint `GET /api/self-test` ejecuta:
  - Generación de enlace y validación básica.
  - Verificación de TTL mínimo de 24 horas.
  - Pruebas de estados del código (válido, caducado, inactivo, no encontrado).
  - Registro de relación de referido.
  - Métricas de rendimiento: `seed_ms`, `top_ms`.

## Guía para usuarios

- Cómo obtener tu enlace:
  - Regístrate en BRONCE, sube a PLATA, genera tu enlace en la sección de precios.
  - Copia y comparte el enlace completo `origin/?ref=CODE`.
- Cómo usar un enlace:
  - Al registrarte, pega el enlace en el campo “Enlace de invitación”.
  - Si ves “Enlace caducado”, solicita un nuevo enlace al remitente.
- Recomendaciones:
  - Comparte el enlace desde el dominio correcto de producción para evitar inconsistencias.
  - Evita acortar o modificar el enlace; conserva el parámetro `ref` intacto.