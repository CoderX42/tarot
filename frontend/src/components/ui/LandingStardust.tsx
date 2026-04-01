import { useEffect, useRef } from 'react'

/** 参考图 9796：沿对角线密集金色星尘，交汇于中部 */
export function LandingStardust() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    type P = { u: number; v: number; s: number; sp: number; a: number }
    const bands: P[] = []
    const n = 420
    for (let i = 0; i < n; i++) {
      const along = Math.random()
      const spread = (Math.random() - 0.5) * 0.55
      bands.push({
        u: along,
        v: spread,
        s: Math.random() * 2.2 + 0.3,
        sp: 0.15 + Math.random() * 0.5,
        a: 0.12 + Math.random() * 0.55,
      })
    }

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

    const loop = (now: number) => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      const cx = w * 0.5
      const cy = h * 0.42
      const len = Math.hypot(w, h) * 0.72
      const t = now * 0.00035

      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'

      for (let arm = 0; arm < 2; arm++) {
        const base = arm === 0 ? Math.PI * 0.25 : -Math.PI * 0.25
        for (let i = arm; i < bands.length; i += 2) {
          const p = bands[i]!
          p.u += p.sp * 0.0004
          if (p.u > 1.15) p.u = -0.15
          const shake = Math.sin(t + i * 0.07) * 0.012
          const dist = (p.u - 0.5) * len
          const off = p.v * len * 0.18 + shake
          const x = cx + Math.cos(base) * dist - Math.sin(base) * off
          const y = cy + Math.sin(base) * dist + Math.cos(base) * off
          const pulse = 0.65 + Math.sin(t * 2 + i) * 0.35
          const grd = ctx.createRadialGradient(x, y, 0, x, y, p.s * 4)
          grd.addColorStop(0, `rgba(255,248,220,${p.a * pulse})`)
          grd.addColorStop(0.35, `rgba(255,215,0,${p.a * 0.45 * pulse})`)
          grd.addColorStop(1, 'rgba(255,200,80,0)')
          ctx.fillStyle = grd
          ctx.beginPath()
          ctx.arc(x, y, p.s * 3.5, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.globalCompositeOperation = 'source-over'
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={ref} className="landing__stardust-canvas" aria-hidden />
}
