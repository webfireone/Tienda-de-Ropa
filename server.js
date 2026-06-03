import express from "express"
import mercadopago from "mercadopago"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3000
const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || ""
const SITE_URL = process.env.SITE_URL || "https://tienda-de-ropa.onrender.com"

if (!ACCESS_TOKEN) {
  console.warn("⚠️  MP_ACCESS_TOKEN no configurado. El checkout con Mercado Pago no funcionará.")
}

mercadopago.configure({ access_token: ACCESS_TOKEN })

const app = express()
app.use(cors())
app.use(express.json());
// Health check endpoint for Render
app.get("/healthz", (_, res) => res.sendStatus(200));

app.post("/api/create-preference", async (req, res) => {
  try {
    if (!ACCESS_TOKEN) {
      return res.status(400).json({ error: "Mercado Pago no configurado" })
    }

    const { items, total, orderId, customerName, customerEmail } = req.body

    if (!items?.length || !total || !orderId) {
      return res.status(400).json({ error: "Faltan datos del pedido" })
    }

    const preference = {
      items: items.map((item, i) => ({
        id: String(i),
        title: `${item.productName} - ${item.color} / Talle ${item.size}`,
        description: `${item.brand} | ${item.color} | Talle ${item.size}`,
        quantity: Number(item.quantity),
        currency_id: "ARS",
        unit_price: Number(item.unitPrice),
      })),
      payer: {
        name: customerName || "Cliente",
        email: customerEmail || "",
      },
      back_urls: {
        success: `${SITE_URL}/api/pago-exitoso?order_id=${orderId}`,
        failure: `${SITE_URL}/api/pago-fallido?order_id=${orderId}`,
        pending: `${SITE_URL}/api/pago-pendiente?order_id=${orderId}`,
      },
      auto_return: "approved",
      external_reference: orderId,
      notification_url: `${SITE_URL}/api/mercadopago-webhook`,
      statement_descriptor: "TIENDA DE ROPA",
    }

    const mpResponse = await mercadopago.preferences.create(preference)
    res.json({
      preferenceId: mpResponse.body.id,
      initPoint: mpResponse.body.init_point,
      sandboxInitPoint: mpResponse.body.sandbox_init_point,
    })
  } catch (err) {
    console.error("Error creating preference:", err)
    res.status(500).json({ error: "Error al crear la preferencia de pago" })
  }
})

app.post("/api/mercadopago-webhook", (req, res) => {
  const { type, data } = req.body
  console.log(`Webhook recibido: type=${type}`, data?.id ? `id=${data.id}` : "")
  res.sendStatus(200)
})

app.get("/api/pago-exitoso", (req, res) => {
  const orderId = req.query.order_id || ""
  res.send(`
    <!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pago exitoso</title>
    <style>body{font-family:sans-serif;background:#0d0d1a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:20px}
    .card{background:linear-gradient(135deg,#1a1a30,#161627);border:1px solid rgba(124,92,252,0.2);border-radius:16px;padding:40px;max-width:420px;width:100%}
    .icon{width:64px;height:64px;border-radius:16px;background:rgba(16,185,129,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:32px}
    h1{font-size:20px;margin-bottom:8px;background:linear-gradient(135deg,#a78bfa,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    p{color:#94a3b8;font-size:14px;margin-bottom:24px;line-height:1.5}
    .btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;background:linear-gradient(135deg,#7c5cfc,#ec4899);color:#fff;text-decoration:none;font-size:14px;font-weight:600;transition:opacity .2s}
    .btn:hover{opacity:.9}</style></head><body>
    <div class="card">
      <div class="icon">✅</div>
      <h1>¡Pago aprobado!</h1>
      <p>Tu pedido <strong>${orderId}</strong> fue registrado.<br>Te vamos a notificar por WhatsApp cuando esté listo.</p>
      <a href="/" class="btn">Volver a la tienda</a>
    </div></body></html>
  `)
})

app.get("/api/pago-fallido", (req, res) => {
  const orderId = req.query.order_id || ""
  res.send(`
    <!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pago rechazado</title>
    <style>body{font-family:sans-serif;background:#0d0d1a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:20px}
    .card{background:linear-gradient(135deg,#1a1a30,#161627);border:1px solid rgba(239,68,68,0.2);border-radius:16px;padding:40px;max-width:420px;width:100%}
    .icon{width:64px;height:64px;border-radius:16px;background:rgba(239,68,68,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:32px}
    h1{font-size:20px;margin-bottom:8px;color:#ef4444}
    p{color:#94a3b8;font-size:14px;margin-bottom:24px;line-height:1.5}
    .btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;background:linear-gradient(135deg,#7c5cfc,#ec4899);color:#fff;text-decoration:none;font-size:14px;font-weight:600;transition:opacity .2s}
    .btn:hover{opacity:.9}</style></head><body>
    <div class="card">
      <div class="icon">❌</div>
      <h1>Pago rechazado</h1>
      <p>El pago del pedido <strong>${orderId}</strong> no pudo procesarse.<br>Podés intentar con otro medio de pago.</p>
      <a href="/" class="btn">Volver a la tienda</a>
    </div></body></html>
  `)
})

app.get("/api/pago-pendiente", (req, res) => {
  const orderId = req.query.order_id || ""
  res.send(`
    <!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pago pendiente</title>
    <style>body{font-family:sans-serif;background:#0d0d1a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:20px}
    .card{background:linear-gradient(135deg,#1a1a30,#161627);border:1px solid rgba(251,191,36,0.2);border-radius:16px;padding:40px;max-width:420px;width:100%}
    .icon{width:64px;height:64px;border-radius:16px;background:rgba(251,191,36,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:32px}
    h1{font-size:20px;margin-bottom:8px;color:#f59e0b}
    p{color:#94a3b8;font-size:14px;margin-bottom:24px;line-height:1.5}
    .btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;background:linear-gradient(135deg,#7c5cfc,#ec4899);color:#fff;text-decoration:none;font-size:14px;font-weight:600;transition:opacity .2s}
    .btn:hover{opacity:.9}</style></head><body>
    <div class="card">
      <div class="icon">⏳</div>
      <h1>Pago pendiente</h1>
      <p>El pago del pedido <strong>${orderId}</strong> está siendo procesado.<br>Te avisaremos cuando se confirme.</p>
      <a href="/" class="btn">Volver a la tienda</a>
    </div></body></html>
  `)
})

app.use(express.static(path.join(__dirname, "dist")))

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"))
})

app.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}`)
  if (ACCESS_TOKEN) console.log("✅ Mercado Pago configurado")
})
