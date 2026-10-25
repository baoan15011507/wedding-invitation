export default function HySeal({ className = '' }) {
  return (
    <div className={`hy-seal ${className}`.trim()} aria-hidden="true">
      <span>囍</span>
    </div>
  )
}
