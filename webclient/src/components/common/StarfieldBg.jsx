import React, { useRef, useEffect } from 'react'

export default function StarfieldBg() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.3 + 0.05,
      opacity: Math.random(),
      twinkleSpeed: Math.random() * 0.02 + 0.005,
    }))

    let animationId
    function draw() {
      ctx.clearRect(0, 0, width, height)
      stars.forEach((star) => {
        star.opacity += star.twinkleSpeed
        if (star.opacity > 1 || star.opacity < 0.1) star.twinkleSpeed *= -1

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(123, 47, 255, ${star.opacity * 0.6})`
        ctx.fill()

        // Glow
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r * 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 212, 255, ${star.opacity * 0.1})`
        ctx.fill()

        star.y -= star.speed
        if (star.y < -5) {
          star.y = height + 5
          star.x = Math.random() * width
        }
      })
      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
