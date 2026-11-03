export default function HySeal({ className = '' }) {
  return (
    <div className={`hy-seal ${className}`.trim()} aria-hidden="true">
      <span className="hy-blink">囍</span>
    </div>
  )
}
