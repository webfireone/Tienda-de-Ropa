import jwt from "jsonwebtoken"

const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64

console.log("B64 length:", b64?.length)

const decoded = Buffer.from(b64, "base64").toString()
console.log("Decoded starts with:", decoded.substring(0, 60))

const sa = JSON.parse(decoded)

console.log("client_email:", sa.client_email)
console.log("private_key starts with:", sa.private_key.substring(0, 40))
console.log("private_key has newlines:", sa.private_key.includes("\n"))

const signed = jwt.sign(
  {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/monitoring.read",
    aud: "https://oauth2.googleapis.com/token",
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  },
  sa.private_key,
  { algorithm: "RS256" }
)

console.log("JWT signed OK, length:", signed.length)

const res = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: signed,
  }),
})
const text = await res.text()
console.log("Status:", res.status)
console.log("Response:", text.substring(0, 500))
