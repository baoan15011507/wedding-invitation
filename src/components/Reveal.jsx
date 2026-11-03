import { useEffect, useRef, useState } from 'react'

/** Hiện phần tử kiểu slide khi cuộn vào viewport (chỉ khi enabled) */
export default function Reveal({
  children,
  className = '',
  delay = 0,
  enabled = true,
  as: Tag = 'div',
}) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setShown(false)
      return
    }

    const el = ref.current
    if (!el) return

    const scrollRoot =
      el.closest('.invitation-scroll') ||
      el.closest('.phone-shell') ||
      null

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      {
        root: scrollRoot,
        threshold: 0.08,
        rootMargin: '40px 0px 40px 0px',
      },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [enabled])

  return (
    <Tag
      ref={ref}
      className={`reveal${shown ? ' is-shown' : ''}${className ? ` ${className}` : ''}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
