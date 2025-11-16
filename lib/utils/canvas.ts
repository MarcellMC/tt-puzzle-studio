import { Point } from "../types";

export function pointsToSVGPath(points: Point[]): string {
  if (points.length === 0) return "";

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }

  path += " Z"; // Close the path
  return path;
}

export function simplifyPath(points: Point[], tolerance: number = 2): Point[] {
  if (points.length <= 2) return points;

  // Douglas-Peucker algorithm for path simplification
  const simplified: Point[] = [points[0]];
  let lastAddedIndex = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(
      points[i],
      points[lastAddedIndex],
      points[points.length - 1]
    );

    if (distance > tolerance) {
      simplified.push(points[i]);
      lastAddedIndex = i;
    }
  }

  simplified.push(points[points.length - 1]);
  return simplified;
}

function perpendicularDistance(
  point: Point,
  lineStart: Point,
  lineEnd: Point
): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;

  if (dx === 0 && dy === 0) {
    return Math.sqrt(
      Math.pow(point.x - lineStart.x, 2) + Math.pow(point.y - lineStart.y, 2)
    );
  }

  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) /
        (dx * dx + dy * dy)
    )
  );

  const projX = lineStart.x + t * dx;
  const projY = lineStart.y + t * dy;

  return Math.sqrt(
    Math.pow(point.x - projX, 2) + Math.pow(point.y - projY, 2)
  );
}

export function getBoundingBox(path: string): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  // Parse SVG path and find bounding box
  const matches = path.matchAll(/[ML]\s*([\d.]+)\s+([\d.]+)/g);
  const points: Point[] = [];

  for (const match of matches) {
    points.push({
      x: parseFloat(match[1]),
      y: parseFloat(match[2]),
    });
  }

  if (points.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const minX = Math.min(...points.map((p) => p.x));
  const maxX = Math.max(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y));
  const maxY = Math.max(...points.map((p) => p.y));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function isPointInPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  path: Path2D
): boolean {
  return ctx.isPointInPath(path, x, y);
}
