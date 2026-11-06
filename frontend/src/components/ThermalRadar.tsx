import { useEffect, useRef } from 'react';
import { Maximize2, Pause, Play } from 'lucide-react';
import type { Zone } from '../lib/types';

// Canvas-based synthetic thermal radar (DEMO): deterministic pseudo-city grid + heat blobs.
// Not satellite imagery. Layers: built-up intensity, hotspot glow, vegetation cool spots.
// Clouds drift across the radar according to the active weather state (cover/wind/turbulence).

import type { CloudState } from '../lib/types';

export default function ThermalRadar({ zone, playing: playingProp, cloud, live }: { zone: Zone; playing?: boolean; cloud?: CloudState; live?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ playing: playingProp ?? true, angle: 0, zoom: 1, pan: { x: 0, y: 0 }, layers: { heat: true, veg: true, buildings: true } });
  const cloudRef = useRef<CloudState | undefined>(cloud);
  cloudRef.current = cloud;
  const curCloud = useRef({ cover: cloud?.cover ?? 8, wind: cloud?.windDrift ?? 6, turb: cloud?.turbulence ?? 22, drift: 0, rain: 0 });

  useEffect(() => { stateRef.current.playing = playingProp ?? true; }, [playingProp]);

  useEffect(() => {
    const canvas = canvasRef.current!; const ctx = canvas.getContext('2d')!;
    let raf = 0; let last = performance.now();
    const resize = () => { const r = wrapRef.current!.getBoundingClientRect(); canvas.width = Math.max(320, r.width); canvas.height = 300; };
    resize(); const ro = new ResizeObserver(resize); ro.observe(wrapRef.current!);

    const draw = (now: number) => {
      const dt = Math.min(50, now - last); last = now;
      const s = stateRef.current;
      if (s.playing) s.angle += dt * 0.00012;
      const W = canvas.width, H = canvas.height;
      ctx.fillStyle = '#080E24'; ctx.fillRect(0, 0, W, H);

      // --- cloud drift (lerped toward active weather state) ---
      const tc = cloudRef.current;
      const cc = curCloud.current;
      if (tc) {
        const k = 1 - Math.pow(0.002, dt / 1000);
        cc.cover += (tc.cover - cc.cover) * k;
        cc.wind += (tc.windDrift - cc.wind) * k;
        cc.turb += (tc.turbulence - cc.turb) * k;
      }
      cc.drift += (cc.wind / 30) * 0.9 * (dt / 16.7);
      const rainTarget = tc?.id === 'monsoon' ? 1 : 0;
      cc.rain += (rainTarget - cc.rain) * 0.02 * (dt / 16.7);
      const moonsoon = cc.rain > 0.4;
      if (moonsoon) { ctx.fillStyle = `rgba(20,28,55,${cc.rain * 0.45})`; ctx.fillRect(0, 0, W, H); }

      ctx.save();
      ctx.translate(W / 2 + s.pan.x, H / 2 + s.pan.y);
      ctx.scale(s.zoom, s.zoom);
      ctx.rotate(Math.sin(s.angle) * 0.08);

      const seed = zone.id.length * 7 + zone.env.lst;
      const rnd = (i: number) => { const x = Math.sin(seed * 31 + i * 97.13) * 43758.5453; return x - Math.floor(x); };

      // grid blocks
      const cell = 26;
      const cols = Math.ceil(W / cell) + 4, rows = Math.ceil(H / cell) + 4;
      for (let ix = 0; ix < cols; ix++) for (let iy = 0; iy < rows; iy++) {
        const i = ix * 100 + iy;
        const built = rnd(i);
        const veg = rnd(i + 500);
        const x = ix * cell - W / 2, y = iy * cell - H / 2;
        if (s.layers.veg && veg > 0.82) { ctx.fillStyle = 'rgba(52,211,153,0.35)'; }
        else if (s.layers.buildings && built > 0.35) { const t = built; ctx.fillStyle = `rgba(${40 + t * 60},${30 + t * 40},${60 + t * 60},0.9)`; }
        else { ctx.fillStyle = 'rgba(17,24,39,0.9)'; }
        ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
      }
      // heat blobs (hotspots)
      if (s.layers.heat) {
        const blobs = 5;
        for (let b = 0; b < blobs; b++) {
          const bx = (rnd(b + 900) - 0.5) * W * 0.8, by = (rnd(b + 1200) - 0.5) * H * 0.8;
          const br = (60 + rnd(b + 1500) * 110) * (zone.env.riskBase / 70);
          const g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
          g.addColorStop(0, 'rgba(239,35,60,0.85)'); g.addColorStop(0.45, 'rgba(249,115,22,0.55)'); g.addColorStop(1, 'rgba(249,115,22,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
        }
      }
      // radar sweep
      const sweep = (now * 0.0004) % (Math.PI * 2);
      const g2 = ctx.createConicGradient ? ctx.createConicGradient(sweep, 0, 0) : null;
      if (g2) { g2.addColorStop(0, 'rgba(255,255,255,0.10)'); g2.addColorStop(0.12, 'rgba(255,255,255,0)'); g2.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(0, 0, Math.max(W, H), 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();

      // --- drifting clouds over the radar (weather-driven) ---
      const nClouds = Math.max(0, Math.round((cc.cover / 100) * 10));
      for (let ci = 0; ci < nClouds; ci++) {
        const cseed = ci * 137.5 + 11;
        const crnd = (n: number) => { const x = Math.sin(cseed * 31 + n * 97.13) * 43758.5453; return x - Math.floor(x); };
        const cx = (((crnd(1) * (W + 300) + cc.drift * (30 + crnd(2) * 40)) % (W + 300)) + (W + 300)) % (W + 300) - 150;
        const cy = (crnd(3) * H * 0.7 + Math.sin(now * 0.0006 + ci) * (cc.turb / 100) * 14);
        const cr = 34 + crnd(4) * 60;
        const alpha = (0.10 + crnd(5) * 0.16) * (0.5 + cc.cover / 130);
        for (let j = 0; j < 4; j++) {
          const ox = (crnd(j + 10) - 0.5) * cr * 1.5, oy = (crnd(j + 20) - 0.5) * cr * 0.4;
          const rr = cr * (0.5 + crnd(j + 30) * 0.55);
          const g = ctx.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, rr);
          g.addColorStop(0, `rgba(210,220,240,${alpha})`); g.addColorStop(1, 'rgba(210,220,240,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx + ox, cy + oy, rr, rr * 0.5, 0, 0, Math.PI * 2); ctx.fill();
        }
      }
      // rain streaks during monsoon
      if (cc.rain > 0.15) {
        ctx.strokeStyle = `rgba(170,200,235,${cc.rain * 0.5})`; ctx.lineWidth = 1;
        ctx.beginPath();
        const nR = Math.round(cc.rain * 90);
        for (let ri = 0; ri < nR; ri++) {
          const rx = ((ri * 173 + cc.drift * 26) % (W + 30)) - 15;
          const ry = ((ri * 291 + now * 0.35) % (H + 30)) - 15;
          ctx.moveTo(rx, ry); ctx.lineTo(rx - 2, ry + 12);
        }
        ctx.stroke();
      }

      // HUD
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 10px Inter'; ctx.fillText(`GRID ${zone.lat.toFixed(3)}, ${zone.lng.toFixed(3)}`, 12, 20);
      ctx.fillStyle = 'rgba(255,122,24,0.95)'; ctx.font = 'bold 11px Inter'; ctx.fillText(`LST PROXY ${zone.env.lst.toFixed(1)}°C`, 12, 36);
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '10px Inter'; ctx.fillText('SYNTHETIC THERMAL MODEL — NOT SATELLITE IMAGERY', 12, H - 12);
      if (tc) { ctx.fillStyle = 'rgba(170,205,255,0.7)'; ctx.fillText(`${tc.name.toUpperCase()} · COVER ${Math.round(cc.cover)}% · WIND ${Math.round(cc.wind)} KM/H`, 12, H - 26); }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [zone]);

  const toggle = (k: 'heat' | 'veg' | 'buildings') => { stateRef.current.layers[k] = !stateRef.current.layers[k]; };

  return (
    <div>
      <div ref={wrapRef} className="relative overflow-hidden rounded-xl border border-navy bg-navy"
        onWheel={e => { stateRef.current.zoom = Math.min(2.2, Math.max(0.6, stateRef.current.zoom - Math.sign(e.deltaY) * 0.1)); }}
        onPointerDown={e => { const el = e.currentTarget; el.setPointerCapture(e.pointerId); const sx = e.clientX, sy = e.clientY, sp = { ...stateRef.current.pan }; const move = (ev: PointerEvent) => { stateRef.current.pan = { x: sp.x + (ev.clientX - sx), y: sp.y + (ev.clientY - sy) }; }; const up = () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); }; el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); }}>
        <canvas ref={canvasRef} className="block w-full cursor-grab active:cursor-grabbing" aria-label={`Synthetic thermal radar for ${zone.name}`} />
        <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-widest ${live ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-navy'}`}>{live ? 'LIVE SKY · DEMO THERMAL' : 'DEMO'}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button onClick={() => { stateRef.current.playing = !stateRef.current.playing; }} className="inline-flex items-center gap-1 rounded-full bg-navy px-3 py-1.5 text-[11px] font-bold text-white">{stateRef.current.playing ? <Pause size={12} /> : <Play size={12} />} {stateRef.current.playing ? 'Pause' : 'Play'}</button>
        <button onClick={() => { stateRef.current.zoom = 1; stateRef.current.pan = { x: 0, y: 0 }; }} className="rounded-full bg-mist px-3 py-1.5 text-[11px] font-bold text-navy">Reset view</button>
        <button onClick={() => wrapRef.current?.requestFullscreen?.()} className="inline-flex items-center gap-1 rounded-full bg-mist px-3 py-1.5 text-[11px] font-bold text-navy"><Maximize2 size={12} /> Full-screen</button>
        <span className="mx-1 h-4 w-px bg-slate-300" />
        {(['heat', 'veg', 'buildings'] as const).map(k => (
          <button key={k} onClick={() => toggle(k)} aria-pressed={stateRef.current.layers[k]} className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize border ${stateRef.current.layers[k] ? 'border-heat bg-orange-50 text-heat' : 'border-slate-300 text-slate-500'}`}>{k} layer</button>
        ))}
        <span className="ml-auto text-[10px] text-slate-400">Drag to pan · Scroll to zoom</span>
      </div>
    </div>
  );
}
