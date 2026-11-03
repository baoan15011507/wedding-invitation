import lotusRed from '../assets/lotus-red.png'

/** Chỉ đỏ —— hoa sen (line-art đỏ, nền trong suốt) —— chỉ đỏ */
export default function LotusDivider({ className = '' }) {
  return (
    <div className={`lotus-divider ${className}`.trim()} aria-hidden="true">
      <span className="lotus-divider-line" />
      <img className="lotus-divider-flower" src={lotusRed} alt="" />
      <span className="lotus-divider-line" />
    </div>
  )
}
