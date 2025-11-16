# Quick Setup Guide

## Prerequisites

1. **Node.js 18+** installed
2. **Convex account** at [convex.dev](https://convex.dev)
3. **OpenAI API key** from [platform.openai.com](https://platform.openai.com)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Convex

```bash
npx convex dev
```

This will:
- Open your browser to log in to Convex
- Create a new project (or select existing)
- Generate `convex/_generated` files
- Start the Convex development server
- Provide your deployment URL

Keep this terminal window open - it needs to stay running.

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-url.convex.cloud
OPENAI_API_KEY=sk-your-openai-api-key-here
```

Replace:
- `your-deployment-url` with the URL from the Convex dev output
- `sk-your-openai-api-key-here` with your actual OpenAI API key

### 4. Start Development Server

In a **new terminal** (keep Convex dev running):

```bash
npm run dev
```

### 5. Open the App

Navigate to [http://localhost:3000](http://localhost:3000)

## Important Notes

### Build Without Convex

The production build (`npm run build`) will fail if Convex environment variables are not set. This is expected behavior because:

1. The app uses Convex React hooks which require a client at build time
2. Convex needs to be properly configured before building

**To build for production:**
1. Make sure `NEXT_PUBLIC_CONVEX_URL` is set in `.env.local`
2. Run `npx convex deploy` to deploy your Convex functions
3. Then run `npm run build`

### Fallback to localStorage

If Convex is not configured, the app will automatically fall back to using `localStorage` for puzzle storage. This means:
- ✅ You can still create and play puzzles locally
- ❌ Puzzles won't sync across devices
- ❌ AI features won't work without OpenAI API key

### Development Workflow

**Terminal 1:** Convex dev server
```bash
npx convex dev
```

**Terminal 2:** Next.js dev server
```bash
npm run dev
```

Both need to be running for full functionality.

## Troubleshooting

### "Module not found: Can't resolve '@/convex/_generated/api'"

**Solution:** Run `npx convex dev` to generate the Convex API files.

### "Could not find Convex client!"

**Solution:** Check that `NEXT_PUBLIC_CONVEX_URL` is set in `.env.local` and restart the dev server.

### "OpenAI API error"

**Solution:** Verify your `OPENAI_API_KEY` is correct in `.env.local`. Make sure it starts with `sk-`.

### Build fails

**Solution:** Ensure Convex is properly configured (see "Build Without Convex" section above).

## Features to Test

1. **Create Puzzle**
   - Upload an image
   - Draw 3-5 custom shapes
   - Click "Generate with AI"
   - Save the puzzle

2. **Play Puzzle**
   - Drag pieces with mouse/touch
   - Try keyboard arrow keys
   - Test undo/redo (Cmd/Ctrl+Z)
   - Adjust snap tolerance
   - Complete the puzzle

3. **Gallery**
   - View all created puzzles
   - Click to play any puzzle

## Deployment to Vercel

1. Push code to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `OPENAI_API_KEY`
4. Run `npx convex deploy --prod` to deploy Convex to production
5. Update `NEXT_PUBLIC_CONVEX_URL` in Vercel with production URL
6. Deploy

## Support

For Convex issues: [docs.convex.dev](https://docs.convex.dev)
For Next.js issues: [nextjs.org/docs](https://nextjs.org/docs)
For OpenAI issues: [platform.openai.com/docs](https://platform.openai.com/docs)
