"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PuzzlePiece } from "@/lib/types";
import PuzzleCanvas from "@/components/PuzzleCanvas";
import { generatePuzzleMetadata } from "@/app/actions/ai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function CreatePuzzle() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const createPuzzle = useMutation(api.puzzles.create);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      setImageFile(file);

      // Convert to base64 data URL for both canvas and OpenAI
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImageUrl(dataUrl);
      };
      reader.readAsDataURL(file);

      setError("");
      setPieces([]); // Reset pieces when new image is uploaded
    },
    []
  );

  const handleGenerateAI = async () => {
    if (!imageUrl) return;

    setIsGeneratingAI(true);
    setError("");

    try {
      const result = await generatePuzzleMetadata(imageUrl);

      if (result.success) {
        setTitle(result.title);
        setDescription(result.description);
      } else {
        setError(result.error || "Failed to generate AI metadata");
      }
    } catch (err) {
      setError("Failed to generate AI metadata");
      console.error(err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSave = async () => {
    if (!imageUrl || pieces.length === 0 || !title.trim()) {
      setError("Please upload an image, draw pieces, and provide a title");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const puzzleId = await createPuzzle({
        title: title.trim(),
        description: description.trim(),
        imageUrl,
        pieces,
      });

      // Save to localStorage as backup
      try {
        const puzzles = JSON.parse(
          localStorage.getItem("puzzles") || "[]"
        );
        puzzles.push({
          _id: puzzleId,
          title,
          description,
          imageUrl,
          pieces,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        localStorage.setItem("puzzles", JSON.stringify(puzzles));
      } catch (e) {
        console.error("Failed to save to localStorage:", e);
      }

      router.push(`/puzzle/play/${puzzleId}`);
    } catch (err) {
      setError("Failed to save puzzle. Please try again.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push("/")}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Home
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Create Your Puzzle
            </h1>
            <p className="text-gray-600">
              Upload an image, draw puzzle pieces, and let AI generate engaging descriptions
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Image Upload */}
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 block">
                1. Upload Image
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
              />
            </label>
          </div>

          {/* Canvas for drawing pieces */}
          {imageUrl && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  2. Draw Puzzle Pieces
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Click and drag to draw shapes that will become puzzle pieces
                </p>
              </div>
              <PuzzleCanvas
                imageUrl={imageUrl}
                pieces={pieces}
                onPiecesChange={setPieces}
              />
            </div>
          )}

          {/* AI Generation and Metadata */}
          {pieces.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">
                  3. Puzzle Details
                </h3>
                <button
                  onClick={handleGenerateAI}
                  disabled={isGeneratingAI}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingAI ? "Generating..." : "✨ Generate with AI"}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter puzzle title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={60}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter puzzle description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                  maxLength={150}
                />
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving || !title.trim()}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSaving ? "Saving..." : "Save & Play Puzzle"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
