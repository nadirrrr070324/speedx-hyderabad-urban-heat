import { useEffect, useMemo, useState } from 'react';
import Header, { type View } from './components/Header';
import Overview from './components/Overview';
import PersonalRisk from './components/PersonalRisk';
import { ThermalGIS, VulnerabilityModel, CoolShelters, Municipality, Employer, ForecastDetail } from './components/Modules';
import SevenDayOutlook from './components/SevenDayOutlook';
import LocationSwitch from './components/LocationSwitch';
import LocationQuickBtn from './components/LocationQuickBtn';
import AgeGuidancePanel from './components/AgeGuidancePanel';
import { ZONES, demoForecast } from './lib/data';
import { assessRisk } from './lib/risk';
import { CLOUD_STATES, type CloudState } from './lib/cloud';
import { useLiveWeather } from './lib/useLiveWeather';
import { detectPermission, type GeoFix } from './lib/location';
import type { Profile, Zone } from './lib/types';

const DEFAULT_PROFILE: Profile = {
  ageRange: '30-45', occupation: 'Delivery / Gig worker', outdoorHours: 8, activity: 'high',
  shadeAccess: false, zoneId: 'charminar', conditions: [], hydration: 'regular', timeOfDay: 'midday',
};

export default function App() {
  const [view, setView] = useState<View>('overview');
  const [zoneId, setZoneId] = useState('charminar');
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [cloud, setCloud] = useState<CloudState>(CLOUD_STATES[0]);
  const [autoCloud, setAutoCloud] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const [custom, setCustom] = useState<Zone | null>(null);
  const [fix, setFix] = useState<GeoFix | null>(null);
  const [watch, setWatch] = useState(false);
  const [geoState, setGeoState] = useState<string>('prompt');

  useEffect(() => { detectPermission().then(setGeoState); }, []);

  const allZones = useMemo(() => (custom ? [custom, ...ZONES] : ZONES), [custom]);
  const zone = allZones.find(z => z.id === zoneId) ?? allZones[0];
  const { liveZone, weather, loading, forecast: liveForecast, lastUpdated, offline } = useLiveWeather(zone, autoCloud, setCloud, refreshTick);
  const effZone = liveZone ?? zone;
  const risk = useMemo(() => assessRisk(profile, effZone), [profile, effZone]);
  const forecast = useMemo(() => (liveForecast.length ? liveForecast : demoForecast(zone)), [liveForecast, zone]);

  useEffect(() => { setProfile(p => ({ ...p, zoneId })); }, [zoneId]);

const handleAreaSelect = (z: Zone) => { setCustom(z); setZoneId(z.id); };
  const advisory = `${effZone.name}: heat index ${effZone.env.heatIndex.toFixed(1)}°C — ${risk.tier} personal risk. Avoid 11:00–16:00 outdoor work.`;

  return (
    <div className="min-h-screen">
      <Header view={view} setView={setView} advisory={advisory}
        locationSlot={<LocationQuickBtn onFix={setFix} custom={custom} onCustom={setCustom} onSelect={setZoneId} geoState={geoState} onGeoState={setGeoState} zones={ZONES} />} />
      <main>
        {offline && <div className="mx-auto max-w-[1440px] px-3 pt-3 sm:px-5"><div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2 text-xs font-semibold text-amber-800">You are offline — showing cached weather/forecast for {effZone.name}. Search and live data will resume when connected.</div></div>}
        <div className="mx-auto max-w-[1440px] px-3 pt-3 sm:px-5">
          <LocationSwitch zones={ZONES} active={effZone} onSelect={setZoneId} custom={custom} onCustom={setCustom}
            fix={fix} watch={watch} onWatch={setWatch} onFix={setFix} geoState={geoState} onGeoState={setGeoState} />
        </div>
        {view === 'overview' && (
          <>
            <Overview zone={effZone} risk={risk} profile={profile} cloud={cloud} setCloud={c => { setAutoCloud(false); setCloud(c); }}
              onCheckRisk={() => setView('vulnerability')} onExplore3D={() => setView('gis')} setZone={setZoneId} zones={allZones}
              onAreaSelect={handleAreaSelect}
              liveWeather={weather} liveForecast={forecast} liveLoading={loading} autoCloud={autoCloud} setAutoCloud={setAutoCloud}
              onRefresh={() => setRefreshTick(t => t + 1)} liveUpdated={lastUpdated} refreshTick={refreshTick} />
            <SevenDayOutlook forecast={forecast} onDetail={() => setView('forecast')} />
          </>
        )}
        {view === 'vulnerability' && (
          <>
          <div className="mx-auto max-w-[1440px] px-3 py-4 sm:px-5"><AgeGuidancePanel profile={profile} /></div>
          <PersonalRisk profile={profile} setProfile={setProfile} zone={effZone} zones={allZones} />
          <VulnerabilityModel profile={profile} zone={effZone} />
          </>
        )}
        {view === 'gis' && <ThermalGIS zones={allZones} zone={effZone} setZone={setZoneId} onAreaSelect={handleAreaSelect} />}
        {view === 'shelters' && <CoolShelters zone={effZone} />}
        {view === 'outlook' && <ForecastDetail zone={effZone} liveForecast={liveForecast} />}
        {view === 'forecast' && <ForecastDetail zone={effZone} liveForecast={liveForecast} />}
        {view === 'municipality' && <Municipality zones={ZONES} />}
        {view === 'employer' && <Employer profile={profile} zone={effZone} />}
      </main>
      <footer className="border-t border-slate-200/70 px-5 py-4 text-center text-[10px] leading-relaxed text-slate-500">
        <p><b className="text-navy">SPEEDX — Hyderabad Urban Heat Observatory</b> · Next Generation Climate Intelligence · Hackathon demo build</p>
        <p>All environmental values labelled DEMO are synthetic illustrations, not real-time observations. Heat-risk scores are a transparent demo model, not clinical advice. In emergency call <b>108</b>.</p>
      </footer>
    </div>
  );
}
