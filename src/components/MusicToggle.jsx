import './MusicToggle.css'

/** Nút bật/tắt nhạc — cố định góc dưới trái, xoay khi đang phát */
export default function MusicToggle({ playing, onToggle, visible }) {
  if (!visible) return null

  return (
    <button
      type="button"
      className={`music-toggle${playing ? ' is-playing' : ''}`}
      onClick={onToggle}
      aria-label={playing ? 'Tắt nhạc' : 'Bật nhạc'}
      aria-pressed={playing}
    >
      <span className="music-toggle-disc" aria-hidden="true">
        <svg viewBox="0 0 48 48" className="music-toggle-svg">
          <circle cx="24" cy="24" r="22" className="music-toggle-ring" />
          <circle cx="24" cy="24" r="7" className="music-toggle-hub" />
          <path
            className="music-toggle-note"
            d="M30 12v16.2a5.2 5.2 0 1 1-2.4-4.4V16.2l-10 2.2v14.3a5.2 5.2 0 1 1-2.4-4.4V15.6L30 12z"
          />
        </svg>
      </span>
    </button>
  )
}
