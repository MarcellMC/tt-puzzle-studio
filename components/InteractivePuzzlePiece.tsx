"use client";

import { useRef, useEffect, useState } from "react";
import { PuzzlePiece } from "@/lib/types";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";
import { usePointerGestures } from "@/hooks/usePointerGestures";
import { motion } from "framer-motion";

interface InteractivePuzzlePieceProps {
  piece: PuzzlePiece;
  imageUrl: string;
  snapTolerance?: number;
  onSnap?: (pieceId: string) => void;
}

export default function InteractivePuzzlePiece({
  piece,
  imageUrl,
  snapTolerance = 20,
  onSnap,
}: InteractivePuzzlePieceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const [isNearCorrect, setIsNearCorrect] = useState(false);

  const { updatePiece, selectPiece, lockPiece, selectedPieceId, addToHistory } =
    usePuzzleStore();

  const isSelected = selectedPieceId === piece.id;

  // Draw the piece on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imageRef.current;
    if (!img?.complete) {
      const newImg = new Image();
      newImg.crossOrigin = "anonymous";
      newImg.src = imageUrl;
      newImg.onload = () => {
        imageRef.current = newImg;
        drawPiece(ctx, newImg);
      };
    } else {
      drawPiece(ctx, img);
    }
  }, [piece, imageUrl]);

  const drawPiece = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = piece.width + 4;
    canvas.height = piece.height + 4;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create clipping path
    const path = new Path2D(piece.path);
    ctx.save();
    ctx.translate(-piece.x + 2, -piece.y + 2);
    ctx.clip(path);

    // Draw image portion
    ctx.drawImage(img, 0, 0, img.width, img.height);

    ctx.restore();

    // Draw border
    ctx.save();
    ctx.translate(-piece.x + 2, -piece.y + 2);
    ctx.strokeStyle = piece.isLocked ? "#10b981" : isSelected ? "#3b82f6" : "#64748b";
    ctx.lineWidth = piece.isLocked ? 3 : 2;
    ctx.stroke(path);
    ctx.restore();
  };

  const checkSnap = (x: number, y: number) => {
    const dx = Math.abs(x - piece.correctX);
    const dy = Math.abs(y - piece.correctY);
    const distance = Math.sqrt(dx * dx + dy * dy);

    setIsNearCorrect(distance < snapTolerance * 1.5);

    if (distance < snapTolerance) {
      return true;
    }
    return false;
  };

  const { handlePointerDown, handlePointerMove, handlePointerUp } =
    usePointerGestures({
      onDragStart: (x, y) => {
        if (piece.isLocked) return;
        selectPiece(piece.id);
        dragStartPos.current = {
          x: (piece.currentX ?? piece.x) - x,
          y: (piece.currentY ?? piece.y) - y,
        };
      },
      onDrag: (dx, dy, x, y) => {
        if (piece.isLocked) return;

        const newX = x + dragStartPos.current.x;
        const newY = y + dragStartPos.current.y;

        updatePiece(piece.id, {
          currentX: newX,
          currentY: newY,
        });

        checkSnap(newX, newY);
      },
      onDragEnd: () => {
        if (piece.isLocked) return;

        const currentX = piece.currentX ?? piece.x;
        const currentY = piece.currentY ?? piece.y;

        if (checkSnap(currentX, currentY)) {
          // Snap to correct position
          updatePiece(piece.id, {
            currentX: piece.correctX,
            currentY: piece.correctY,
          });
          lockPiece(piece.id);
          onSnap?.(piece.id);
          setIsNearCorrect(false);
        }

        addToHistory();
        selectPiece(null);
      },
    });

  const x = piece.currentX ?? piece.x;
  const y = piece.currentY ?? piece.y;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: piece.isLocked ? 0.7 : 1,
        scale: isNearCorrect ? 1.05 : 1,
      }}
      transition={{ duration: 0.2 }}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: piece.width + 4,
        height: piece.height + 4,
        zIndex: piece.zIndex || 0,
        cursor: piece.isLocked ? "default" : "grab",
        touchAction: "none",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="button"
      aria-label={`Puzzle piece ${piece.id}${piece.isLocked ? " - locked in place" : ""}`}
      tabIndex={piece.isLocked ? -1 : 0}
      onKeyDown={(e) => {
        if (piece.isLocked) return;

        const step = e.shiftKey ? 10 : 1;
        let newX = x;
        let newY = y;

        switch (e.key) {
          case "ArrowLeft":
            newX -= step;
            break;
          case "ArrowRight":
            newX += step;
            break;
          case "ArrowUp":
            newY -= step;
            break;
          case "ArrowDown":
            newY += step;
            break;
          default:
            return;
        }

        e.preventDefault();
        updatePiece(piece.id, { currentX: newX, currentY: newY });
        checkSnap(newX, newY);

        if (e.key.startsWith("Arrow")) {
          addToHistory();
        }
      }}
    >
      <canvas
        ref={canvasRef}
        className={`${isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""} ${
          isNearCorrect ? "ring-2 ring-green-400 ring-offset-2" : ""
        } ${piece.isLocked ? "opacity-70" : ""} rounded transition-all`}
      />
      {piece.isLocked && (
        <div className="absolute top-0 right-0 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
          ✓
        </div>
      )}
    </motion.div>
  );
}
