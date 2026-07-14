import { useEffect, useRef } from 'react'
import { animate, useMotionValue, useTransform } from 'motion/react'

interface AnimatedNumberProps {
  value: number
  className?: string
}

export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (v) => Math.round(v).toLocaleString())

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.8, ease: 'easeOut' })
    return controls.stop
  }, [value, motionValue])

  useEffect(() => {
    return rounded.on('change', (v) => {
      if (ref.current) ref.current.textContent = v
    })
  }, [rounded])

  return (
    <span ref={ref} className={className}>
      0
    </span>
  )
}
