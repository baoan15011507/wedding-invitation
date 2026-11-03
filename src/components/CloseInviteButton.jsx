import './CloseInviteButton.css'

/** Icon thiệp đóng đỏ — cuối nội dung, không nền/border */
export default function CloseInviteButton({ onClick, disabled }) {
  return (
    <div className="close-invite-wrap">
      <button
        type="button"
        className="close-invite-btn"
        onClick={onClick}
        disabled={disabled}
        aria-label="Đóng thiệp và tắt nhạc"
      >
        <svg viewBox="0 0 48 40" className="close-invite-svg" aria-hidden="true">
          <rect
            x="5"
            y="9"
            width="38"
            height="26"
            rx="2.5"
            fill="#c62828"
            stroke="#d4af37"
            strokeWidth="2"
          />
          <path
            d="M5 11.5L24 25L43 11.5"
            stroke="#d4af37"
            strokeWidth="2"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M7 9L24 4.5L41 9V11.5L24 21L7 11.5V9Z"
            fill="#b71c1c"
            stroke="#d4af37"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}
