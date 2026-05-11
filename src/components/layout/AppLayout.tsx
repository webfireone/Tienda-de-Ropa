import { Outlet } from "react-router-dom"
import { Header } from "./Header"
import { SmoothScroll } from "./SmoothScroll"

export function AppLayout() {
  return (
    <SmoothScroll>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
    </SmoothScroll>
  )
}
