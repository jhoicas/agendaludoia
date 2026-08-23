import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export interface EvolutionDataPoint {
  date: string;
  eva: number;       // Dolor 0-10
  rom: number;       // Rango de Movimiento °
  daniels: number;   // Fuerza Muscular 0-5
}

interface EvolutionChartProps {
  data?: EvolutionDataPoint[];
}

const DEFAULT_SERIES_DATA: EvolutionDataPoint[] = [
  { date: 'Sesión 1 (24 Jul)', eva: 9, rom: 45, daniels: 2.5 },
  { date: 'Sesión 2 (31 Jul)', eva: 7, rom: 60, daniels: 3.0 },
  { date: 'Sesión 3 (07 Ago)', eva: 5, rom: 75, daniels: 3.5 },
  { date: 'Sesión 4 (14 Ago)', eva: 3, rom: 95, daniels: 4.0 },
  { date: 'Sesión 5 (21 Ago)', eva: 1, rom: 120, daniels: 4.5 },
];

export function EvolutionChart({ data = DEFAULT_SERIES_DATA }: EvolutionChartProps) {
  const [metricMode, setMetricMode] = useState<'pain_vs_rom' | 'pain_vs_daniels'>('pain_vs_rom');

  return (
    <div className="bg-surface-container-low/70 border border-outline-variant/30 rounded-2xl p-4 clinical-shadow space-y-4">
      {/* Header del Gráfico con Dropdown de Vistas */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
        <div>
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">monitoring</span>
            Evolución Clínica Longitudinal
          </h3>
          <p className="text-[10px] text-on-surface-variant">Tendencia Temporal EHR</p>
        </div>

        <select
          value={metricMode}
          onChange={(e) => setMetricMode(e.target.value as any)}
          className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-2.5 py-1 text-xs text-on-surface font-semibold focus:outline-none focus:border-primary cursor-pointer"
        >
          <option value="pain_vs_rom">Dolor (EVA) vs Movilidad (ROM °)</option>
          <option value="pain_vs_daniels">Dolor (EVA) vs Fuerza (Daniels 0-5)</option>
        </select>
      </div>

      {/* Gráfico Recharts Reorganizable con Fondo Transparente Glassmorphism */}
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#c0c7d0" strokeOpacity={0.2} />
            <XAxis dataKey="date" stroke="#717880" fontSize={10} tickLine={false} />
            
            {/* Eje Y Izquierdo: Dolor EVA (0-10) */}
            <YAxis yAxisId="left" domain={[0, 10]} stroke="#ef4444" fontSize={10} tickLine={false} />

            {/* Eje Y Derecho: ROM (°) o Fuerza (Daniels) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={metricMode === 'pain_vs_rom' ? [0, 140] : [0, 5]}
              stroke={metricMode === 'pain_vs_rom' ? '#006194' : '#006c49'}
              fontSize={10}
              tickLine={false}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(247, 249, 251, 0.95)',
                borderColor: '#c0c7d0',
                borderRadius: '12px',
                fontSize: '11px',
                color: '#191c1e',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />

            {/* Línea de Dolor EVA (Roja) */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="eva"
              name="Dolor EVA (0-10)"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ r: 4, fill: '#ef4444' }}
              activeDot={{ r: 6 }}
            />

            {/* Línea de Mejora Biomecánica (ROM o Fuerza) */}
            {metricMode === 'pain_vs_rom' ? (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="rom"
                name="Rango Movilidad (ROM °)"
                stroke="#006194"
                strokeWidth={3}
                dot={{ r: 4, fill: '#006194' }}
                activeDot={{ r: 6 }}
              />
            ) : (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="daniels"
                name="Fuerza (Daniels 0-5)"
                stroke="#006c49"
                strokeWidth={3}
                dot={{ r: 4, fill: '#006c49' }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
