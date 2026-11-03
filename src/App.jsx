import { useCallback, useEffect, useRef, useState } from 'react'
import InvitationScroll from './components/InvitationScroll'
import MusicToggle from './components/MusicToggle'
import WelcomeScreen from './components/WelcomeScreen'
import musicUrl from './assets/nhac/nhaccuoi.mp3'
import './App.css'

function App() {
  /** closed | opening | open | closing */
  const [doorPhase, setDoorPhase] = useState('closed')
  const [musicOn, setMusicOn] = useState(false)
  /** Đổi key khi đóng → remount thiệp từ đầu */
  const [inviteKey, setInviteKey] = useState(0)
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

  const ensureAudio = () => {
    let audio = audioRef.current
    if (!audio) {
      audio = new Audio(musicUrl)
      audio.loop = true
      audio.preload = 'auto'
      audio.volume = 0.6
      audioRef.current = audio
    }
    return audio
  }

  /** Phát từ đầu (dùng khi bấm 囍 mở thiệp) */
  const playMusicFromStart = () => {
    const audio = ensureAudio()
    audio.muted = false
    audio.currentTime = 0
    const playPromise = audio.play()
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => setMusicOn(true))
        .catch(() => {
          audio.muted = false
          void audio
            .play()
            .then(() => setMusicOn(true))
            .catch(() => setMusicOn(false))
        })
    } else {
      setMusicOn(true)
    }
  }

  const stopMusic = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    setMusicOn(false)
  }

  const toggleMusic = () => {
    const audio = ensureAudio()
    if (!audio.paused && !audio.muted) {
      audio.pause()
      setMusicOn(false)
      return
    }
    audio.muted = false
    const playPromise = audio.play()
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => setMusicOn(true))
        .catch(() => setMusicOn(false))
    } else {
      setMusicOn(true)
    }
  }

  const handleOpenStart = useCallback(() => {
    playMusicFromStart()
    setDoorPhase('opening')
  }, [])

  const handleOpened = useCallback(() => {
    setDoorPhase('open')
  }, [])

  const handleCloseInvite = () => {
    if (doorPhase !== 'open') return
    stopMusic()
    setDoorPhase('closing')
    setInviteKey((k) => k + 1)
  }

  const handleClosed = useCallback(() => {
    setDoorPhase('closed')
  }, [])

  const inviteOpen = doorPhase === 'open' || doorPhase === 'opening'

  return (
    <div className={`app${inviteOpen ? ' is-welcomed' : ''}`}>
      <div className="phone-shell">
        <InvitationScroll
          key={inviteKey}
          active={doorPhase === 'open' || doorPhase === 'opening'}
          onCloseInvite={handleCloseInvite}
        />

        <MusicToggle
          visible={doorPhase === 'open' || doorPhase === 'opening'}
          playing={musicOn}
          onToggle={toggleMusic}
        />

        <WelcomeScreen
          phase={doorPhase}
          onOpenStart={handleOpenStart}
          onOpened={handleOpened}
          onClosed={handleClosed}
        />
      </div>
    </div>
  )
}

export default App
