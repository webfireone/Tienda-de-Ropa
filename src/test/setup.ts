import "@testing-library/jest-dom/vitest"

vi.mock("@/lib/firebase", () => ({
  db: {},
  auth: {},
  app: {},
  default: {},
}))

const { getComputedStyle } = window
window.getComputedStyle = (elt) => getComputedStyle(elt)
