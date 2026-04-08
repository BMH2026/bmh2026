'use client';

import { useState, useEffect } from 'react';
import { StatusModal } from './StatusModal';

interface WeatherPayload {
  temp: number | null;
  condition: string;
  waveLabel: string;
  waveHeight: string;
  windSpeed: string;
  error?: boolean;
}

/** iOS Weather Widget style — no card/pill, just layered text on hero.
 *  Taps to open full StatusModal.
 */
export function HomeStatusBar() {
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [vessels, setVessels] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wRes, vRes] = await Promise.allSettled([
          fetch('/api/v1/weather'),
          fetch('/api/v1/vessels'),
        ]);
        if (wRes.status === 'fulfilled' && wRes.value.ok) {
          setWeather(await wRes.value.json());
        }
        if (vRes.status === 'fulfilled' && vRes.value.ok) {
          const vData = await vRes.value.json();
          setVessels(vData.vessels || []);
        }
      } catch (e) {
        console.error('HomeStatusBar fetch error:', e);
      }
    };
    fetchData();
  }, []);

  const nextTrip = vessels.find(v => {
    const now = new Date();
    const time = now.getHours() * 100 + now.getMinutes();
    const vTime = parseInt(v.departure.replace(':', ''));
    return vTime > time;
  }) || vessels[0];

  const temp = weather?.temp != null ? `${weather.temp}°` : '—°';
  const condition = weather?.condition || 'Đang tải...';
  const waveInfo = weather?.waveLabel || weather?.waveHeight || '';
  const windInfo = weather?.windSpeed || '';
  const ferryInfo = nextTrip
    ? `Tàu tiếp theo: ${nextTrip.departure} (${nextTrip.operator})`
    : '';

  return (
    <>
      {/* iOS Weather Widget style: transparent, layered text, no card/border */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="text-left w-full group"
        aria-label="Xem thời tiết và thông tin biển"
      >
        {/* Row 1: Big temperature + condition */}
        <div className="flex items-baseline gap-3">
          <span
            className="font-sans font-thin text-[clamp(2.6rem,7vw,4.5rem)] text-white leading-none"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
          >
            {temp}
          </span>
          <div className="flex flex-col">
            <span
              className="text-[clamp(0.85rem,2.5vw,1.1rem)] font-medium text-white/95 leading-tight"
              style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}
            >
              {condition}
            </span>
            {(waveInfo || windInfo) && (
              <span
                className="text-[clamp(0.7rem,1.8vw,0.85rem)] text-white/65 font-normal mt-0.5"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
              >
                {[waveInfo, windInfo].filter(Boolean).join(' · ')}
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Ferry info — subtle, smaller */}
        {ferryInfo && (
          <p
            className="text-[clamp(0.65rem,1.6vw,0.8rem)] text-white/50 mt-1 font-normal group-hover:text-white/70 transition-colors"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
          >
            {ferryInfo}
          </p>
        )}
      </button>

      <StatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        weather={weather as any}
        vessels={vessels}
      />
    </>
  );
}
