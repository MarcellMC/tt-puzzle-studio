import { useRef, useCallback, useState } from "react";

interface PointerState {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
}

interface GestureHandlers {
  onDragStart?: (x: number, y: number) => void;
  onDrag?: (dx: number, dy: number, x: number, y: number) => void;
  onDragEnd?: () => void;
  onPinchStart?: (distance: number) => void;
  onPinch?: (scale: number, centerX: number, centerY: number) => void;
  onPinchEnd?: () => void;
}

export function usePointerGestures(handlers: GestureHandlers) {
  const pointersRef = useRef<Map<number, PointerState>>(new Map());
  const initialPinchDistance = useRef<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPinching, setIsPinching] = useState(false);

  const getDistance = (p1: PointerState, p2: PointerState) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getCenter = (p1: PointerState, p2: PointerState) => {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  };

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const pointer: PointerState = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        startX: e.clientX,
        startY: e.clientY,
      };

      pointersRef.current.set(e.pointerId, pointer);

      const pointers = Array.from(pointersRef.current.values());

      if (pointers.length === 1) {
        setIsDragging(true);
        handlers.onDragStart?.(e.clientX, e.clientY);
      } else if (pointers.length === 2) {
        setIsDragging(false);
        setIsPinching(true);
        initialPinchDistance.current = getDistance(pointers[0], pointers[1]);
        handlers.onPinchStart?.(initialPinchDistance.current);
      }
    },
    [handlers]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const pointer = pointersRef.current.get(e.pointerId);
      if (!pointer) return;

      const prevX = pointer.x;
      const prevY = pointer.y;

      pointer.x = e.clientX;
      pointer.y = e.clientY;

      const pointers = Array.from(pointersRef.current.values());

      if (pointers.length === 1 && isDragging) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        handlers.onDrag?.(dx, dy, e.clientX, e.clientY);
      } else if (pointers.length === 2 && isPinching) {
        const currentDistance = getDistance(pointers[0], pointers[1]);
        const scale = currentDistance / initialPinchDistance.current;
        const center = getCenter(pointers[0], pointers[1]);
        handlers.onPinch?.(scale, center.x, center.y);
      }
    },
    [handlers, isDragging, isPinching]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const target = e.currentTarget as HTMLElement;
      target.releasePointerCapture(e.pointerId);

      pointersRef.current.delete(e.pointerId);

      const pointers = Array.from(pointersRef.current.values());

      if (pointers.length === 0) {
        if (isDragging) {
          handlers.onDragEnd?.();
          setIsDragging(false);
        }
        if (isPinching) {
          handlers.onPinchEnd?.();
          setIsPinching(false);
        }
      } else if (pointers.length === 1 && isPinching) {
        // Switch from pinch to drag
        setIsPinching(false);
        handlers.onPinchEnd?.();
      }
    },
    [handlers, isDragging, isPinching]
  );

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isDragging,
    isPinching,
  };
}
