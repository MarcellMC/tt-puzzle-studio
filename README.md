# TinyTap Puzzle Studio

An advanced, mobile-first interactive puzzle creator and player built with Next.js 15, featuring AI-powered descriptions, canvas-based drawing, and delightful touch interactions.

## 🎯 Features

### Puzzle Creation
- **Image Upload**: Upload any image to create a custom puzzle
- **Freehand Drawing**: Draw custom puzzle piece shapes directly on the canvas using touch or mouse
- **AI-Powered Metadata**: Automatically generate engaging titles and descriptions using OpenAI's GPT-4 Vision
- **Real-time Preview**: See pieces as you draw them with color-coded visualization

### Puzzle Playing
- **Multi-Touch Gestures**: Native-feeling drag interactions using Pointer Events API (no gesture libraries)
- **Snap-to-Place**: Pieces automatically lock when placed correctly with visual feedback
- **Z-Index Management**: Pieces rise to front on grab with proper hit-testing
- **Undo/Redo**: Full history stack with keyboard shortcuts (Cmd/Ctrl+Z)
- **Keyboard Navigation**: Arrow keys to move pieces with Shift for faster movement
- **Adjustable Snap Tolerance**: Fine-tune difficulty with real-time slider
- **Progress Tracking**: Visual progress bar and piece counter
- **Completion Celebration**: Confetti animation on puzzle completion

### Accessibility & Performance
- **Keyboard Accessible**: Full keyboard navigation and shortcuts
- **Screen Reader Support**: ARIA labels and semantic HTML
- **RTL Support**: Right-to-left language support
- **Reduced Motion**: Respects prefers-reduced-motion preference
- **Touch Optimized**: `touch-action: none` prevents scroll jank
- **Offline Support**: localStorage fallback for puzzles
- **Mobile First**: Responsive design optimized for mobile devices

## 🏗️ Technical Architecture

### Core Technologies
- **Next.js 15** with App Router and React Server Components
- **TypeScript** for type safety
- **Convex** for real-time database and storage
- **OpenAI API** for image analysis
- **Zustand** for state management
- **Framer Motion** for smooth animations
- **Tailwind CSS** for styling

### Key Technical Decisions

#### 1. Canvas-Based Drawing
We use HTML5 Canvas for puzzle piece creation because:
- Direct pixel manipulation for image clipping
- Smooth drawing experience with pointer events
- Path simplification using Douglas-Peucker algorithm
- SVG path generation for scalable pieces

#### 2. Pointer Events API
Instead of gesture libraries, we use native Pointer Events:
- Unified touch/mouse/pen input handling
- Multi-touch support for future zoom/pan features
- Better performance on low-end devices
- `setPointerCapture` for reliable drag tracking

#### 3. Zustand State Management
Chosen over Context/Redux for:
- Minimal boilerplate
- Built-in middleware support for history
- Selective re-renders for performance
- TypeScript-first design

#### 4. Server Actions + Convex
Hybrid approach for data persistence:
- Server Actions for OpenAI API calls (secure key handling)
- Convex for real-time puzzle storage
- localStorage as offline fallback
- Streaming for better UX

#### 5. Performance Optimizations
- Canvas piece caching to reduce redraws
- Path simplification to reduce point count
- Framer Motion for hardware-accelerated animations
- Lazy loading for images
- Debounced history updates

## 📁 Project Structure

