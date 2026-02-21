# Quick Setup Guide

## Installation Steps

1. **Navigate to the project directory:**
```bash
cd d:\ENGINEERING\Hackathon\LOC8\Frontend
```

2. **Install dependencies:**
```bash
npm install
```

This will install all required packages:
- React 18.2.0
- TypeScript 5.2.2
- TailwindCSS 3.4.1
- React Router v6.22.0
- React Query 5.20.5
- Zustand 4.5.0
- Recharts 2.12.0
- React Flow 11.10.4
- Framer Motion 11.0.3
- Axios 1.6.7
- And all other dependencies

3. **Start the development server:**
```bash
npm run dev
```

The app will be available at **http://localhost:3000**

## If npm install is stuck:

Press `Ctrl+C` to cancel, then:

```bash
# Clear cache
npm cache clean --force

# Try again
npm install
```

## Expected Behavior

After npm install completes, you should see all TypeScript errors disappear. The project is fully configured and ready to run.

## Features Ready to Use

✅ All 8 pages fully implemented
✅ Complete routing setup
✅ State management (React Query + Zustand)
✅ API service layer with mock data
✅ All UI components (shadcn/ui based)
✅ Charts and visualizations
✅ Responsive design
✅ Dark theme
✅ Animations
✅ Full TypeScript support

## Next Steps After Installation

1. Run `npm run dev`
2. Open http://localhost:3000
3. Explore all pages via the sidebar navigation
4. The app works with mock data by default
5. To connect to real backend, update `src/hooks/useApi.ts`

## Project Structure Highlights

- **9 Complete Pages** - Dashboard, Companies, Company Detail, Workflow, Content Generator, Signals, Conversations, Analytics, Settings
- **Modular Components** - Reusable UI components in components/ui
- **Type-Safe API Layer** - Full TypeScript coverage with proper types
- **Mock Data** - Comprehensive mock data for all features
- **State Management** - React Query for server state, Zustand for UI state

## Troubleshooting

If you see TypeScript errors in VS Code:
- Wait for npm install to complete
- Restart VS Code
- Run: TypeScript: Restart TS Server (Cmd/Ctrl + Shift + P)
