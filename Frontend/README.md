# Frontend - AI Outreach Intelligence Dashboard

React/TypeScript frontend application using Vite, providing real-time dashboards, analytics, and outreach management.

## Quick Start

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Access at `http://localhost:3000`

## Project Structure

```
Frontend/
├── src/
│   ├── pages/              # Route pages
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── Analytics.tsx   # Analytics view
│   │   ├── Companies.tsx   # Company management
│   │   └── ...
│   ├── components/         # Reusable components
│   │   ├── dashboard/      # Dashboard components
│   │   ├── charts/         # Chart components
│   │   ├── analytics/      # Analytics components
│   │   └── ui/             # UI primitives
│   ├── services/           # API clients
│   │   ├── api.ts          # Main API client
│   │   └── mockData.ts     # Mock data for dev
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Auth management
│   ├── hooks/              # Custom hooks
│   ├── types/              # TypeScript types
│   ├── lib/                # Utilities
│   ├── App.tsx             # Main component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## Key Features

- **Dashboard**: Real-time signal monitoring, company analytics, engagement metrics
- **Analytics**: Multi-channel tracking, performance metrics, trend analysis
- **Management**: Company database, buyer profiles, outreach campaigns
- **Content Generation**: AI-powered message creation with multi-channel support
- **Authentication**: Clerk integration for user management
- **Real-time Data**: Supabase integration for live updates

## Technology Stack

- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool (lightning fast)
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Navigation
- **Clerk** - Authentication
- **Supabase JS** - Database client
- **Recharts** - Charts & visualization

## Configuration

### Environment Variables

Create `.env` from `.env.example`:

```bash
# Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key

# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api      # Dev
# VITE_API_BASE_URL=/api                          # Prod

# Supabase Functions
VITE_SUPABASE_FUNCTION_URL=your_function_url

# Development
VITE_USE_MOCK_DATA=false
```

For complete configuration, see [../ENV_SETUP.md](../ENV_SETUP.md)

## Development

### Install & Run

```bash
npm install
npm run dev
```

Features:
- Hot module reload (HMR)
- TypeScript compilation
- Tailwind CSS processing
- Fast refresh

### Build

```bash
npm run build
```

Outputs optimized build to `dist/` directory.

### Code Quality

```bash
npm run lint
npx tsc --noEmit
```

## API Integration

### Using API Client

```typescript
import { api } from '@/services/api'

// GET request
const companies = await api.get('/companies')

// POST request (auth token auto-added)
const result = await api.post('/companies', data)
```

### Mock Data for Development

Enable in `.env`:
```bash
VITE_USE_MOCK_DATA=true
```

## Authentication (Clerk)

1. Get API key from https://clerk.com
2. Add to `.env`: `VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx`
3. Login is handled automatically in `src/main.tsx`

Protected routes use `useAuth()` hook:
```typescript
import { useAuth } from '@clerk/clerk-react'

function Component() {
  const { isSignedIn } = useAuth()
  return isSignedIn ? <Content /> : <SignIn />
}
```

## Routes

| Route | Component | Auth Required |
|-------|-----------|---------------|
| `/` | LandingPage | No |
| `/login` | Login | No |
| `/dashboard` | Dashboard | Yes |
| `/analytics` | Analytics | Yes |
| `/companies` | Companies | Yes |
| `/company/:id` | CompanyDetail | Yes |
| `/conversations` | Conversations | Yes |

## Production Deployment

### Environment Setup

```bash
VITE_API_BASE_URL=/api              # Relative path
VITE_CLERK_PUBLISHABLE_KEY=pk_live_ # Production key
VITE_USE_MOCK_DATA=false            # Disable mocks
```

### Build Size

- Main bundle: ~1.3MB (minified)
- CSS: ~68KB (gzipped)

### Docker Deployment

Deployed via Docker. See [../DOCKER.md](../DOCKER.md) for details.

## Troubleshooting

### Port Already in Use
```bash
npm run dev -- --port 3001
```

### API Not Connecting
1. Check backend is running: `curl http://localhost:8000/docs`
2. Verify `VITE_API_BASE_URL` in `.env`
3. Check backend CORS settings

### Authentication Errors
1. Verify `VITE_CLERK_PUBLISHABLE_KEY` in `.env`
2. Confirm key in Clerk dashboard
3. Clear browser cache: `localStorage.clear()`

### Build Fails
```bash
rm -rf node_modules dist
npm install
npm run build
```

## Performance Tips

- Use `React.lazy()` for route components
- Compress images before adding
- Bundle analysis: `npm run build -- --analyze`
- Set cache headers in production
- Use CDN for static assets in production

## Dependencies

See `package.json` for complete list. Key packages:
- `react` - UI framework
- `vite` - Build tool
- `typescript` - Type safety
- `tailwindcss` - Styling
- `axios` - HTTP client
- `@clerk/clerk-react` - Auth
- `recharts` - Charts
- `@supabase/supabase-js` - DB client

## Support

For help with:
- **Configuration**: [../ENV_SETUP.md](../ENV_SETUP.md)
- **Docker**: [../DOCKER.md](../DOCKER.md)
- **Backend API**: [../Backend/README.md](../Backend/README.md)
- **Main Project**: [../README.md](../README.md)
