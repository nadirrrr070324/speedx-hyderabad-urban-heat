import { useEffect, useRef } from 'react';
import type { CloudState } from '../lib/types';

// Canvas cloud simulation driven by the selected atmospheric state.
// Density <- cover, speed <- windDrift, jitter <- turbulence, darkness <- id.
// Values lerp smoothly toward targets so state changes glide instead of jump.

interface Puff { x: number; y: number; r: number; speed: number; layer: number; wobble: number; }
interface Drop { x: number; y: number; len: number; speed: number; }

const MAX_PUFFS = 34;
const MAX_DROPS = 140;

export default function CloudSky({ cloud, className = '' }: { cloud: CloudState; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(cloud);
  const curRef = useRef({ cover: cloud.cover, wind: cloud.windDrift, turb: cloud.turbulence, dark: 0 });

  useEffect(() => { targetRef.current = cloud; }, [cloud]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    let W = 0, H = 0;

    const resize = () => {
      const r = wrapRef.current!.getBoundingClientRect();
      W = Math.max(200, r.width); H = Math.max(120, r.height);
      canvas.width = W; canvas.height = H;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapRef.current!);

    const rnd = (seed: number) => { const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    const puffs: Puff[] = Array.from({ length: MAX_PUFFS }, (_, i) => ({
      x: rnd(i + 1) * 1200, y: rnd(i + 50) * 400, r: 26 + rnd(i + 90) * 62,
      speed: 0.6 + rnd(i + 130) * 0.9, layer: rnd(i + 170), wobble: rnd(i + 210) * Math.PI * 2,
    }));
    const drops: Drop[] = Array.from({ length: MAX_DROPS }, (_, i) => ({
      x: rnd(i + 300) * 1200, y: rnd(i + 400) * 600, len: 8 + rnd(i + 450) * 12, speed: 6 + rnd(i + 480) * 6,
    }));

    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(50, now - last); last = now;
      const t = targetRef.current;
      const c = curRef.current;
      const k = 1 - Math.pow(0.0015, dt / 1000); // smooth lerp factor
      c.cover += (t.cover - c.cover) * k;
      c.wind += (t.windDrift - c.wind) * k;
      c.turb += (t.turbulence - c.turb) * k;
      const darkTarget = t.id === 'monsoon' ? 0.55 : t.id === 'haze' ? 0.32 : t.id === 'cirrus' ? 0.12 : 0.03;
      c.dark += (darkTarget - c.dark) * k;

      // sky wash
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, `rgba(221,234,245,${0.85 - c.dark * 0.5})`);
      sky.addColorStop(1, `rgba(244,235,221,${0.55 - c.dark * 0.35})`);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // sun glow — fades as cover/darkness rise
      const sunAlpha = Math.max(0, 0.5 * (1 - c.cover / 100) * (1 - c.dark));
      if (sunAlpha > 0.02) {
        const sx = W * 0.78, sy = H * 0.22;
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, W * 0.42);
        g.addColorStop(0, `rgba(255,190,80,${sunAlpha})`);
        g.addColorStop(1, 'rgba(255,190,80,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, W * 0.42, 0, Math.PI * 2); ctx.fill();
      }

      const visible = Math.max(2, Math.round((c.cover / 100) * MAX_PUFFS));
      const windPx = (c.wind / 30) * 1.6 + 0.25; // px per frame scaled
      const turbPx = (c.turb / 100) * 2.2;

      for (let i = 0; i < visible; i++) {
        const p = puffs[i];
        p.x += windPx * p.speed * (0.5 + p.layer);
        p.wobble += dt * 0.001 * (0.5 + c.turb / 60);
        const px = ((p.x % (W + 240)) + (W + 240)) % (W + 240) - 120;
        const py = (p.y % H) + Math.sin(p.wobble) * turbPx + p.layer * 14;
        const alpha = (0.16 + p.layer * 0.22) * (0.45 + c.cover / 130);
        // cluster of ellipses per puff
        for (let j = 0; j < 4; j++) {
          const ox = (rnd(i * 10 + j) - 0.5) * p.r * 1.4;
          const oy = (rnd(i * 20 + j) - 0.5) * p.r * 0.45 + Math.sin(p.wobble + j) * turbPx * 0.4;
          const rr = p.r * (0.55 + rnd(i * 30 + j) * 0.5);
          const g = ctx.createRadialGradient(px + ox, py + oy, 0, px + ox, py + oy, rr);
          const base = c.dark > 0.4 ? '110,125,155' : c.dark > 0.2 ? '205,190,170' : '255,255,255';
          g.addColorStop(0, `rgba(${base},${alpha})`);
          g.addColorStop(1, `rgba(${base},0)`);
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.ellipse(px + ox, py + oy, rr, rr * 0.55, 0, 0, Math.PI * 2); ctx.fill();
        }
      }

      // rain for monsoon
      if (t.id === 'monsoon' && c.dark > 0.3) {
        ctx.strokeStyle = 'rgba(180,205,230,0.55)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const n = Math.round((c.dark - 0.3) * 400);
        for (let i = 0; i < n; i++) {
          const d = drops[i];
          d.y += d.speed * (dt / 16.7); d.x += windPx * 0.6;
          if (d.y > H) { d.y = -20; d.x = rnd(i + now * 0.001) * W; }
          const dx = ((d.x % (W + 40)) + (W + 40)) % (W + 40) - 20;
          ctx.moveTo(dx, d.y); ctx.lineTo(dx - 2, d.y + d.len);
        }
        ctx.stroke();
        // occasional flash
        if (Math.sin(now * 0.004) > 0.985) { ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(0, 0, W, H); }
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div ref={wrapRef} className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
