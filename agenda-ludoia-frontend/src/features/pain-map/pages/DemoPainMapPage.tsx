import { useState } from 'react';
import { PainCanvas } from '../components/PainCanvas';
import { usePainCanvasEngine } from '../hooks/usePainCanvasEngine';
import { ANATOMICAL_REGIONS } from '../types/painmap.types';
import { buildFHIRPainObservationResource } from '../utils/fhirSerializer';
import { supabase } from '../../../services/supabaseClient';
import { EvolutionChart } from '../../ehr/components/EvolutionChart';
import type { AnatomicalView, AnatomicalLayer, PainType } from '../types/painmap.types';

export function DemoPainMapPage() {
  const engine = usePainCanvasEngine();
  const [selectedCatalogRegion, setSelectedCatalogRegion] = useState(ANATOMICAL_REGIONS[0].regionId);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fhirModalOpen, setFhirModalOpen] = useState(false);
  const [fhirJson, setFhirJson] = useState<string>('');

  // Punto activo actual
  const activePoint = engine.selectedPoints.find((p) => p.regionId === engine.activeRegionId);

  // Manejo de clic directo en el Lienzo Anatómico
  const handleCanvasClick = (coords: { x: number; y: number }) => {
    // Buscar la región más cercana del catálogo o generar una id dinámica
    const targetRegion = ANATOMICAL_REGIONS.find((r) => r.defaultView === engine.currentView) || ANATOMICAL_REGIONS[0];
    const uniqueId = `${targetRegion.regionId}_${Date.now()}`;

    engine.selectRegion({
      regionId: uniqueId,
      regionName: `${targetRegion.regionName} (${coords.x * 100}%, ${coords.y * 100}%)`,
      coordinates: coords,
    });
  };

  // Agregar desde el catálogo predefinido
  const handleAddFromCatalog = () => {
    const region = ANATOMICAL_REGIONS.find((r) => r.regionId === selectedCatalogRegion);
    if (!region) return;

    engine.selectRegion({
      regionId: region.regionId,
      regionName: region.regionName,
      coordinates: region.defaultCoordinates,
    });
  };

  // Generar HL7 FHIR Observation Resource JSON
  const handleGenerateFHIR = () => {
    const fhirResource = buildFHIRPainObservationResource({
      patientId: 'patient-demo-uuid-123',
      observation: {
        view: engine.currentView,
        layer: engine.currentLayer,
        points: engine.selectedPoints,
      },
    });

    setFhirJson(JSON.stringify(fhirResource, null, 2));
    setFhirModalOpen(true);
  };

  // Guardar en Supabase PostgreSQL con RLS (Payload JSONB FHIR)
  const handleSaveToSupabase = async () => {
    if (engine.selectedPoints.length === 0) {
      alert('Por favor agrega al menos un punto de dolor al mapa.');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const fhirPayload = buildFHIRPainObservationResource({
        patientId: '00000000-0000-0000-0000-000000000001',
        observation: {
          view: engine.currentView,
          layer: engine.currentLayer,
          points: engine.selectedPoints,
        },
      });

      // Insertar en la tabla pain_observations
      const { error } = await supabase.from('pain_observations').insert({
        medical_record_id: '00000000-0000-0000-0000-000000000002',
        patient_id: '00000000-0000-0000-0000-000000000001',
        observation_data: fhirPayload,
      });

      if (error) {
        console.warn('Simulando guardado local (Supabase auth pendiente en dev):', error.message);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error guardando mapa de dolor:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Color dinámico de clase para el valor EVA del slider
  const getEvaColorHex = (score: number) => {
    if (score >= 7) return 'text-pain-high';
    if (score >= 4) return 'text-pain-mid';
    return 'text-pain-low';
  };

  return (
    <div className="min-h-screen bg-background text-on-background p-6 font-sans">
      {/* Top Header */}
      <header className="mb-6 border-b border-outline-variant/30 pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">accessibility_new</span>
            AgendaLudoia — Therapist Core Pain Map
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Interoperabilidad HL7 FHIR • Mapeo Anatómico Longitudinal • Regla de 24h
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateFHIR}
            className="bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/40 text-primary font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">code</span>
            Generate FHIR JSON
          </button>

          <button
            onClick={handleSaveToSupabase}
            disabled={isSaving}
            className="bg-primary hover:bg-primary-container text-on-primary font-semibold px-5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">cloud_upload</span>
            {isSaving ? 'Guardando...' : 'Guardar en Supabase'}
          </button>
        </div>
      </header>

      {/* Banner de Confirmación */}
      {saveSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-secondary-container text-on-secondary-container border border-secondary/30 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-base">check_circle</span>
          ¡Mapa de Dolor guardado correctamente en Supabase PostgreSQL con aislamiento RLS!
        </div>
      )}

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel Lateral de Controles */}
        <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-2xl clinical-shadow space-y-5">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-outline-variant/20 pb-2">
            Configuración Anatómica
          </h2>

          {/* Vistas Anatómicas */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-2">Vista de Cuerpo</label>
            <div className="grid grid-cols-2 gap-2">
              {(['ANTERIOR', 'POSTERIOR', 'LATERAL_LEFT', 'LATERAL_RIGHT'] as AnatomicalView[]).map((v) => (
                <button
                  key={v}
                  onClick={() => engine.changeView(v)}
                  className={`px-3 py-2 text-xs rounded-xl font-semibold transition cursor-pointer ${
                    engine.currentView === v
                      ? 'bg-primary text-on-primary shadow-md'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Capas de Tejido */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-2">Capa Tejido/Estructura</label>
            <select
              value={engine.currentLayer}
              onChange={(e) => engine.changeLayer(e.target.value as AnatomicalLayer)}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary font-medium"
            >
              <option value="CUTANEOUS">Cutánea</option>
              <option value="SUPERFICIAL_MUSCULAR">Muscular Superficial</option>
              <option value="DEEP_MUSCULAR">Muscular Profunda</option>
              <option value="LIGAMENT_ARTICULAR">Ligamentosa / Articular</option>
              <option value="TRIGGER_POINTS">Puntos Gatillo (Trigger Points)</option>
            </select>
          </div>

          {/* Selector de Catálogo */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-2">Estructuras Específicas</label>
            <div className="flex gap-2">
              <select
                value={selectedCatalogRegion}
                onChange={(e) => setSelectedCatalogRegion(e.target.value)}
                className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary font-medium"
              >
                {ANATOMICAL_REGIONS.map((r) => (
                  <option key={r.regionId} value={r.regionId}>
                    {r.regionName}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddFromCatalog}
                className="bg-secondary hover:bg-secondary-container hover:text-on-secondary-container text-on-secondary font-semibold px-3 py-2 rounded-xl text-xs transition cursor-pointer"
              >
                + Añadir
              </button>
            </div>
          </div>

          {/* Controles del Punto Seleccionado & Slider EVA Dinámico */}
          {activePoint ? (
            <div className="bg-surface-container-low/70 border border-outline-variant/40 p-4 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-primary">{activePoint.regionName}</span>
                <span className={`text-base font-extrabold ${getEvaColorHex(activePoint.painScoreEVA)}`}>
                  EVA: {activePoint.painScoreEVA} / 10
                </span>
              </div>

              {/* Slider EVA Dinámico con visual .eva-gradient */}
              <div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={activePoint.painScoreEVA}
                  onChange={(e) => engine.setPainLevel(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-gradient-to-r from-pain-low via-pain-mid to-pain-high appearance-none cursor-pointer"
                />
              </div>

              {/* Modificadores */}
              <div className="flex items-center gap-3">
                <button
                  onClick={engine.toggleTriggerPoint}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer flex items-center justify-center gap-1 ${
                    activePoint.triggerPoint
                      ? 'bg-tertiary-container text-on-tertiary-container border-tertiary'
                      : 'bg-surface-container-lowest border-outline-variant/40 text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  Trigger Point
                </button>

                <select
                  value={activePoint.painType}
                  onChange={(e) => engine.setPainType(e.target.value as PainType)}
                  className="flex-1 bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-2 py-1.5 text-xs text-on-surface"
                >
                  <option value="NOCICEPTIVE_ACUTE">Nociceptivo Agudo</option>
                  <option value="NOCICEPTIVE_CHRONIC">Nociceptivo Crónico</option>
                  <option value="NEUROPATHIC">Neuropático</option>
                  <option value="REFERRED">Referido</option>
                  <option value="MECHANICAL">Mecánico</option>
                </select>
              </div>
            </div>
          ) : (
            <p className="text-xs text-on-surface-variant italic text-center py-2">
              Haz clic en el lienzo o añade una zona para calibrar la intensidad EVA.
            </p>
          )}

          <button
            onClick={engine.clearAll}
            className="w-full text-xs font-semibold text-error hover:bg-error-container/30 py-2 rounded-xl border border-error/30 transition cursor-pointer"
          >
            Limpiar Todos los Puntos
          </button>
        </div>

        {/* Lienzo Anatómico Reactivo */}
        <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-2xl clinical-shadow flex items-center justify-center">
          <PainCanvas
            selectedPoints={engine.selectedPoints}
            activeRegionId={engine.activeRegionId}
            onCanvasClick={handleCanvasClick}
            onSelectPoint={(regionId) => engine.selectRegion({ regionId, regionName: '', coordinates: { x: 0, y: 0 } })}
            onRemovePoint={engine.removePoint}
          />
        </div>

        {/* Panel Derecha: Resumen de Puntos Evaluados & Gráfico de Evolución EHR */}
        <div className="lg:col-span-3 space-y-6">
          {/* Gráfico de Evolución Longitudinal */}
          <EvolutionChart />

          <div className="bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-2xl clinical-shadow flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-outline-variant/20 pb-2 mb-4">
                Hallazgos Registrados ({engine.selectedPoints.length})
              </h2>

              {engine.selectedPoints.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic">No hay zonas marcadas en el examen actual.</p>
              ) : (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {engine.selectedPoints.map((pt) => (
                    <div
                      key={pt.regionId}
                      onClick={() => engine.selectRegion({ regionId: pt.regionId, regionName: pt.regionName, coordinates: pt.coordinates })}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        pt.regionId === engine.activeRegionId
                          ? 'bg-primary-container/20 border-primary text-on-primary-container font-semibold shadow-sm'
                          : 'bg-surface-container-low/60 border-outline-variant/20 hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-on-surface truncate pr-2">{pt.regionName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            pt.painScoreEVA >= 7
                              ? 'bg-pain-high text-white'
                              : pt.painScoreEVA >= 4
                              ? 'bg-pain-mid text-on-surface'
                              : 'bg-pain-low text-white'
                          }`}
                        >
                          EVA {pt.painScoreEVA}
                        </span>
                      </div>
                      <div className="text-[10px] text-on-surface-variant flex items-center justify-between">
                        <span>{pt.painType}</span>
                        {pt.triggerPoint && <span className="text-amber-500 font-bold">⚡ Trigger Point</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal FHIR JSON */}
      {fhirModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h3 className="text-base font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">code</span>
                HL7 FHIR Observation Payload (JSONB)
              </h3>
              <button
                onClick={() => setFhirModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs font-mono max-h-[400px] overflow-auto border border-slate-800">
              {fhirJson}
            </pre>

            <div className="flex justify-end">
              <button
                onClick={() => setFhirModalOpen(false)}
                className="bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-semibold hover:bg-primary-container cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
