import { useEffect, useRef, useState } from 'react'
import InvitationScroll from './components/InvitationScroll'
import WelcomeScreen from './components/WelcomeScreen'
import musicUrl from './assets/nhac/nhaccuoi.mp3'
import './App.css'

function App() {
  const [welcomed, setWelcomed] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    return () => {
      const audio = audioRef.current
      if (audio) {
        audio.pause()
        audio.src = ''
        audioRef.current = null
      }
    }
  }, [])

  /**
   * Tạo + play Audio ngay trong onClick Hỷ (cùng user gesture).
   * Không play trong setTimeout / sau unmount welcome — tránh Chrome chặn autoplay.
   */
  const playMusicFromGesture = () => {
    let audio = audioRef.current
    if (!audio) {
      audio = new Audio(musicUrl)
      audio.loop = true
      audio.preload = 'auto'
      audio.volume = 0.6
      audioRef.current = audio
    }

    audio.muted = false
    const playPromise = audio.play()
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(() => {
        // fallback: unmute retry trong cùng chuỗi microtask sau click
        audio.muted = false
        void audio.play().catch(() => {})
      })
    }
  }

  return (
    <div className={`app${welcomed ? ' is-welcomed' : ''}`}>
      <div className="phone-shell">
        <InvitationScroll active={welcomed} />

        {!welcomed && (
          <WelcomeScreen
            onOpenStart={playMusicFromGesture}
            onFinished={() => setWelcomed(true)}
          />
        )}
      </div>
    </div>
  )
}

export default App
