"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Point, PuzzlePiece } from "@/lib/types";
import { pointsToSVGPath, simplifyPath, getBoundingBox } from "@/lib/utils/canvas";

interface PuzzleCanvasProps {
  imageUrl: string;
  pieces: PuzzlePiece[];
  onPiecesChange: (pieces: PuzzlePiece[]) => void;
}

export default function PuzzleCanvas({
  imageUrl,
  pieces,
  onPiecesChange,
}: PuzzleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Load and display image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      imageRef.current = img;

      // Calculate canvas size to fit image while maintaining aspect ratio
      const maxWidth = 800;
      const maxHeight = 600;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;
      setCanvasSize({ width, height });

      redrawCanvas();
    };

    img.onerror = () => {
      console.error("Failed to load image");
    };
  }, [imageUrl]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imageRef.current;

    if (!canvas || !ctx || !img) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw existing pieces
    pieces.forEach((piece, index) => {
      const path = new Path2D(piece.path);
      ctx.strokeStyle = `hsl(${(index * 137.5) % 360}, 70%, 50%)`;
      ctx.lineWidth = 3;
      ctx.stroke(path);
      ctx.fillStyle = `hsla(${(index * 137.5) % 360}, 70%, 50%, 0.2)`;
      ctx.fill(path);
    });

    // Draw current path being drawn
    if (currentPoints.length > 0) {
      ctx.beginPath();
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
      for (let i = 1; i < currentPoints.length; i++) {
        ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
      }
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  }, [pieces, currentPoints]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const getPointerPosition = (e: PointerEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const point = getPointerPosition(e.nativeEvent);
    setCurrentPoints([point]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const point = getPointerPosition(e.nativeEvent);
    setCurrentPoints((prev) => [...prev, point]);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !isDrawing) return;

    canvas.releasePointerCapture(e.pointerId);
    setIsDrawing(false);

    if (currentPoints.length < 3) {
      setCurrentPoints([]);
      return;
    }

    // Simplify and create piece
    const simplified = simplifyPath(currentPoints, 3);
    const pathString = pointsToSVGPath(simplified);
    const bbox = getBoundingBox(pathString);

    const newPiece: PuzzlePiece = {
      id: `piece-${Date.now()}`,
      path: pathString,
      x: bbox.x,
      y: bbox.y,
      width: bbox.width,
      height: bbox.height,
      correctX: bbox.x,
      correctY: bbox.y,
    };

    onPiecesChange([...pieces, newPiece]);
    setCurrentPoints([]);
  };

  const handleClearLast = () => {
    if (pieces.length > 0) {
      onPiecesChange(pieces.slice(0, -1));
    }
  };

  const handleClearAll = () => {
    onPiecesChange([]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="border-2 border-gray-300 rounded-lg shadow-lg cursor-crosshair touch-none bg-white"
          style={{ maxWidth: "100%", height: "auto" }}
        />
        {pieces.length === 0 && !isDrawing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 px-6 py-3 rounded-lg shadow-md">
              <p className="text-gray-600 text-center">
                Draw shapes to create puzzle pieces
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleClearLast}
          disabled={pieces.length === 0}
          className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
        >
          Remove Last Piece
        </button>
        <button
          onClick={handleClearAll}
          disabled={pieces.length === 0}
          className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
        >
          Clear All
        </button>
        <div className="flex-1" />
        <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">
          {pieces.length} {pieces.length === 1 ? "piece" : "pieces"}
        </div>
      </div>
    </div>
  );
}
