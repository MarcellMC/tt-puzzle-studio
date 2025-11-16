"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function PuzzleGallery() {
  const router = useRouter();
  const puzzles = useQuery(api.puzzles.list);
  const [localPuzzles, setLocalPuzzles] = useState<any[]>([]);

  // Load from localStorage as fallback
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("puzzles") || "[]");
      setLocalPuzzles(stored);
    } catch (e) {
      console.error("Failed to load from localStorage:", e);
    }
  }, []);

  // Combine puzzles from both sources
  const allPuzzles = [
    ...(puzzles || []),
    ...localPuzzles.filter(
      (local) => !puzzles?.some((p) => p._id === local._id)
    ),
  ].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            ← Back to Home
          </button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Puzzle Gallery
              </h1>
              <p className="text-gray-600">
                Browse and play all your created puzzles
              </p>
            </div>
            <Link
              href="/puzzle/create"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              + Create New Puzzle
            </Link>
          </div>
        </div>

        {allPuzzles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🧩</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No Puzzles Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first puzzle to get started!
            </p>
            <Link
              href="/puzzle/create"
              className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Create Puzzle
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPuzzles.map((puzzle, index) => (
              <motion.div
                key={puzzle._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={`/puzzle/play/${puzzle._id}`}
                  className="block group"
                >
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <div className="aspect-video relative overflow-hidden bg-gray-100">
                      <img
                        src={puzzle.imageUrl}
                        alt={puzzle.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                        {puzzle.pieces.length} pieces
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">
                        {puzzle.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {puzzle.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {new Date(puzzle.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-purple-600 font-medium group-hover:text-purple-700">
                          Play →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
