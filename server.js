import express from "express"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 10000

app.use(express.static(path.join(__dirname, "dist")))

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"), (err) => {
    if (err) next(err)
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
