import * as THREE from 'three'

const W = 512
const H = 896

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function createCardBackTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, '#1a0f2e')
  g.addColorStop(0.5, '#2d1b4e')
  g.addColorStop(1, '#0f0820')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  const margin = 36
  ctx.strokeStyle = '#d4af37'
  ctx.lineWidth = 10
  roundRect(ctx, margin, margin, W - margin * 2, H - margin * 2, 20)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(255,248,225,0.35)'
  ctx.lineWidth = 3
  roundRect(ctx, margin + 16, margin + 16, W - (margin + 16) * 2, H - (margin + 16) * 2, 14)
  ctx.stroke()

  ctx.fillStyle = 'rgba(255,215,0,0.12)'
  ctx.font = 'bold 120px Cinzel, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('✦', W / 2, H / 2 - 40)
  ctx.font = '32px DM Sans, sans-serif'
  ctx.fillStyle = 'rgba(255,248,225,0.5)'
  ctx.fillText('STELLAR', W / 2, H / 2 + 60)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

export function createCardFrontTexture(
  name: string,
  orientation: string,
  hue: number,
): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!
  const base = `hsl(${Math.round(hue * 360)}, 42%, 18%)`
  ctx.fillStyle = base
  ctx.fillRect(0, 0, W, H)

  const margin = 36
  ctx.strokeStyle = '#e8c547'
  ctx.lineWidth = 8
  roundRect(ctx, margin, margin, W - margin * 2, H - margin * 2, 18)
  ctx.stroke()

  const cx = W / 2
  const cy = H / 2 - 40
  ctx.strokeStyle = 'rgba(255,236,180,0.85)'
  ctx.lineWidth = 2
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(a) * 140, cy + Math.sin(a) * 140)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.arc(cx, cy, 36, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = '#fff8e1'
  ctx.font = 'bold 52px Cinzel, serif'
  ctx.textAlign = 'center'
  ctx.fillText(name, W / 2, H * 0.72)

  ctx.font = '28px DM Sans, sans-serif'
  ctx.fillStyle = 'rgba(255,215,0,0.9)'
  ctx.fillText(orientation, W / 2, H * 0.8)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}
