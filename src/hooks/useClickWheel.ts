import { useRef, useCallback } from 'react';
import { soundEffects } from '../services/soundEffects';

interface UseClickWheelProps {
  onRotateClockwise: () => void;
  onRotateCounterClockwise: () => void;
  sensitivityDegrees?: number; // degrees per tick, default 16
}

export function useClickWheel({
  onRotateClockwise,
  onRotateCounterClockwise,
  sensitivityDegrees = 16,
}: UseClickWheelProps) {
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const lastAngleRef = useRef<number | null>(null);
  const accumulatedAngleRef = useRef(0);

  const getAngle = useCallback((clientX: number, clientY: number): number | null => {
    if (!wheelRef.current) return null;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;

    // Angle in degrees: 0 to 360
    let theta = Math.atan2(dy, dx) * (180 / Math.PI);
    if (theta < 0) theta += 360;
    return theta;
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only drag on the outer wheel ring, not the center button
    const target = e.target as HTMLElement;
    if (target.closest('[data-center-button="true"]')) {
      return;
    }
    isDraggingRef.current = true;
    lastAngleRef.current = getAngle(e.clientX, e.clientY);
    accumulatedAngleRef.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [getAngle]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const currentAngle = getAngle(e.clientX, e.clientY);
    if (currentAngle === null || lastAngleRef.current === null) {
      lastAngleRef.current = currentAngle;
      return;
    }

    let delta = currentAngle - lastAngleRef.current;

    // Handle crossing 0/360 boundary
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    accumulatedAngleRef.current += delta;
    lastAngleRef.current = currentAngle;

    // Check if accumulated angle exceeds sensitivity threshold
    while (Math.abs(accumulatedAngleRef.current) >= sensitivityDegrees) {
      if (accumulatedAngleRef.current > 0) {
        soundEffects.playClick();
        onRotateClockwise();
        accumulatedAngleRef.current -= sensitivityDegrees;
      } else {
        soundEffects.playClick();
        onRotateCounterClockwise();
        accumulatedAngleRef.current += sensitivityDegrees;
      }
    }
  }, [getAngle, onRotateClockwise, onRotateCounterClockwise, sensitivityDegrees]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = false;
    lastAngleRef.current = null;
    accumulatedAngleRef.current = 0;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  }, []);

  // Support trackpad / scroll wheel over click wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0 || e.deltaX > 0) {
      soundEffects.playClick();
      onRotateClockwise();
    } else if (e.deltaY < 0 || e.deltaX < 0) {
      soundEffects.playClick();
      onRotateCounterClockwise();
    }
  }, [onRotateClockwise, onRotateCounterClockwise]);

  return {
    wheelRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
  };
}
