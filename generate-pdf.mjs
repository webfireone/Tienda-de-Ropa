import puppeteer from "puppeteer"
import { fileURLToPath } from "url"
import path from "path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const htmlPath = path.join(__dirname, "manual-usuario.html")
const pdfPath = path.join(__dirname, "manual-usuario.pdf")

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
})

const page = await browser.newPage()
await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0", timeout: 30000 })

await page.pdf({
  path: pdfPath,
  format: "A4",
  margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
  printBackground: true,
  displayHeaderFooter: false,
})

await browser.close()

console.log(`PDF generado: ${pdfPath}`)
