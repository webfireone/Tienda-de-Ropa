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

## Tareas pendientes

### 01/06/2026 — Reactivar y sincronizar Render
Render está suspendido por superar la cuota mensual gratuita. Pendiente para el 1 de junio:
- [ ] Reactivar servicios en Render
- [ ] Desplegar misma versión que está en Vercel (replicar ambos lados)
- [ ] Verificar webhooks y auto-deploy desde GitHub
- [ ] Actualizar API key de Render si es necesario (RENDER_API_KEY en Vercel)
- [ ] Testear que el endpoint /api/status-servicios muestre datos correctos de Render
