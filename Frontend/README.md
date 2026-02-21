# PolyDeal - AI Outreach Intelligence Engine

A production-grade, scalable frontend dashboard for PolyDeal's AI Outreach Intelligence Engine built with React, TypeScript, TailwindCSS, and shadcn/ui.

## 🚀 Features

### Pages & Functionality

1. **Dashboard Overview**
   - Executive summary with key metrics
   - Intent distribution charts
   - Channel effectiveness analysis
   - Success rate trends
   - Recent companies table

2. **Companies**
   - Advanced data table with search, filter, and sort
   - Pagination support
   - Click-through to detailed company view

3. **Company Intelligence Detail**
   - Intent score gauge chart
   - Signal contribution analysis
   - Multiple tabs: Intelligence Overview, Signals, AI Strategy, Generated Content
   - Copy and send functionality for messages

4. **Workflow Builder**
   - Visual node-based workflow builder using React Flow
   - Real-time workflow status
   - Simulate workflow functionality
   - Step-by-step workflow details

5. **Content Generator**
   - AI-powered content generation
   - Generate LinkedIn, Email, and WhatsApp messages
   - Copy, regenerate, and send functionality

6. **Signal Monitor**
   - Real-time signal feed
   - Signal strength indicators
   - Multi-source signal tracking (Hiring, LinkedIn, News, Engagement)

7. **Conversations**
   - WhatsApp-style chat UI
   - Real-time messaging
   - Conversation search
   - Message status tracking

8. **Analytics**
   - Comprehensive performance metrics
   - Multiple chart types
   - Industry and signal performance analysis

9. **Settings**
   - Profile management
   - Notification preferences
   - API configuration
   - Security settings

## 🛠️ Tech Stack

- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **React Query (TanStack Query)** - Data fetching and caching
- **Zustand** - Lightweight state management
- **Recharts** - Charting library
- **React Flow** - Node-based workflow visualization
- **Framer Motion** - Animation library
- **Axios** - HTTP client
- **React Router v6** - Routing solution
- **Vite** - Build tool

## 📦 Installation

1. **Clone or navigate to the project directory**

```bash
cd d:\ENGINEERING\Hackathon\LOC8\Frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
Frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/          # Layout components (Sidebar, Navbar)
│   │   ├── charts/          # Reusable chart components
│   │   └── cards/           # Card components
│   ├── pages/               # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Companies.tsx
│   │   ├── CompanyDetail.tsx
│   │   ├── Workflow.tsx
│   │   ├── ContentGenerator.tsx
│   │   ├── Signals.tsx
│   │   ├── Conversations.tsx
│   │   ├── Analytics.tsx
│   │   └── Settings.tsx
│   ├── services/
│   │   ├── api.ts           # API service layer
│   │   └── mockData.ts      # Mock data for development
│   ├── store/               # Zustand state management
│   ├── hooks/               # Custom React hooks
│   │   └── useApi.ts        # API hooks with React Query
│   ├── types/               # TypeScript type definitions
│   ├── lib/                 # Utility functions
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── tailwind.config.js       # Tailwind config
├── vite.config.ts           # Vite config
└── README.md                # This file
```

## 🔌 API Integration

The application is configured to connect to a FastAPI backend at `http://localhost:8000/api`.

### API Endpoints

- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/companies` - List of companies
- `GET /api/company/{id}` - Company details
- `GET /api/signals` - Signal feed
- `GET /api/workflow/{companyId}` - Workflow data
- `POST /api/content/generate` - Generate content
- `GET /api/conversations` - Conversations list
- `POST /api/conversations/{id}/messages` - Send message

### Mock Data

The application includes comprehensive mock data for development and testing. To switch between mock and real API:

Edit `src/hooks/useApi.ts` and change:
```typescript
const USE_MOCK_DATA = false  // Change to false to use real API
```

## 🎨 UI/UX Features

- **Dark Theme** - Professional dark mode by default
- **Responsive Design** - Works on desktop, tablet, and laptop
- **Animations** - Smooth page transitions and hover effects using Framer Motion
- **Modular Components** - Reusable, well-structured components
- **Type Safety** - Full TypeScript coverage
- **Performance Optimized** - Lazy loading, memoization, and efficient rendering

## 🚀 Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` folder.

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Proxy Configuration

The Vite config includes a proxy to forward `/api` requests to the backend:

```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
}
```

## 🎯 Key Features

### State Management
- **React Query** for server state (API data)
- **Zustand** for UI state (sidebar, filters, selections)

### Performance
- Lazy loading of pages
- React.memo for expensive components
- Pagination for large datasets
- Debounced search
- Optimized re-renders

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Consistent code style
- Modular architecture
- Clean component structure

## 🐛 Troubleshooting

### Installation Issues
If you encounter issues during installation:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Build Issues
If the build fails:

1. Check TypeScript errors: `npm run build -- --mode development`
2. Verify all dependencies are installed
3. Check for missing imports

### Runtime Issues
1. Verify the backend API is running
2. Check browser console for errors
3. Ensure correct API endpoint configuration

## 📚 Documentation

For more detailed information about specific components or features, refer to the inline comments in the source code.

## 🤝 Contributing

This is a production-ready codebase. When making changes:

1. Maintain TypeScript type safety
2. Follow the existing code structure
3. Add proper error handling
4. Test all features thoroughly
5. Update documentation as needed

## 📄 License

This project is part of PolyDeal's AI Outreach Intelligence Engine.

## 🔗 Related Projects

- Backend: FastAPI backend service (to be integrated)

---

Built with ❤️ using React, TypeScript, and modern web technologies.
