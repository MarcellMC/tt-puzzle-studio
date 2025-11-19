"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ImageCropperProps {
  imageDataUrl: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

export default function ImageCropper({
  imageDataUrl,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Image transform state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Cropping area dimensions (4:5 Instagram portrait ratio)
  const CROP_WIDTH = 400;
  const CROP_HEIGHT = 500;

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;

      // Calculate initial scale to fit the crop area
      const scaleToFit = Math.max(
        CROP_WIDTH / img.width,
        CROP_HEIGHT / img.height
      );
      setScale(scaleToFit);

      // Center the image
      const initialX = (CROP_WIDTH - img.width * scaleToFit) / 2;
      const initialY = (CROP_HEIGHT - img.height * scaleToFit) / 2;
      setPosition({ x: initialX, y: initialY });
    };
    img.src = imageDataUrl;
  }, [imageDataUrl]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imageRef.current;

    if (!canvas || !ctx || !img) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image with current transform
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    ctx.restore();

    // Draw crop overlay (darkened areas outside crop zone)
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear the crop area to show the image
    ctx.clearRect(0, 0, CROP_WIDTH, CROP_HEIGHT);

    // Redraw image in crop area
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, CROP_WIDTH, CROP_HEIGHT);
    ctx.clip();
    ctx.translate(position.x, position.y);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    ctx.restore();

    // Draw crop border
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, CROP_WIDTH, CROP_HEIGHT);
  };

  useEffect(() => {
    drawCanvas();
  }, [position, scale]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(5, scale * delta));
    setScale(newScale);
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    // Create a new canvas for the cropped image
    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = CROP_WIDTH;
    cropCanvas.height = CROP_HEIGHT;
    const cropCtx = cropCanvas.getContext("2d");

    if (!cropCtx) return;

    // Draw the cropped portion
    cropCtx.save();
    cropCtx.translate(position.x, position.y);
    cropCtx.scale(scale, scale);
    cropCtx.drawImage(img, 0, 0);
    cropCtx.restore();

    // Convert to data URL
    const croppedDataUrl = cropCanvas.toDataURL("image/jpeg", 0.95);
    onCropComplete(croppedDataUrl);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(5, prev * 1.2));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.1, prev * 0.8));
  };

  const handleReset = () => {
    if (!imageRef.current) return;
    const img = imageRef.current;
    const scaleToFit = Math.max(
      CROP_WIDTH / img.width,
      CROP_HEIGHT / img.height
    );
    setScale(scaleToFit);
    const initialX = (CROP_WIDTH - img.width * scaleToFit) / 2;
    const initialY = (CROP_HEIGHT - img.height * scaleToFit) / 2;
    setPosition({ x: initialX, y: initialY });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Crop Your Image
          </h2>
          <p className="text-gray-600 text-sm">
            Drag to move, scroll to zoom. Image will be cropped to 4:5 ratio (Instagram portrait)
          </p>
        </div>

        <div className="relative mb-6 flex justify-center">
          <div
            ref={containerRef}
            className="relative inline-block bg-gray-900 rounded-lg overflow-hidden"
            style={{ width: CROP_WIDTH, height: CROP_HEIGHT }}
          >
            <canvas
              ref={canvasRef}
              width={CROP_WIDTH}
              height={CROP_HEIGHT}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onWheel={handleWheel}
              className="cursor-move touch-none"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4">
          {/* Zoom slider */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleZoomOut}
              className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              −
            </button>
            <input
              type="range"
              min="10"
              max="500"
              value={scale * 100}
              onChange={(e) => setScale(Number(e.target.value) / 100)}
              className="flex-1"
            />
            <button
              onClick={handleZoomIn}
              className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              +
            </button>
            <span className="text-sm text-gray-600 min-w-[60px]">
              {Math.round(scale * 100)}%
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Reset
            </button>
            <div className="flex-1" />
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCrop}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Crop & Continue
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
