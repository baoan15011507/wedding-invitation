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

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -6% 0px' },
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
