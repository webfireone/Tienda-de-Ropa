import http from "node:http"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 10000
const DIST = path.join(__dirname, "dist")

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".pdf": "application/pdf",
  ".json": "application/json",
  ".ico": "image/x-icon",
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`).pathname
  const filePath = path.join(DIST, url === "/" ? "index.html" : url)
  const ext = path.extname(filePath)

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" })
    fs.createReadStream(filePath).pipe(res)
  } else {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
    fs.createReadStream(path.join(DIST, "index.html")).pipe(res)
  }
})

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
