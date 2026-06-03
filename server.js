import express from "express"

const app = express()
const PORT = process.env.PORT || 3000

app.get("/healthz", (_, res) => res.sendStatus(200))

app.get("/api/status-servicios", (req, res) => {
  res.json({
    ok: true,
    github: { configured: false, error: "GH_TOKEN no configurado" },
    vercel: { configured: false, error: "VERCEL_API_TOKEN no configurado" },
    render: { configured: false, error: "RENDER_API_KEY no configurado" },
    firebase: { configured: true, projectId: process.env.VITE_FIREBASE_PROJECT_ID, reads: { spark: true } },
    timestamp: new Date().toISOString(),
  })
})

app.use(express.static("dist"))

app.get("*", (req, res) => {
  res.sendFile("dist/index.html", { root: "." })
})

app.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}`)
})
