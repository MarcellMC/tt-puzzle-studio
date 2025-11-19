"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";
import InteractivePuzzlePiece from "@/components/InteractivePuzzlePiece";
import { motion, AnimatePresence } from "framer-motion";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function PlayPuzzle() {
  const params = useParams();
  const router = useRouter();
  const puzzleId = params.id as Id<"puzzles">;

  const puzzle = useQuery(api.puzzles.get, { id: puzzleId });
  const [localPuzzle, setLocalPuzzle] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [snapTolerance, setSnapTolerance] = useState(20);

  const {
    pieces,
    setPieces,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    completedPieceIds,
  } = usePuzzleStore();

  // Load puzzle from Convex or localStorage
  useEffect(() => {
    if (puzzle) {
      // Calculate offset to center the 400x500 image in the working area
      const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const imageWidth = Math.min(400, containerWidth * 0.9);
      const imageHeight = imageWidth * 1.25; // 4:5 ratio

      // Center offset
      const offsetX = (containerWidth - imageWidth) / 2;
      const offsetY = 50; // Top margin

      // Adjust piece positions to account for centered image
      const adjustedPieces = puzzle.pieces.map((p) => ({
        ...p,
        correctX: p.correctX + offsetX,
        correctY: p.correctY + offsetY,
      }));

      setPieces(adjustedPieces);
      setLocalPuzzle(puzzle);
    } else {
      // Try localStorage as fallback
      try {
        const puzzles = JSON.parse(localStorage.getItem("puzzles") || "[]");
        const found = puzzles.find((p: any) => p._id === puzzleId);
        if (found) {
          // Same offset calculation for localStorage puzzles
          const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
          const imageWidth = Math.min(400, containerWidth * 0.9);
          const imageHeight = imageWidth * 1.25;
          const offsetX = (containerWidth - imageWidth) / 2;
          const offsetY = 50;

          const adjustedPieces = found.pieces.map((p: any) => ({
            ...p,
            correctX: p.correctX + offsetX,
            correctY: p.correctY + offsetY,
          }));

          setPieces(adjustedPieces);
          setLocalPuzzle(found);
        }
      } catch (e) {
        console.error("Failed to load from localStorage:", e);
      }
    }

    // Cleanup on unmount
    return () => reset();
  }, [puzzle, puzzleId, setPieces, reset]);

  // Check for completion
  useEffect(() => {
    if (pieces.length > 0 && completedPieceIds.size === pieces.length) {
      setShowSuccess(true);
      setTimeout(() => {
        confetti();
      }, 100);
    }
  }, [completedPieceIds, pieces]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const confetti = () => {
    // Simple confetti effect
    const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"];
    for (let i = 0; i < 50; i++) {
      const confettiEl = document.createElement("div");
      confettiEl.style.position = "fixed";
      confettiEl.style.width = "10px";
      confettiEl.style.height = "10px";
      confettiEl.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      confettiEl.style.left = Math.random() * 100 + "%";
      confettiEl.style.top = "-10px";
      confettiEl.style.borderRadius = "50%";
      confettiEl.style.pointerEvents = "none";
      confettiEl.style.zIndex = "9999";
      document.body.appendChild(confettiEl);

      const animation = confettiEl.animate(
        [
          { transform: "translateY(0) rotate(0deg)", opacity: 1 },
          {
            transform: `translateY(${window.innerHeight + 10}px) rotate(${Math.random() * 360}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: 3000 + Math.random() * 2000,
          easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }
      );

      animation.onfinish = () => confettiEl.remove();
    }
  };

  const handleSnap = useCallback((pieceId: string) => {
    // Play success sound or haptic feedback if available
    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  const handleRestart = () => {
    reset();
    if (localPuzzle) {
      setPieces(localPuzzle.pieces);
    }
    setShowSuccess(false);
  };

  const currentPuzzle = puzzle || localPuzzle;

  if (!currentPuzzle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading puzzle...</p>
        </div>
      </div>
    );
  }

  const progress = pieces.length > 0 ? (completedPieceIds.size / pieces.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <button
                onClick={() => router.push("/")}
                className="text-sm text-gray-600 hover:text-gray-800 mb-2"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                {currentPuzzle.title}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                {currentPuzzle.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={undo}
                disabled={!canUndo()}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors text-sm"
                aria-label="Undo (Ctrl/Cmd+Z)"
              >
                ↶ Undo
              </button>
              <button
                onClick={redo}
                disabled={!canRedo()}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors text-sm"
                aria-label="Redo (Ctrl/Cmd+Shift+Z)"
              >
                ↷ Redo
              </button>
              <button
                onClick={handleRestart}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                🔄 Restart
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold text-purple-600">
                {completedPieceIds.size} / {pieces.length} pieces
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Snap tolerance control */}
          <div className="mt-4 flex items-center gap-4">
            <label className="text-sm text-gray-600">Snap Sensitivity:</label>
            <input
              type="range"
              min="10"
              max="50"
              value={snapTolerance}
              onChange={(e) => setSnapTolerance(Number(e.target.value))}
              className="flex-1 max-w-xs"
            />
            <span className="text-sm text-gray-700">{snapTolerance}px</span>
          </div>
        </div>
      </div>

      {/* Puzzle area */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Working area container - full width with centered puzzle image */}
        <div
          className="relative bg-white rounded-xl shadow-lg mx-auto"
          style={{
            width: "100%",
            minHeight: "600px",
            position: "relative",
          }}
          role="application"
          aria-label="Puzzle playing area"
        >
          {/* Reference image (faded) - centered with 4:5 ratio */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              width: "min(400px, 90vw)",
              aspectRatio: "4 / 5",
            }}
          >
            <img
              src={currentPuzzle.imageUrl}
              alt="Puzzle reference"
              className="w-full h-full object-cover opacity-10 rounded-lg"
            />
          </div>

          {/* Puzzle pieces - can move anywhere in the container */}
          {pieces.map((piece) => (
            <InteractivePuzzlePiece
              key={piece.id}
              piece={piece}
              imageUrl={currentPuzzle.imageUrl}
              snapTolerance={snapTolerance}
              onSnap={handleSnap}
            />
          ))}
        </div>
      </div>

      {/* Success modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSuccess(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Puzzle Complete!
                </h2>
                <p className="text-gray-600 mb-6">
                  Great job! You completed the puzzle in {pieces.length} pieces.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleRestart}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={() => router.push("/")}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Home
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard shortcuts help - desktop only */}
      <div className="hidden md:block fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 text-xs text-gray-600 max-w-xs">
        <div className="font-semibold mb-1">Keyboard Shortcuts:</div>
        <div>• Arrow keys: Move selected piece</div>
        <div>• Shift + Arrow: Move faster</div>
        <div>• Cmd/Ctrl + Z: Undo</div>
        <div>• Cmd/Ctrl + Shift + Z: Redo</div>
      </div>
    </div>
  );
}
