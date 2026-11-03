import { useEffect, useRef, useState } from 'react'

/**
 * Hiện khi vào khung cuộn; ẩn lại khi ra ngoài để cuộn ngược còn chạy hiệu ứng.
 * variant: 'up' | 'left' | 'right' | 'fade'
 */
export default function Reveal({
  children,
  className = '',
  delay = 0,
  enabled = true,
  variant = 'up',
  as: Tag = 'div',
}) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setShown(false)
      return undefined
    }

    const el = ref.current
    if (!el) return undefined

    const scrollRoot =
      el.closest('.invitation-scroll') ||
      el.closest('.phone-shell') ||
      null

    const io = new IntersectionObserver(
      ([entry]) => {
        setShown(entry.isIntersecting)
      },
      {
        root: scrollRoot,
        threshold: 0.12,
        rootMargin: '0px 0px -4% 0px',
      },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [enabled])

  const variantClass =
    variant === 'left'
      ? ' from-left'
      : variant === 'right'
        ? ' from-right'
        : variant === 'fade'
          ? ' from-fade'
          : ' from-up'

  return (
    <Tag
      ref={ref}
      className={`reveal${variantClass}${shown ? ' is-shown' : ''}${className ? ` ${className}` : ''}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
