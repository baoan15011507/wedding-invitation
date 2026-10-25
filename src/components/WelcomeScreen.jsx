import { useRef, useState } from 'react'
import nendoBg from '../assets/nendo.jpg'
import './WelcomeScreen.css'

const OPEN_MS = 1600

/**
 * Màn mở đầu: 2 cánh cửa từ nendo.jpg.
 * Bấm 囍 → onOpenStart() (phát nhạc trong cùng user gesture) + mở cửa.
 */
export default function WelcomeScreen({ onOpenStart, onFinished }) {
  const [opening, setOpening] = useState(false)
  const [gone, setGone] = useState(false)
  const finishedRef = useRef(false)

  const finish = () => {
    if (finishedRef.current) return
    finishedRef.current = true
    setGone(true)
    onFinished?.()
  }

  const handleOpen = () => {
    if (opening) return
    setOpening(true)

    // Gọi ngay trong handler click — không để trong setTimeout — để Chrome không chặn audio
    onOpenStart?.()

    window.setTimeout(finish, OPEN_MS)
  }

  if (gone) return null

  return (
    <div
      className={`welcome${opening ? ' is-opening' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Mở thiệp cưới"
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
          disabled={opening}
          aria-label="Bấm Hỷ để mở thiệp và phát nhạc"
          style={{ backgroundImage: `url(${nendoBg})` }}
        >
          <span className="welcome-hy-char">囍</span>
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
