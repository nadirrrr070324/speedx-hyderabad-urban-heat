import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Zone } from '../lib/types';
import { FACILITIES } from '../lib/data';

// Real geographic map (Leaflet + OSM / Esri tiles) with multiple switchable layers.
// LST / NDVI / humidity / heat layers are DEMO proxies (deterministic blobs per zone),
// NOT satellite rasters — production uses Earth Engine / PostGIS raster tiles.

export type MapLayer = 'terrain' | 'satellite' | 'thermal' | 'lst' | 'ndvi' | 'humidity' | 'zones' | 'shelters';

const HYDERABAD: [number, number] = [17.385, 78.4867];

const TILES: Record<string, { url: string; attr: string }> = {
  terrain: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attr: '© OpenStreetMap contributors' },
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: 'Esri World Imagery' },
};

const BLOB: Record<string, string> = {
  thermal: 'rgba(239,35,60,0.38)',
  lst: 'rgba(249,115,22,0.42)',
  ndvi: 'rgba(52,211,153,0.4)',
  humidity: 'rgba(96,165,250,0.45)',
};

function blobStyle(layer: string, z: Zone): L.CircleOptions {
  const heat = layer === 'thermal' || layer === 'lst';
  const r = (heat ? z.env.riskBase * 38 + 2200 : layer === 'ndvi' ? 3200 + z.env.ndvi * 4200 : 2800 + z.env.humidity * 22);
  return {
    radius: r, color: BLOB[layer], weight: 0, fillColor: BLOB[layer], fillOpacity: heat ? 0.55 : 0.45,
  };
}

export default function ThermalGISMap({ zones, zone, setZone, layer, onLayer }: {
  zones: Zone[]; zone: Zone; setZone: (id: string) => void; layer: MapLayer; onLayer: (l: MapLayer) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const baseRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { zoomControl: true, scrollWheelZoom: true, dragging: true, doubleClickZoom: true, boxZoom: true, keyboard: true }).setView(HYDERABAD, 11);
    mapRef.current = map;
    baseRef.current = L.tileLayer(TILES.terrain.url, { attribution: TILES.terrain.attr, maxZoom: 19 }).addTo(map);
    layerGroupRef.current = L.layerGroup().addTo(map);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Base layer switch
  useEffect(() => {
    const map = mapRef.current; if (!map || !baseRef.current) return;
    const want = layer === 'satellite' ? 'satellite' : 'terrain';
    const cur = (baseRef.current as unknown as { _url?: string })._url ?? '';
    if (!cur.includes(want === 'terrain' ? 'openstreetmap' : 'arcgisonline')) {
      map.removeLayer(baseRef.current);
      baseRef.current = L.tileLayer(TILES[want].url, { attribution: TILES[want].attr, maxZoom: 19 }).addTo(map);
    }
  }, [layer]);

  // Overlay + markers redraw
  useEffect(() => {
    const map = mapRef.current; const g = layerGroupRef.current;
    if (!map || !g) return;
    g.clearLayers();

    const isBlob = ['thermal', 'lst', 'ndvi', 'humidity'].includes(layer);
    if (isBlob) {
      zones.forEach(z => {
        if (layer === 'ndvi' && z.env.ndvi < 0.25) return; // off only for green areas conceptually
        L.circle([z.lat, z.lng], blobStyle(layer, z)).addTo(g)
          .bindPopup(`<b>${z.name}</b><br/>${layer.toUpperCase()} (DEMO proxy): ${layer === 'ndvi' ? z.env.ndvi : layer === 'humidity' ? `${z.env.humidity}%` : `${z.env.lst}°C`}`);
      });
      L.circle([zone.lat, zone.lng], { radius: 900, color: '#ffffff', weight: 2, fill: false }).addTo(g);
    }

    zones.forEach(z => {
      const active = z.id === zone.id;
      const m = L.circleMarker([z.lat, z.lng], {
        radius: active ? 11 : 7, color: '#080E24', weight: 2,
        fillColor: z.env.riskBase >= 80 ? '#EF233C' : z.env.riskBase >= 60 ? '#F97316' : '#F59E0B', fillOpacity: 0.95,
      }).addTo(g);
      m.bindTooltip(`<b>${z.name}</b><br/>${z.ward}<br/>Core ${z.env.coreTemp.toFixed(1)}°C`, { direction: 'top' });
      m.on('click', () => setZone(z.id));
    });

    if (layer === 'shelters') {
      FACILITIES.filter(f => f.zoneId === zone.id).forEach(f => {
        const icon = L.divIcon({ className: '', html: `<span style="display:inline-grid;place-items:center;width:22px;height:22px;border-radius:9999px;background:#10B981;color:#fff;font-size:11px;border:2px solid #080E24">⌂</span>`, iconSize: [22, 22] });
        const z = zones.find(zz => zz.id === f.zoneId)!;
        L.marker([z.lat + (f.distanceKm * 0.004), z.lng + (f.distanceKm * 0.004)], { icon }).addTo(g)
          .bindPopup(`<b>${f.name}</b><br/>${f.type} · ${f.status} · ${f.distanceKm} km<br/><i>DEMO entry — verify with GHMC</i>`);
      });
    }

    // legend
    if (isBlob) {
      const el = document.getElementById('gis-legend');
      if (el) {
        const label = layer === 'thermal' ? 'UHI / heat intensity' : layer === 'lst' ? 'Land surface temp proxy' : layer === 'ndvi' ? 'Vegetation (NDVI)' : 'Humidity';
        el.innerHTML = `<span style="display:inline-block;width:12px;height:12px;border-radius:9999px;background:${BLOB[layer]};margin-right:6px;vertical-align:-2px"></span><b>${label}</b> — DEMO proxy, not satellite raster`;
      }
    }
  }, [layer, zones, zone, setZone]);

// Recenter on demand (button) instead of auto-fly, so users can pan/zoom freely.
  const recenter = () => { mapRef.current?.setView([zone.lat, zone.lng], 12, { animate: true }); };

  const LAYERS: { id: MapLayer; label: string }[] = [
    { id: 'terrain', label: 'OSM Streets' }, { id: 'satellite', label: 'Satellite' },
    { id: 'thermal', label: 'UHI Heat' }, { id: 'lst', label: 'LST Proxy' },
    { id: 'ndvi', label: 'NDVI Veg' }, { id: 'humidity', label: 'Humidity' },
    { id: 'zones', label: 'Zone Markers' }, { id: 'shelters', label: 'Cool Shelters' },
  ];

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Map layers">
        {LAYERS.map(l => (
          <button key={l.id} role="tab" aria-pressed={layer === l.id} onClick={() => onLayer(l.id)}
            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${layer === l.id ? 'border-heat bg-orange-50 text-heat' : 'border-slate-300 text-slate-500 hover:bg-mist'}`}>{l.label}</button>
        ))}
        <button onClick={recenter} className="ml-auto rounded-full border border-navy px-2.5 py-1 text-[10px] font-bold text-navy hover:bg-mist">⌖ Recenter</button>
      </div>
      <div ref={ref} className="h-[380px] w-full overflow-hidden rounded-2xl border border-navy [&_.leaflet-container]:h-full" aria-label="Hyderabad thermal GIS map" />
      <div id="gis-legend" className="mt-2 text-[11px] text-slate-600"><span className="font-bold text-navy">Legend:</span> coloured markers = monitoring zones (colour by risk). Floating blobs = selected layer (DEMO proxy).</div>
    </div>
  );
}
