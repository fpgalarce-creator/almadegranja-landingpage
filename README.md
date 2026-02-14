# Alma de Granja v2

Monorepo con frontend (Vite + React + Tailwind) y backend (Node + Express).

## Requisitos

- Node.js 18+
- npm 9+

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend healthcheck: http://localhost:3001/api/health

> El servidor de Vite se expone en `0.0.0.0:5173` con `strictPort` activado.

## Credenciales admin (desarrollo)

- Usuario: `admin`
- Contraseña: `admin123`

Configúralas vía `.env` en `/server` si necesitas otras.

## Variables de entorno

Copia `/server/.env.example` a `/server/.env` y ajusta valores.

- `ADMIN_USER`
- `ADMIN_PASSWORD` (o `ADMIN_PASS`)
- `JWT_SECRET`
- `CLIENT_ORIGIN`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER` (opcional)

## WhatsApp pedidos

El carrito genera el mensaje con el formato:

```
Pedido Alma de Granja:
- {producto} x{cantidad} — ${subtotal}
Total: ${total}
```

El botón abre:

```
https://wa.me/56958086762?text=MENSAJE_URL_ENCODED
```

## Notas sobre imágenes

En el panel admin pega la URL pública (Cloudinary u otra CDN) para ver el preview. No hay upload aún.

## Cloudinary (placeholder)

El backend expone `POST /api/admin/cloudinary/signature` (protegido) para obtener `signature` y `timestamp` cuando
se implemente upload directo.

## Deploy (Vercel)

- Frontend: carpeta `/client`
- Backend: despliega `/server` como proyecto Node
- Configura las variables de entorno en el dashboard (ADMIN_USER, ADMIN_PASSWORD o ADMIN_PASS, JWT_SECRET, CLOUDINARY_*).

## Checklist Vercel ENV

Variables requeridas para login/admin:

- `ADMIN_USER`
- `ADMIN_PASSWORD` (o `ADMIN_PASS`)
- `JWT_SECRET`

> Para evitar fallos en deployments, define las mismas variables tanto en **Production** como en **Preview**.

Nota: URLs con formato `https://<project>-<hash>-<team>.vercel.app` normalmente corresponden a entornos **Preview**.

