import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <main className="flex flex-col items-center justify-center gap-8 px-4 py-16 text-center max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
            TinyTap Puzzle Studio
          </h1>
          <p className="text-xl text-gray-700 max-w-lg mx-auto">
            Create beautiful custom puzzles with AI-powered descriptions and play them with delightful touch interactions
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link
            href="/puzzle/create"
            className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Create Puzzle
          </Link>
          <Link
            href="/puzzle/gallery"
            className="flex-1 px-8 py-4 bg-white text-gray-800 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 border-2 border-gray-200"
          >
            View Gallery
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-4 bg-white/70 backdrop-blur rounded-lg shadow-sm">
            <div className="text-2xl mb-2">🎨</div>
            <h3 className="font-semibold mb-1">Draw Custom Pieces</h3>
            <p className="text-sm text-gray-600">Create unique puzzle shapes with freehand drawing</p>
          </div>
          <div className="p-4 bg-white/70 backdrop-blur rounded-lg shadow-sm">
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-semibold mb-1">AI Descriptions</h3>
            <p className="text-sm text-gray-600">Automatic titles and context from your images</p>
          </div>
          <div className="p-4 bg-white/70 backdrop-blur rounded-lg shadow-sm">
            <div className="text-2xl mb-2">📱</div>
            <h3 className="font-semibold mb-1">Touch Optimized</h3>
            <p className="text-sm text-gray-600">Smooth drag, zoom, and multi-touch gestures</p>
          </div>
        </div>
      </main>
    </div>
  );
}
