# ReachIQ - AI Outreach Intelligence Engine

A production-grade, enterprise SaaS platform for AI-powered outreach intelligence and analytics. ReachIQ dynamically predicts optimal outreach channels, builds personalized sequences, and provides comprehensive growth curve predictions using machine learning.

## 🚀 Features

- **Dynamic Channel Prediction**: ML-powered prediction of top 2 outreach channels based on company profile
- **Growth Curve Analytics**: Probabilistic modeling of response rates across outreach sequences
- **Intent Scoring**: Real-time intent calculation from multiple signal sources
- **Signal Intelligence**: Aggregation of hiring, LinkedIn, news, and engagement signals
- **Interactive Dashboard**: Real-time visualization of metrics and analytics
- **Content Generation**: AI-powered content creation for LinkedIn, Email, and WhatsApp
- **Workflow Builder**: Visual node-based workflow orchestration
- **Company Intelligence**: Detailed company profiles with AI-driven insights

## 📋 Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **Python 3.11+** - Modern Python with type hints
- **NumPy** - Numerical computing for ML predictions
- **Uvicorn** - ASGI server for production
- **Scikit-learn** - Machine learning models

### Frontend
- **React 18** - Modern UI framework with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **TanStack Query** - Data fetching and caching
- **Zustand** - Lightweight state management
- **Recharts** - Interactive charts and visualizations
- **React Flow** - Node-based workflow visualization

### Infrastructure
- **Docker** - Containerization for all services
- **Nginx** - Reverse proxy and static file serving
- **Docker Compose** - Multi-container orchestration

## 🏗️ Project Structure

```
Development/
├── Backend/                      # FastAPI application
│   ├── routes/                  # API route handlers
│   │   ├── analytics.py         # Growth curve endpoints
│   │   ├── companies.py         # Company data endpoints
│   │   ├── dashboard.py         # Dashboard statistics
│   │   └── news.py              # News API integration
│   ├── services/                # Business logic
│   │   ├── database.py          # Data access layer
│   │   └── growth_prediction/   # ML prediction engine
│   │       ├── channel_predictor.py    # Channel prediction
│   │       ├── growth_model.py         # ML model manager
│   │       ├── probability_engine.py   # Probability computation
│   │       ├── sequence_builder.py     # Sequence generation
│   │       ├── sequence_optimizer.py   # Optimal stopping
│   │       ├── priority_weighting.py   # Channel weighting
│   │       └── growth_pipeline.py      # End-to-end orchestration
│   ├── main.py                  # Application entry point
│   ├── requirements.txt         # Python dependencies
│   └── Dockerfile               # Backend container
│
├── Frontend/                     # React application
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── analytics/       # Analytics visualizations
│   │   │   ├── layout/          # Layout components
│   │   │   ├── charts/          # Chart components
│   │   │   └── ui/              # shadcn/ui components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API clients
│   │   ├── hooks/               # Custom React hooks
│   │   ├── store/               # State management
│   │   └── types/               # TypeScript definitions
│   ├── package.json             # Node dependencies
│   ├── vite.config.ts           # Vite configuration
│   └── Dockerfile               # Frontend container
│
├── docker-compose.yml           # Development orchestration
├── docker-compose.prod.yml      # Production orchestration
├── nginx.conf                   # Nginx configuration
└── DOCKER_QUICKSTART.md         # Docker deployment guide
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (for containerized deployment)

### Option 1: Docker (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd Development
```

2. **Start all services**
```bash
docker-compose up --build
```

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

See [DOCKER_QUICKSTART.md](DOCKER_QUICKSTART.md) for detailed Docker deployment instructions.

### Option 2: Local Development

#### Backend Setup

1. **Navigate to Backend directory**
```bash
cd Backend
```

