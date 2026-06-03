const BASE = location.hostname.endsWith("onrender.com")
  ? "https://glamours-lujan.vercel.app"
  : ""
export const apiUrl = (path: string) => `${BASE}${path}`
