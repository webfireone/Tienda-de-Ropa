export default async function handler(req, res) {
  const orderId = req.query.order_id || ""
  res.setHeader("Content-Type", "text/html; charset=utf-8")
  res.status(200).send(`
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
}
