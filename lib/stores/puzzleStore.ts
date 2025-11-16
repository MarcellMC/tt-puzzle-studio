import { create } from "zustand";
import { PuzzlePiece } from "../types";

interface PuzzleState {
  pieces: PuzzlePiece[];
  history: PuzzlePiece[][];
  historyIndex: number;
  selectedPieceId: string | null;
  completedPieceIds: Set<string>;

  // Actions
  setPieces: (pieces: PuzzlePiece[]) => void;
  updatePiece: (id: string, updates: Partial<PuzzlePiece>) => void;
  selectPiece: (id: string | null) => void;
  lockPiece: (id: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  reset: () => void;
  addToHistory: () => void;
}

export const usePuzzleStore = create<PuzzleState>((set, get) => ({
  pieces: [],
  history: [],
  historyIndex: -1,
  selectedPieceId: null,
  completedPieceIds: new Set(),

  setPieces: (pieces) => {
    set({
      pieces: pieces.map((p, i) => ({
        ...p,
        currentX: p.currentX ?? p.x + Math.random() * 200 - 100,
        currentY: p.currentY ?? p.y + Math.random() * 200 - 100,
        rotation: p.rotation ?? 0,
        isLocked: p.isLocked ?? false,
        zIndex: p.zIndex ?? i,
      })),
      history: [pieces],
      historyIndex: 0,
    });
  },

  updatePiece: (id, updates) => {
    const state = get();
    const pieces = state.pieces.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    set({ pieces });
  },

  selectPiece: (id) => {
    if (id) {
      const state = get();
      // Bring selected piece to front
      const maxZ = Math.max(...state.pieces.map((p) => p.zIndex || 0));
      const pieces = state.pieces.map((p) =>
        p.id === id ? { ...p, zIndex: maxZ + 1 } : p
      );
      set({ pieces, selectedPieceId: id });
    } else {
      set({ selectedPieceId: id });
    }
  },

  lockPiece: (id) => {
    const state = get();
    const pieces = state.pieces.map((p) =>
      p.id === id ? { ...p, isLocked: true } : p
    );
    const completedPieceIds = new Set(state.completedPieceIds);
    completedPieceIds.add(id);
    set({ pieces, completedPieceIds });
  },

  addToHistory: () => {
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(state.pieces)));
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      set({
        pieces: JSON.parse(JSON.stringify(state.history[newIndex])),
        historyIndex: newIndex,
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      set({
        pieces: JSON.parse(JSON.stringify(state.history[newIndex])),
        historyIndex: newIndex,
      });
    }
  },

  canUndo: () => {
    const state = get();
    return state.historyIndex > 0;
  },

  canRedo: () => {
    const state = get();
    return state.historyIndex < state.history.length - 1;
  },

  reset: () => {
    set({
      pieces: [],
      history: [],
      historyIndex: -1,
      selectedPieceId: null,
      completedPieceIds: new Set(),
    });
  },
}));
