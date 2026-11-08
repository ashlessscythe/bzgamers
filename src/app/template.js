// Re-mounts on every navigation, so the CSS fade-in below acts as a page
// transition. CSS-only (opacity/transform) to stay cheap; disabled for
// prefers-reduced-motion in globals.css.
export default function Template({ children }) {
  return <div className="page-transition">{children}</div>
}
