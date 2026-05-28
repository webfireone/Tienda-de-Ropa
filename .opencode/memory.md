# Memory

## Proyecto
- Tienda de Ropa — e-commerce con Vite + React + TypeScript (frontend) y serverless functions en Vercel (backend).
- Desplegado en: https://glamours-lujan.vercel.app

## Servicios
| Servicio | URL | Plan | Estado actual |
|----------|-----|------|---------------|
| GitHub | https://github.com/webfireone | Gratuito | Conexión OK, billing endpoints requieren PAT con scope `user` |
| Vercel | https://vercel.com/webfireones-projects/glamours-lujan | **Hobby** (gratuito) | Auto-deploy desde GitHub main. API usage no expone datos en Hobby |
| Render | https://dashboard.render.com | **Free** | **Suspendido hasta 01/06/2026** — cuota mensual agotada. 9 servicios (2 web + 7 static) |
| Firebase | https://console.firebase.google.com | **Spark** (gratuito) | Conexión OK. Métricas detalladas requieren plan Blaze |

## Último commit (HEAD): b3fb5c3
- `main` está sincronizado en 2 PCs via GitHub

## Workflow actual
- Solo Vercel activo (Render suspendido hasta 01/06)
- commit → `git push origin main` → Vercel auto-deploy
- Importante: no tocar Render hasta 01/06

## Últimos cambios (commit 437c4e1 + 11f9a0c + b3fb5c3)
- **BellezaPage**: rewrite completo — preview completa del sitio en vivo, controles inline de fuentes + weights (`bodyWeight`), eliminados tabs y fondos presets
- **StatusServiciosPage**: nueva página `/admin/status` con health checks de Vercel, Render, Firebase, GitHub
- **Header**: admin links ahora en dropdown hamburguesa (desktop + mobile)
- **bellezaStore**: `bodyWeight` se aplica como CSS variable `--font-weight-body` y `font-weight` al body
- **App.tsx**: `useBellezaStore.subscribe()` para re-aplicar theme config en cambios async
- **Nuevos archivos**: `api/status-servicios.js`, `public/instructivo-carga-producto.html`, `public/devil-wears-prada-effect.html`

## Tareas pendientes

### 01/06/2026 — Reactivar y sincronizar Render
Render está suspendido por superar la cuota mensual gratuita. Pendiente para el 1 de junio:

- [ ] **Paso 1**: Ir a https://dashboard.render.com → reactivar servicios (2 web + 7 static)
- [ ] **Paso 2**: Verificar auto-deploy de main o hacer Manual Deploy → Deploy Latest Commit
- [ ] **Paso 3**: Replicar serverless functions (`api/`) y config de Vercel (`vercel.json`) en Render (`server.js` + `render.yaml`)
- [ ] **Paso 4**: Configurar env vars en Render: `MP_ACCESS_TOKEN`, `FIREBASE_SERVICE_ACCOUNT_B64`, `GH_TOKEN`, `RENDER_API_KEY`, `VERCEL_API_TOKEN`
- [ ] **Paso 5**: Confirmar sitio en https://glamours-lujan.onrender.com
- [ ] **Paso 6**: Verificar endpoints API (`/api/pago-exitoso`, etc.)
- [ ] **Paso 7**: Testear `/api/status-servicios` → Render debe mostrar datos sin suspensión
- [ ] **Paso 8**: Verificar webhooks y auto-deploy desde GitHub main en ambas plataformas
