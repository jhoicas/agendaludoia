/**
 * TDD Test Suite for usePainCanvasEngine hook.
 * Tests the pure state management logic for the anatomical pain map.
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePainCanvasEngine } from './usePainCanvasEngine';

describe('usePainCanvasEngine TDD Suite', () => {
  // ─── Region Selection ─────────────────────────────────────────────

  it('should initialize with default state', () => {
    const { result } = renderHook(() => usePainCanvasEngine());

    expect(result.current.currentView).toBe('ANTERIOR');
    expect(result.current.currentLayer).toBe('SUPERFICIAL_MUSCULAR');
    expect(result.current.selectedPoints).toHaveLength(0);
    expect(result.current.isDrawing).toBe(false);
    expect(result.current.activeRegionId).toBeNull();
  });

  it('should add a point when a region is selected', () => {
    const { result } = renderHook(() => usePainCanvasEngine());

    act(() => {
      result.current.selectRegion({
        regionId: 'KNEE_R_ACL',
        regionName: 'ACL Right Knee',
        coordinates: { x: 0.54, y: 0.72 },
      });
    });

    expect(result.current.selectedPoints).toHaveLength(1);
    expect(result.current.selectedPoints[0].regionId).toBe('KNEE_R_ACL');
    expect(result.current.selectedPoints[0].painScoreEVA).toBe(0); // Default
    expect(result.current.activeRegionId).toBe('KNEE_R_ACL');
    expect(result.current.isDrawing).toBe(true);
  });

  it('should add a muscle point with valid EVA score when clicked', () => {
    const { result } = renderHook(() => usePainCanvasEngine());

    act(() => {
      result.current.selectRegion({
        regionId: 'KNEE_R_ACL',
        regionName: 'ACL Right Knee',
        coordinates: { x: 0.54, y: 0.72 },
      });
      result.current.setPainLevel(7);
    });

    expect(result.current.selectedPoints).toHaveLength(1);
    expect(result.current.selectedPoints[0]).toEqual(
      expect.objectContaining({
        regionId: 'KNEE_R_ACL',
        painScoreEVA: 7,
      })
    );
  });

  it('should not duplicate region when selected twice', () => {
    const { result } = renderHook(() => usePainCanvasEngine());

    act(() => {
      result.current.selectRegion({
        regionId: 'KNEE_R_ACL',
        regionName: 'ACL Right Knee',
        coordinates: { x: 0.54, y: 0.72 },
      });
    });

    act(() => {
      result.current.selectRegion({
        regionId: 'KNEE_R_ACL',
        regionName: 'ACL Right Knee',
        coordinates: { x: 0.54, y: 0.72 },
      });
    });

    expect(result.current.selectedPoints).toHaveLength(1);
  });

  it('should reject points with invalid coordinates', () => {
    const { result } = renderHook(() => usePainCanvasEngine());

    act(() => {
      result.current.selectRegion({
        regionId: 'INVALID',
        regionName: 'Invalid Region',
        coordinates: { x: 1.5, y: -0.1 }, // Out of bounds
      });
    });

    expect(result.current.selectedPoints).toHaveLength(0);
  });

  // ─── EVA Score Management ─────────────────────────────────────────

  it('should set EVA score for the active region', () => {
    const { result } = renderHook(() => usePainCanvasEngine());

    act(() => {
      result.current.selectRegion({
        regionId: 'SHOULDER_R_SUPRASPINATUS',
        regionName: 'Supraespinoso - Derecho',
        coordinates: { x: 0.32, y: 0.16 },
      });
      result.current.setPainLevel(8);
    });

    expect(result.current.selectedPoints[0].painScoreEVA).toBe(8);
  });

  it('should reject EVA score above 10', () => {
    const { result } = renderHook(() => usePainCanvasEngine());

    act(() => {
      result.current.selectRegion({
        regionId: 'SHOULDER_R_SUPRASPINATUS',
        regionName: 'Supraespinoso',
        coordinates: { x: 0.32, y: 0.16 },
      });
      result.current.setPainLevel(15);
    });

    expect(result.current.selectedPoints[0].painScoreEVA).toBe(0); // Unchanged
  });

  it('should reject negative EVA score', () => {
    const { result } = renderHook(() => usePainCanvasEngine());

    act(() => {
      result.current.selectRegion({
        regionId: 'SHOULDER_R_SUPRASPINATUS',
        regionName: 'Supraespinoso',
        coordinates: { x: 0.32, y: 0.16 },
      });
      result.current.setPainLevel(-1);
    });

    expect(result.current.selectedPoints[0].painScoreEVA).toBe(0); // Unchanged
  });

  // ─── Multiple Regions ─────────────────────────────────────────────

  it('should support multiple selected regions', () => {
    const { result } = renderHook(() => usePainCanvasEngine());

    act(() => {
      result.current.selectRegion({
        regionId: 'KNEE_R_ACL',
        regionName: 'ACL Right Knee',
        coordinates: { x: 0.54, y: 0.72 },
      });
      result.current.setPainLevel(7);
    });

    act(() => {
      result.current.selectRegion({
        regionId: 'NECK_TRAPEZIUS_UPPER',
        regionName: 'Trapecio Superior',
        coordinates: { x: 0.45, y: 0.12 },
      });
      result.current.setPainLevel(5);
    });

    expect(result.current.selectedPoints).toHaveLength(2);
    expect(result.current.selectedPoints[0].regionId).toBe('KNEE_R_ACL');
    expect(result.current.selectedPoints[0].painScoreEVA).toBe(7);
    expect(result.current.selectedPoints[1].regionId).toBe('NECK_TRAPEZIUS_UPPER');
    expect(result.current.selectedPoints[1].painScoreEVA).toBe(5);
  });

  // ─── Remove & Clear ───────────────────────────────────────────────

  it('should remove a specific point by regionId', () => {
    const { result } = renderHook(() => usePainCanvasEngine());

    act(() => {
      result.current.selectRegion({
        regionId: 'KNEE_R_ACL',
        regionName: 'ACL',
        coordinates: { x: 0.54, y: 0.72 },
      });
      result.current.selectRegion({
        regionId: 'NECK_TRAPEZIUS_UPPER',
        regionName: 'Trapezius',
        coordinates: { x: 0.45, y: 0.12 },
      });
    });

    act(() => {
      result.current.removePoint('KNEE_R_ACL');
    });

    expect(result.current.selectedPoints).toHaveLength(1);
    expect(result.current.selectedPoints[0].regionId).toBe('NECK_TRAPEZIUS_UPPER');
  });

  it('should clear all selected points', () => {
    const { result } = renderHook(() => usePainCanvasEngine());

    act(() => {
      result.current.selectRegion({
        regionId: 'KNEE_R_ACL',
        regionName: 'ACL',
        coordinates: { x: 0.54, y: 0.72 },
      });
      result.current.selectRegion({
        regionId: 'LEG_R_ACHILLES_TENDON',
        regionName: 'Achilles',
        coordinates: { x: 0.42, y: 0.88 },
      });
    });

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.selectedPoints).toHaveLength(0);
    expect(result.current.activeRegionId).toBeNull();
    expect(result.current.isDrawing).toBe(false);
  });

  // ─── View & Layer Changes ─────────────────────────────────────────

  it('should change the anatomical view', () => {
    const { result } = renderHook(() => usePainCanvasEngine());

    act(() => {
      result.current.changeView('POSTERIOR');
    });

    expect(result.current.currentView).toBe('POSTERIOR');
  });

  it('should change the depth layer', () => {
    const { result } = renderHook(() => usePainCanvasEngine());

    act(() => {
      result.current.changeLayer('DEEP_MUSCULAR');
    });

    expect(result.current.currentLayer).toBe('DEEP_MUSCULAR');
  });

  it('should support trigger point layer', () => {
    const { result } = renderHook(() => usePainCanvasEngine());

    act(() => {
      result.current.changeLayer('TRIGGER_POINTS');
    });

    expect(result.current.currentLayer).toBe('TRIGGER_POINTS');
  });

  // ─── Pain Type & Trigger Points ───────────────────────────────────

  it('should set pain type for the active region', () => {
    const { result } = renderHook(() => usePainCanvasEngine());

    act(() => {
      result.current.selectRegion({
        regionId: 'NECK_SCM_R',
        regionName: 'ECM Derecho',
        coordinates: { x: 0.55, y: 0.08 },
      });
      result.current.setPainType('NEUROPATHIC');
    });

    expect(result.current.selectedPoints[0].painType).toBe('NEUROPATHIC');
  });

  it('should toggle trigger point on the active region', () => {
    const { result } = renderHook(() => usePainCanvasEngine());

    act(() => {
      result.current.selectRegion({
        regionId: 'NECK_TRAPEZIUS_UPPER',
        regionName: 'Trapecio Superior',
        coordinates: { x: 0.45, y: 0.12 },
      });
      result.current.toggleTriggerPoint();
    });

    expect(result.current.selectedPoints[0].triggerPoint).toBe(true);

    act(() => {
      result.current.toggleTriggerPoint();
    });

    expect(result.current.selectedPoints[0].triggerPoint).toBe(false);
  });

  // ─── Motion Restriction ───────────────────────────────────────────

  it('should add motion restrictions to the active region', () => {
    const { result } = renderHook(() => usePainCanvasEngine());

    act(() => {
      result.current.selectRegion({
        regionId: 'KNEE_R_ACL',
        regionName: 'ACL Right Knee',
        coordinates: { x: 0.54, y: 0.72 },
      });
      result.current.addMotionRestriction('FLEXION_LIMITED_90_DEG');
      result.current.addMotionRestriction('ROTATION_LIMITED');
    });

    expect(result.current.selectedPoints[0].motionRestriction).toEqual([
      'FLEXION_LIMITED_90_DEG',
      'ROTATION_LIMITED',
    ]);
  });

  // ─── Sub-Regional Anatomy (Comprehensive Coverage) ────────────────

  it('should handle rotator cuff sub-regions', () => {
    const { result } = renderHook(() => usePainCanvasEngine());

    const rotatorCuffRegions = [
      { regionId: 'SHOULDER_R_SUPRASPINATUS', regionName: 'Supraespinoso', coordinates: { x: 0.32, y: 0.16 } },
      { regionId: 'SHOULDER_R_INFRASPINATUS', regionName: 'Infraespinoso', coordinates: { x: 0.30, y: 0.22 } },
      { regionId: 'SHOULDER_R_SUBSCAPULARIS', regionName: 'Subescapular', coordinates: { x: 0.70, y: 0.22 } },
      { regionId: 'SHOULDER_R_TERES_MINOR', regionName: 'Redondo Menor', coordinates: { x: 0.28, y: 0.24 } },
    ];

    act(() => {
      rotatorCuffRegions.forEach((region) => {
        result.current.selectRegion(region);
      });
    });

    expect(result.current.selectedPoints).toHaveLength(4);
  });

  it('should handle knee ligament sub-regions', () => {
    const { result } = renderHook(() => usePainCanvasEngine());

    act(() => {
      result.current.selectRegion({ regionId: 'KNEE_R_ACL', regionName: 'LCA', coordinates: { x: 0.54, y: 0.72 } });
      result.current.selectRegion({ regionId: 'KNEE_R_PCL', regionName: 'LCP', coordinates: { x: 0.44, y: 0.72 } });
      result.current.selectRegion({ regionId: 'KNEE_R_MCL', regionName: 'LCM', coordinates: { x: 0.52, y: 0.71 } });
      result.current.selectRegion({ regionId: 'KNEE_R_LCL', regionName: 'LCL', coordinates: { x: 0.60, y: 0.71 } });
    });

    expect(result.current.selectedPoints).toHaveLength(4);
    expect(result.current.selectedPoints.map((p) => p.regionId)).toEqual([
      'KNEE_R_ACL', 'KNEE_R_PCL', 'KNEE_R_MCL', 'KNEE_R_LCL',
    ]);
  });
});
