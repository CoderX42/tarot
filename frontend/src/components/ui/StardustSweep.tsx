import { useEffect, useRef } from 'react'

/** 斜向金尘扫过（2D Canvas，与 3D 解耦） */
export function StardustSweep() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const particles: { x: number; y: number; s: number; v: number; a: number }[] = []
    for (let i = 0; i < 140; i++) {
      particles.push({
        x: Math.random() * canvas.clientWidth,
        y: Math.random() * canvas.clientHeight,
        s: 0.4 + Math.random() * 2.4,
        v: 0.35 + Math.random() * 1.35,
        a: 0.18 + Math.random() * 0.55,
      })
    }

    let t = 0
    const loop = () => {
      t += 0.016
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)
      ctx.save()
      ctx.translate(w * 0.5, h * 0.42)
      ctx.rotate(-0.42)
      const beam = ctx.createLinearGradient(-w, 0, w, 0)
      beam.addColorStop(0, 'rgba(255, 240, 200, 0)')
      beam.addColorStop(0.45, `rgba(255, 228, 150, ${0.14 + Math.sin(t * 1.8) * 0.06})`)
      beam.addColorStop(0.55, `rgba(255, 215, 90, ${0.22 + Math.sin(t * 2) * 0.08})`)
      beam.addColorStop(1, 'rgba(255, 200, 80, 0)')
      ctx.fillStyle = beam
      ctx.fillRect(-w * 1.2, -h * 0.08, w * 2.4, h * 0.16)
      ctx.restore()

      ctx.save()
      ctx.translate(w * 0.2, h * 0.3)
      ctx.rotate(-0.35)
      ctx.globalCompositeOperation = 'lighter'
      for (const p of particles) {
        p.x += p.v * 40 * 0.016
        p.y -= p.v * 12 * 0.016
        if (p.x > w + 200) p.x = -100
        if (p.y < -100) p.y = h + 50
        ctx.fillStyle = `rgba(255, 223, 140, ${p.a})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={ref} className="stardust-sweep" aria-hidden />
}