2. **Create virtual environment**
```bash
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment**
```bash
# Create .env file with your configuration
cp ../.env.prod.example .env
# Edit .env with your API keys
```

5. **Run the server**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

1. **Navigate to Frontend directory**
```bash
cd Frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
# Create .env file
cp .env.example .env
# Edit .env with your configuration
```

4. **Start development server**
```bash
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:5173 (or port shown in terminal)
- Backend API: http://localhost:8000

## 🔑 Environment Variables

### Backend (.env)
```bash
DEBUG=false
PYTHONUNBUFFERED=1
GNEWS_API_KEY=your_gnews_api_key_here
```

### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:8000/api
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
```

**Important**: Never commit `.env` files to git. Use `.env.example` or `.env.prod.example` as templates.

## 📡 API Endpoints

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/growth-curve/{company_id}` - Growth curve prediction
- `POST /api/analytics/growth-curve/custom` - Custom prediction

### Companies
- `GET /api/companies` - List all companies
- `GET /api/companies/{company_id}` - Company details
- `GET /api/companies/{company_id}/signals` - Company signals

### News
- `GET /api/news/{company_id}` - Company news feed

For full API documentation, visit: http://localhost:8000/docs

## 🧪 Testing

### Backend Tests
```bash
cd Backend
pytest
```

### Frontend Tests
```bash
cd Frontend
npm test
```

## 📦 Production Deployment

### Docker Production

1. **Build production images**
```bash
docker-compose -f docker-compose.prod.yml build
```

2. **Start production services**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

#### Backend
```bash
cd Backend
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### Frontend
```bash
cd Frontend
npm run build
# Serve the dist/ folder with nginx or any static file server
```

## 📚 Documentation

- [DOCKER_QUICKSTART.md](DOCKER_QUICKSTART.md) - Docker setup and deployment guide
- [Frontend/README.md](Frontend/README.md) - Frontend-specific documentation
- [Frontend/DEPLOYMENT.md](Frontend/DEPLOYMENT.md) - Frontend deployment options
- [Backend/ENHANCED_OUTREACH_ENGINE.md](Backend/ENHANCED_OUTREACH_ENGINE.md) - Dynamic channel prediction system
- [Backend/GROWTH_PREDICTION_README.md](Backend/GROWTH_PREDICTION_README.md) - Growth curve prediction system
- [Backend/IMPLEMENTATION_GUIDE.md](Backend/IMPLEMENTATION_GUIDE.md) - Backend implementation guide

## 🏛️ Architecture

### Backend Architecture
- **Routes Layer**: HTTP request handling and validation
- **Services Layer**: Business logic and ML predictions
- **Data Layer**: Mock database with 100 sample companies
- **ML Pipeline**: Channel prediction → Sequence building → Priority weighting → Growth modeling

### Frontend Architecture
- **Component-based**: Modular React components with TypeScript
- **State Management**: Zustand for global state, TanStack Query for server state
- **Routing**: React Router v6 for navigation
- **Styling**: TailwindCSS with shadcn/ui components

### Key Features
- **No Hardcoded Channels**: All channels dynamically predicted by ML
- **Priority Weighting**: Channel effectiveness scores influence probabilities
- **Optimal Stopping**: Mathematical optimization for sequence length
- **Real-time Updates**: WebSocket-ready architecture for live data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Known Issues & Troubleshooting

### Common Issues

1. **Port already in use**
   - Change ports in `docker-compose.yml` or `.env` files
   - Kill existing processes: `docker-compose down`

2. **Python dependencies fail**
   - Ensure Python 3.11+ is installed
   - Try: `pip install --upgrade pip setuptools wheel`

3. **Frontend build fails**
   - Clear cache: `npm cache clean --force`
   - Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

4. **CORS errors**
   - Check `VITE_API_BASE_URL` in Frontend `.env`
   - Verify CORS settings in `Backend/main.py`

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation in `/docs` folder
- Review API docs at http://localhost:8000/docs

---

**Built with ❤️ for intelligent outreach**
