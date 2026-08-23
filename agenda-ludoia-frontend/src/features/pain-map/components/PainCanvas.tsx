import React, { useRef } from 'react';
import type { PainPoint } from '../types/painmap.types';

interface PainCanvasProps {
  selectedPoints: PainPoint[];
  activeRegionId: string | null;
  onCanvasClick: (coords: { x: number; y: number }) => void;
  onSelectPoint: (regionId: string) => void;
  onRemovePoint: (regionId: string) => void;
}

export function PainCanvas({
  selectedPoints,
  activeRegionId,
  onCanvasClick,
  onSelectPoint,
  onRemovePoint,
}: PainCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Si se hace clic directamente en un pin existente, no genera un punto nuevo
    if ((e.target as HTMLElement).closest('.map-pin-marker')) {
      return;
    }

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    // Calcular coordenadas normalizadas (0.0 a 1.0)
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    onCanvasClick({ x: Number(x.toFixed(4)), y: Number(y.toFixed(4)) });
  };

  // Determinar la clase de color según la escala EVA
  const getEvaColorClass = (score: number) => {
    if (score >= 7) return 'bg-pain-high shadow-pain-high/50 text-white';
    if (score >= 4) return 'bg-pain-mid shadow-pain-mid/50 text-on-surface';
    return 'bg-pain-low shadow-pain-low/50 text-white';
  };

  return (
    <div className="relative w-full max-w-[420px] mx-auto aspect-[3/4] flex items-center justify-center">
      {/* Contenedor del Mapa Anatómico con Captura de Coordenadas */}
      <div
        id="anatomical-map"
        ref={containerRef}
        onClick={handleContainerClick}
        className="relative w-full h-full bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl border border-outline-variant/30 shadow-xl overflow-hidden cursor-crosshair select-none flex items-center justify-center group"
      >
        {/* Grilla Guía Visual sutil */}
        <div className="absolute inset-0 bg-[radial-gradient(#004870_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>

        {/* Silueta Anatómica Vectorial (SVG SVG Human Silhouette) */}
        <svg
          viewBox="0 0 200 350"
          className="w-4/5 h-4/5 text-outline-variant/40 fill-current opacity-80 transition-all duration-300 group-hover:scale-[1.01] pointer-events-none"
        >
          {/* Cabeza y Cuello */}
          <circle cx="100" cy="35" r="18" />
          <path d="M92 53 h16 v15 h-16 z" />

          {/* Torso y Cadera */}
          <path d="M60 68 c0 0 20-5 40-5 s40 5 40 5 l-10 80 h-60 z" />
          <path d="M70 148 h60 l-5 35 h-50 z" />

          {/* Brazos */}
          <path d="M55 70 l-18 60 c-2 8 -5 15 -8 25 l10 3 -5 20 -8-2 -2-25 10-25 13-56 z" />
          <path d="M145 70 l18 60 c2 8 5 15 8 25 l-10 3 5 20 8-2 2-25 -10-25 -13-56 z" />

          {/* Piernas */}
          <path d="M72 183 l-8 80 l-4 60 h14 l6-55 l5-85 z" />
          <path d="M128 183 l8 80 l4 60 h-14 l-6-55 l-5-85 z" />
        </svg>

        {/* Marcadores Dinámicos (.map-pin) según el Estado */}
        {selectedPoints.map((point) => {
          const leftPercent = `${point.coordinates.x * 100}%`;
          const topPercent = `${point.coordinates.y * 100}%`;
          const isActive = point.regionId === activeRegionId;
          const colorClass = getEvaColorClass(point.painScoreEVA);

          return (
            <div
              key={point.regionId}
              style={{ left: leftPercent, top: topPercent }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPoint(point.regionId);
              }}
              className={`map-pin map-pin-marker absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group/pin transition-all duration-200 ${
                isActive ? 'scale-125 z-30' : 'hover:scale-110'
              }`}
            >
              {/* Indicador del Punto */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shadow-lg border-2 border-white transition-all ${colorClass} ${
                  isActive ? 'ring-4 ring-primary/30 animate-pulse' : ''
                }`}
              >
                {point.painScoreEVA}
              </div>

              {/* Icono de Trigger Point */}
              {point.triggerPoint && (
                <span className="material-symbols-outlined absolute -top-2 -right-2 text-[14px] text-amber-400 bg-black/80 rounded-full p-0.5 shadow-md">
                  bolt
                </span>
              )}

              {/* Popup Tooltip en Hover / Active */}
              <div
                className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-on-surface text-surface text-[10px] whitespace-nowrap shadow-xl border border-outline-variant/30 flex items-center gap-1.5 transition-all ${
                  isActive ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none group-hover/pin:opacity-100 group-hover/pin:scale-100'
                }`}
              >
                <span className="font-semibold">{point.regionName}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePoint(point.regionId);
                  }}
                  className="hover:text-error text-xs ml-1"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