```
app/
├── actions/
│   └── ai.ts                 # Server Actions for OpenAI
├── providers/
│   └── ConvexProvider.tsx    # Convex client setup
├── puzzle/
│   ├── create/
│   │   └── page.tsx          # Puzzle creation page
│   ├── play/[id]/
│   │   └── page.tsx          # Puzzle player page
│   └── gallery/
│       └── page.tsx          # Puzzle gallery
├── globals.css               # Global styles + accessibility
└── layout.tsx                # Root layout

components/
├── PuzzleCanvas.tsx          # Canvas drawing component
└── InteractivePuzzlePiece.tsx # Draggable puzzle piece

convex/
├── schema.ts                 # Database schema
└── puzzles.ts                # Puzzle CRUD operations

hooks/
└── usePointerGestures.ts     # Custom gesture hook

lib/
├── types.ts                  # TypeScript types
├── stores/
│   └── puzzleStore.ts        # Zustand state management
└── utils/
    └── canvas.ts             # Canvas utilities
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Convex account ([convex.dev](https://convex.dev))
- OpenAI API key ([platform.openai.com](https://platform.openai.com))

### Installation

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Set up Convex**
   ```bash
   npx convex dev
   ```
   This will:
   - Prompt you to log in to Convex
   - Create a new project
   - Generate the deployment URL
   - Create `convex/_generated` files

3. **Configure Environment Variables**

   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   OPENAI_API_KEY=sk-your-openai-api-key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Convex Setup Details

If you encounter issues with Convex setup:

1. Make sure you're logged in:
   ```bash
   npx convex login
   ```

2. Initialize Convex:
   ```bash
   npx convex dev
   ```

3. The Convex dashboard will open - create a new project

4. Copy the deployment URL to your `.env.local` file

## 🎮 Usage Guide

### Creating a Puzzle

1. Click "Create Puzzle" from the home page
2. Upload an image (JPG, PNG, etc.)
3. Draw puzzle pieces by clicking and dragging on the canvas
   - Each closed shape becomes a puzzle piece
   - Pieces are automatically simplified for better performance
4. Click "Generate with AI" to create title and description
5. Edit metadata as needed
6. Click "Save & Play Puzzle"

### Playing a Puzzle

1. **Touch/Mouse**: Drag pieces to move them
2. **Keyboard**:
   - Select a piece by clicking it
   - Use arrow keys to move (Shift for faster movement)
   - Cmd/Ctrl+Z to undo
   - Cmd/Ctrl+Shift+Z to redo
3. **Snapping**: When a piece is close to its correct position, it will:
   - Show a green highlight
   - Snap and lock in place
   - Mark as completed with a checkmark
4. **Adjust Difficulty**: Use the snap sensitivity slider to make it easier or harder

## 🔧 Configuration

### Snap Tolerance
Adjust the snap tolerance in the player interface (default: 20px)

### AI Model
Change the OpenAI model in `app/actions/ai.ts`:
```typescript
model: "gpt-4o-mini", // or "gpt-4o" for better results
```

### Canvas Size
Modify max dimensions in `components/PuzzleCanvas.tsx`:
```typescript
const maxWidth = 800;
const maxHeight = 600;
```

## 🧪 Testing on Mobile

For the best experience, test on real devices:

1. **Development**:
   ```bash
   npm run dev -- --host
   ```
   Access via your local network IP

2. **Touch Gestures**: Test on mid-range Android (target device)

3. **Performance**: Check frame rate during drag operations

## 📦 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `OPENAI_API_KEY`
4. Deploy

### Other Platforms

Ensure Node.js 18+ runtime and set environment variables accordingly.

## 🎨 Design Decisions

### Color Scheme
- Purple-blue gradient for primary actions (educational, friendly)
- Soft pastels for backgrounds (reduces eye strain)
- High contrast text (WCAG AA compliant)

### Typography
- Geist Sans for clean, modern feel
- Generous spacing for touch targets (min 44x44px)
- Scalable font sizes for accessibility

### Animation
- Subtle scale effects on interaction
- Smooth transitions (200-300ms)
- Respects reduced-motion preference
- Confetti celebration on completion

## 🚧 Future Enhancements

- **Auto-Grid Generation**: Automatically split images into grid pieces
- **Difficulty Levels**: Preset snap tolerances and piece counts
- **Multiplayer**: Real-time collaborative puzzle solving
- **Timer & Leaderboard**: Competitive gameplay features
- **Piece Rotation**: Add rotation to pieces for more challenge
- **Zoom & Pan**: Canvas viewport manipulation for large puzzles
- **Share Links**: Share puzzles via URL
- **PWA**: Progressive Web App for offline capability
- **Sound Effects**: Audio feedback for actions

## 📝 License

MIT License - feel free to use this code for your own projects!

## 🙏 Acknowledgments

Built as a home assignment for TinyTap, demonstrating:
- Modern React patterns (RSC, Server Actions)
- High-performance web APIs (Canvas, Pointer Events)
- Complex state management (Zustand with history)
- AI integration (OpenAI Vision)
- Mobile-first UX principles
- Accessibility best practices

---

**Demo URL**: [To be deployed]

**Questions?** Contact Alex at TinyTap

**Repository**: [GitHub link]
