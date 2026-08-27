/**
 * usePainCanvasEngine — Pure logic hook for managing the Pain Map canvas state.
 * 
 * Responsibilities:
 * - Track selected anatomical points with EVA scores
 * - Manage current view (Anterior/Posterior/Lateral) and layer switching
 * - Validate inputs (EVA 0-10, normalized coordinates)
 * - Provide operations: selectRegion, setPainLevel, removePoint, changeView, changeLayer, clearAll
 *
 * This hook contains NO rendering logic — it's pure state management for TDD.
 */

import { useCallback, useRef, useState } from 'react';
import type {
  AnatomicalLayer,
  AnatomicalView,
  PainCanvasState,
  PainPoint,
  PainType,
  RegionSelectionInput,
} from '../../../types/painmap.types';

interface UsePainCanvasEngineReturn extends PainCanvasState {
  /** Select a region on the canvas for pain annotation */
  selectRegion: (input: RegionSelectionInput) => void;
  /** Set the EVA pain level (0-10) for the most recently selected region */
  setPainLevel: (score: number) => void;
  /** Set the pain type for the most recently selected region */
  setPainType: (painType: PainType) => void;
  /** Toggle trigger point status for the most recently selected region */
  toggleTriggerPoint: () => void;
  /** Add a motion restriction to the most recently selected region */
  addMotionRestriction: (restriction: string) => void;
  /** Remove a specific pain point by regionId */
  removePoint: (regionId: string) => void;
  /** Change the anatomical view (Anterior/Posterior/Lateral/JointDetail) */
  changeView: (view: AnatomicalView) => void;
  /** Change the depth layer (Cutaneous/Superficial/Deep/Ligament/TriggerPoints) */
  changeLayer: (layer: AnatomicalLayer) => void;
  /** Clear all selected points */
  clearAll: () => void;
}

export function usePainCanvasEngine(): UsePainCanvasEngineReturn {
  const [currentView, setCurrentView] = useState<AnatomicalView>('ANTERIOR');
  const [currentLayer, setCurrentLayer] = useState<AnatomicalLayer>('SUPERFICIAL_MUSCULAR');
  const [selectedPoints, setSelectedPoints] = useState<PainPoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);

  // Use a ref to track activeRegionId synchronously so that
  // setPainLevel/setPainType/etc. can be called in the same act() block
  // as selectRegion without stale closure issues.
  const activeRegionRef = useRef<string | null>(null);

  const selectRegion = useCallback((input: RegionSelectionInput) => {
    // Validate coordinates are normalized
    if (
      input.coordinates.x < 0 || input.coordinates.x > 1 ||
      input.coordinates.y < 0 || input.coordinates.y > 1
    ) {
      return; // Silently reject invalid coordinates
    }

    // Update ref synchronously
    activeRegionRef.current = input.regionId;

    // Check if region already exists — update it instead
    setSelectedPoints((prev) => {
      const existing = prev.find((p) => p.regionId === input.regionId);
      if (existing) {
        setActiveRegionId(input.regionId);
        return prev; // Already selected, just make it active
      }

      const newPoint: PainPoint = {
        regionId: input.regionId,
        regionName: input.regionName,
        painScoreEVA: 0, // Default, must be set via setPainLevel
        painType: 'NOCICEPTIVE_ACUTE',
        triggerPoint: false,
        motionRestriction: [],
        coordinates: input.coordinates,
      };

      setActiveRegionId(input.regionId);
      setIsDrawing(true);
      return [...prev, newPoint];
    });
  }, []);

  const setPainLevel = useCallback((score: number) => {
    // Validate EVA range
    if (score < 0 || score > 10) return;

    const targetId = activeRegionRef.current;
    setSelectedPoints((prev) =>
      prev.map((point) =>
        point.regionId === targetId
          ? { ...point, painScoreEVA: score }
          : point
      )
    );
  }, []);

  const setPainType = useCallback((painType: PainType) => {
    const targetId = activeRegionRef.current;
    setSelectedPoints((prev) =>
      prev.map((point) =>
        point.regionId === targetId
          ? { ...point, painType }
          : point
      )
    );
  }, []);

  const toggleTriggerPoint = useCallback(() => {
    const targetId = activeRegionRef.current;
    setSelectedPoints((prev) =>
      prev.map((point) =>
        point.regionId === targetId
          ? { ...point, triggerPoint: !point.triggerPoint }
          : point
      )
    );
  }, []);

  const addMotionRestriction = useCallback((restriction: string) => {
    const targetId = activeRegionRef.current;
    setSelectedPoints((prev) =>
      prev.map((point) =>
        point.regionId === targetId
          ? { ...point, motionRestriction: [...point.motionRestriction, restriction] }
          : point
      )
    );
  }, []);

  const removePoint = useCallback((regionId: string) => {
    setSelectedPoints((prev) => prev.filter((p) => p.regionId !== regionId));
    if (activeRegionRef.current === regionId) {
      activeRegionRef.current = null;
      setActiveRegionId(null);
      setIsDrawing(false);
    }
  }, []);

  const changeView = useCallback((view: AnatomicalView) => {
    setCurrentView(view);
  }, []);

  const changeLayer = useCallback((layer: AnatomicalLayer) => {
    setCurrentLayer(layer);
  }, []);

  const clearAll = useCallback(() => {
    setSelectedPoints([]);
    activeRegionRef.current = null;
    setActiveRegionId(null);
    setIsDrawing(false);
  }, []);

  return {
    currentView,
    currentLayer,
    selectedPoints,
    isDrawing,
    activeRegionId,
    selectRegion,
    setPainLevel,
    setPainType,
    toggleTriggerPoint,
    addMotionRestriction,
    removePoint,
    changeView,
    changeLayer,
    clearAll,
  };
}
