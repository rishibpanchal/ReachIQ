# LOC8 - AI Outreach Intelligence Platform

A comprehensive AI-powered business intelligence and outreach platform combining real-time signal detection, growth prediction, and hyper-personalized engagement strategies.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Development Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd Royal_Flush_LOC8A2

# 2. Configure environment
cp .env.example .env
# Edit .env with your API keys (see ENV_SETUP.md)

# 3. Start application
docker-compose up --build

# 4. Access services
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

For detailed Docker instructions, see [DOCKER.md](DOCKER.md)

## 📁 Project Structure

```
Royal_Flush_LOC8A2/
├── Backend/              # Python FastAPI backend
│   ├── main.py          # Application entry point
│   ├── routes/          # API endpoints
│   └── services/        # Business logic & AI services
├── Frontend/            # React TypeScript frontend
│   ├── src/
│   │   ├── pages/       # Route pages
│   │   ├── components/  # Reusable components
│   │   └── services/    # API clients
│   └── package.json
├── supabase/            # Serverless functions
├── docker-compose.yml   # Development compose
├── .env.example         # Environment template (copy to .env)
├── ENV_SETUP.md        # Environment configuration guide
└── DOCKER.md           # Docker deployment guide
```

## 🔧 Configuration

All configuration is managed through a single `.env` file:

```bash
cp .env.example .env
# Edit .env with your actual API keys
```

**Key Components:**
- **Backend Config**: API settings, database, logging
- **Frontend Config**: API URL, Clerk auth, Supabase functions
- **Security**: Secret keys, allowed hosts, CORS
- **Integrations**: Clerk, Supabase, Anthropic, Gemini, Stripe, etc.

See [ENV_SETUP.md](ENV_SETUP.md) for detailed configuration instructions.

## 📚 Documentation

- **[ENV_SETUP.md](ENV_SETUP.md)** - Environment configuration guide
- **[DOCKER.md](DOCKER.md)** - Docker deployment & operations
- **[Backend/README.md](Backend/README.md)** - Backend API documentation
- **[Frontend/README.md](Frontend/README.md)** - Frontend application guide
- **[CHANGELIST.md](CHANGELIST.md)** - Version history and changes

## 🔑 API Keys Required

The application requires API keys from several services:

| Service | For | Get Key At |
|---------|-----|-----------|
| Clerk | Authentication | https://clerk.com |
| Supabase | Database & Functions | https://supabase.com |
| Anthropic | Content Generation | https://anthropic.com |
| Google Gemini | AI Capabilities | https://makersuite.google.com |
| Gnews | News Data | https://gnews.io |
| Stripe | Payments | https://stripe.com |
| Microsoft | 3rd-party Integrations | https://azure.microsoft.com |

See [ENV_SETUP.md](ENV_SETUP.md) for configuration details.

## 🐳 Docker Commands

```bash
# Development
docker-compose up --build          # Start with rebuild
docker-compose up                  # Start without rebuild
docker-compose logs -f             # View logs
docker-compose down                # Stop services

# Production
docker-compose up -d --build       # Start in background

# Debugging
docker-compose ps                  # See running containers
docker-compose exec backend bash   # Shell in backend
docker-compose logs backend        # Backend logs only
```

See [DOCKER.md](DOCKER.md) for more commands and operations.

## 🛠 Development

### Backend (Python/FastAPI)
- Location: `Backend/`
- Port: 8000
- Docs: [Backend/README.md](Backend/README.md)

```bash
# Install dependencies
pip install -r Backend/requirements.txt

# Run backend
cd Backend && python main.py
```

### Frontend (React/TypeScript)
- Location: `Frontend/`
- Port: 3000
- Docs: [Frontend/README.md](Frontend/README.md)

```bash
# Install dependencies
cd Frontend && npm install

# Run development server
npm run dev
```

## 🔍 Key Features

- **Real-time Signal Detection**: Identify buying signals from multiple data sources
- **Growth Prediction**: AI-powered growth trajectory analysis
- **Multi-channel Outreach**: Email, LinkedIn, SMS, WhatsApp support
- **AI Content Generation**: Hyper-personalized messaging with Claude & Gemini
- **Dashboard Analytics**: Real-time engagement metrics and insights
- **Webhook Support**: Integration with CRM and communication platforms

## 🚢 Deployment

### Production Checklist

1. Update `.env` for production (see `.env.prod.example`)
2. Set `DEBUG=false`
3. Generate new `SECRET_KEY`
4. Use production API keys (not development/test keys)
5. Update `ALLOWED_HOSTS` and `CORS_ORIGINS`
6. Deploy: `docker-compose up -d --build`

See [DOCKER.md](DOCKER.md) for detailed deployment instructions.

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port
lsof -i :3000  # Frontend
lsof -i :8000  # Backend

# Or use different ports in docker-compose.yml
```

### Docker Issues
```bash
# Clean up containers & volumes
docker-compose down -v
docker system prune -a

# Rebuild from scratch
docker-compose up --build --force-recreate
```

### Missing Environment Variables
- Ensure `.env` exists in root directory
- Check all required variables are populated
- Verify no syntax errors (no spaces around =)

See [DOCKER.md](DOCKER.md) and [ENV_SETUP.md](ENV_SETUP.md) for more troubleshooting.

## 📞 Support

For issues with:
- **Configuration**: See [ENV_SETUP.md](ENV_SETUP.md)
- **Docker**: See [DOCKER.md](DOCKER.md)
- **Backend**: See [Backend/README.md](Backend/README.md)
- **Frontend**: See [Frontend/README.md](Frontend/README.md)

## 📝 License

[Add your license here]

## 👥 Contributing

[Add contribution guidelines here]
