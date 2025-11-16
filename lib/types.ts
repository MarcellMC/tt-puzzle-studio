export interface PuzzlePiece {
  id: string;
  path: string; // SVG path data
  x: number;
  y: number;
  width: number;
  height: number;
  correctX: number;
  correctY: number;
  currentX?: number; // Current position during play
  currentY?: number;
  rotation?: number;
  isLocked?: boolean;
  zIndex?: number;
}

export interface Puzzle {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageStorageId?: string;
  pieces: PuzzlePiece[];
  createdAt: number;
  updatedAt: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface DrawingState {
  isDrawing: boolean;
  points: Point[];
  currentPath?: string;
}
