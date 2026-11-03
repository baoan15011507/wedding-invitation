import { useEffect, useRef } from 'react'
import nendoBg from '../assets/nendo.jpg'
import './WelcomeScreen.css'

export const DOOR_MS = 1600

/**
 * Cửa thiệp nendo.jpg.
 * phase: 'closed' | 'opening' | 'open' | 'closing'
 */
export default function WelcomeScreen({
  phase,
  onOpenStart,
  onOpened,
  onClosed,
}) {
  const openedRef = useRef(false)
  const closedRef = useRef(false)

  useEffect(() => {
    if (phase === 'opening') {
      openedRef.current = false
      const id = window.setTimeout(() => {
        if (openedRef.current) return
        openedRef.current = true
        onOpened?.()
      }, DOOR_MS)
      return () => window.clearTimeout(id)
    }
    if (phase === 'closing') {
      closedRef.current = false
      const id = window.setTimeout(() => {
        if (closedRef.current) return
        closedRef.current = true
        onClosed?.()
      }, DOOR_MS)
      return () => window.clearTimeout(id)
    }
    return undefined
  }, [phase, onOpened, onClosed])

  const handleOpen = () => {
    if (phase !== 'closed') return
    onOpenStart?.()
  }

  const busy = phase === 'opening' || phase === 'closing'
  // Luôn gắn trên cửa trái — trượt cùng cửa, không unmount khi mở
  const canClickHy = phase === 'closed'

  return (
    <div
      className={`welcome is-${phase}`}
      role="dialog"
      aria-modal={phase !== 'open'}
      aria-hidden={phase === 'open'}
      aria-label="Thiệp cưới"
    >
      <div className="welcome-door welcome-door--left">
        <div
          className="welcome-door-face"
          style={{ backgroundImage: `url(${nendoBg})` }}
        />

        <button
          type="button"
          className="welcome-hy"
          onClick={handleOpen}
          disabled={!canClickHy || busy}
          aria-label="Bấm Hỷ để mở thiệp và phát nhạc"
          style={{ backgroundImage: `url(${nendoBg})` }}
        >
          <span className="welcome-hy-char hy-blink-gold">囍</span>
        </button>
      </div>

      <div className="welcome-door welcome-door--right" aria-hidden="true">
        <div
          className="welcome-door-face"
          style={{ backgroundImage: `url(${nendoBg})` }}
        />
      </div>
    </div>
  )
}
