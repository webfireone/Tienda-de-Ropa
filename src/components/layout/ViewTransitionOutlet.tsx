import { Outlet } from "react-router-dom"

export function ViewTransitionOutlet() {
  return (
    <div
      className="view-transition-page"
      style={{ viewTransitionName: "page-content" } as React.CSSProperties}
    >
      <Outlet />
    </div>
  )
}
