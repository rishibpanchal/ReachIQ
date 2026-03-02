# Backend - Python FastAPI Server

Production-grade Python/FastAPI backend providing AI-powered business intelligence, signal detection, and content generation APIs.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
python main.py

# Or with uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Access at `http://localhost:8000`
API Docs at `http://localhost:8000/docs`

## Project Structure

```
Backend/
├── main.py                 # FastAPI app entry point
├── requirements.txt        # Python dependencies
├── routes/                 # API endpoints
│   ├── __init__.py
│   ├── analytics.py        # Analytics endpoints
│   ├── companies.py        # Company management
│   ├── dashboard.py        # Dashboard data
│   ├── news.py             # News data endpoints
│   └── ...
├── services/               # Business logic
│   ├── __init__.py
│   ├── database.py         # Database client
│   └── growth_prediction/  # ML/AI services
│       ├── channel_predictor.py
│       ├── growth_model.py
│       ├── growth_pipeline.py
│       ├── priority_weighting.py
│       ├── probability_engine.py
│       ├── sequence_builder.py
│       └── sequence_optimizer.py
├── Dockerfile              # Container definition
└── dummy.py                # Development utilities
```

## Technology Stack

- **FastAPI** - Modern web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **SQLAlchemy** - ORM (optional)
- **Python 3.11** - Runtime
- **Supabase** - PostgreSQL database
- **Anthropic Claude** - Content generation
- **Google Gemini** - AI capabilities

## Key Features

### APIs

- **Dashboard**: Real-time metrics and KPIs
- **Companies**: Company data management and search
- **Analytics**: Engagement metrics and trends
- **News**: News data integration (via Gnews API)
- **Growth Prediction**: ML-powered growth forecasting
- **Content Generation**: AI-driven message creation

### Services

#### Growth Prediction Pipeline
- **Channel Predictor**: Predicts success by channel
- **Growth Model**: Trend analysis and forecasting
- **Growth Pipeline**: Orchestrates full prediction workflow
- **Priority Weighting**: Scores and ranks leads
- **Probability Engine**: Success probability calculation
- **Sequence Builder**: Creates outreach sequences
- **Sequence Optimizer**: Optimizes engagement timing

#### Integrations
- **Supabase**: PostgreSQL + serverless functions
- **Clerk**: Authentication (via API key)
- **Gnews**: News data and signals
- **Anthropic Claude**: Content generation
- **Google Gemini**: AI analysis
- **Stripe**: Payment processing (optional)

## Configuration

### Environment Variables

All configuration via `.env` file:

```bash
# Python
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1

# API
DEBUG=false
API_TITLE=PolyDeal API
API_VERSION=1.0.0
HOST=0.0.0.0
PORT=8000
LOG_LEVEL=INFO

# Security
SECRET_KEY=your_secret_key_here
ALLOWED_HOSTS=localhost,127.0.0.1,nginx,backend

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# APIs
CLERK_API_KEY=your_clerk_key
GNEWS_API_KEY=your_gnews_key
ANTHROPIC_API_KEY=your_anthropic_key
GEMINI_API_KEY=your_gemini_key
STRIPE_API_KEY=your_stripe_key (optional)
MICROSOFT_API_KEY=your_microsoft_key (optional)

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost
CORS_CREDENTIALS=true
```

See [../ENV_SETUP.md](../ENV_SETUP.md) for complete configuration.

## Development

### Setup Environment

```bash
# Create virtual environment
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Run Development Server

```bash
python main.py
```

Or with auto-reload:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### API Documentation

**Interactive Docs**: http://localhost:8000/docs
**Alternative Docs**: http://localhost:8000/redoc

Powered by Swagger UI and ReDoc.

## API Endpoints

### Dashboard
```
GET /api/dashboard/stats    - Overall statistics
GET /api/dashboard/signals  - Recent signals
GET /api/dashboard/trends   - Trend analysis
```

### Companies
```
GET    /api/companies        - List all companies
POST   /api/companies        - Create company
GET    /api/companies/{id}   - Get company details
PUT    /api/companies/{id}   - Update company
DELETE /api/companies/{id}   - Delete company
GET    /api/companies/search - Search companies
```

### Analytics
```
GET /api/analytics/engagement  - Engagement metrics
GET /api/analytics/channels    - Channel performance
GET /api/analytics/trends      - Trend analysis
```

### News
```
GET /api/news/latest           - Latest news
GET /api/news/company/{id}     - Company-specific news
GET /api/news/search           - Search news
```

### Growth Prediction
```
POST /api/growth-prediction    - Predict growth
GET  /api/growth-prediction/{id} - Get prediction details
```

## Growth Prediction Engine

### Overview

Multi-stage pipeline for lead scoring and growth forecasting:

1. **Data Collection**: Gathers company signals and metrics
2. **Channel Prediction**: Predicts success by outreach channel
3. **Growth Analysis**: Analyzes growth trends and trajectories
4. **Priority Weighting**: Scores and ranks opportunities
5. **Sequence Building**: Creates optimal outreach sequences
6. **Optimization**: Fine-tunes timing and messaging

### Key Components

**Channel Predictor**
- Analyzes historical channel performance
- Predicts success probability by channel
- Recommends primary/secondary channels

**Growth Model**
- Forecasts company growth trajectory
- Identifies growth inflection points
- Calculates growth confidence scoring

**Priority Weighting**
- Scores leads based on composite factors
- Ranks opportunities for outreach
- Identifies high-value targets

**Probability Engine**
- Calculates conversion probabilities
- Factors in multiple signals
- Provides confidence scores

**Sequence Builder**
- Creates multi-touch sequences
- Optimizes message timing
- Personalizes by channel

## Database (Supabase)

### Tables

Key tables in PostgreSQL:

- `companies` - Company profiles and metadata
- `signals` - Detection signals and triggers
- `buyers` - Buyer/contact information
- `conversations` - Communication history
- `outreach` - Outreach campaign data
- `analytics` - Metrics and analytics

### Edge Functions

Serverless functions deployed to Supabase:

- `generate-content` - AI content generation endpoint

See `supabase/functions/` for source code.

## Authentication

### API Key Authentication

Most endpoints use API key from `.env`:

```python
from fastapi import Depends
from fastapi.security import HTTPBearer

security = HTTPBearer()

@app.get("/protected")
def protected(credentials = Depends(security)):
    # Validate and use credentials
    pass
```

### Clerk Integration

User authentication via Clerk:

```python
# Verify Clerk token in requests
# Token provided by frontend after auth
```

## Error Handling

### Standard Response Format

Success (200):
```json
{
  "success": true,
  "data": { ... }
}
```

Error (4xx/5xx):
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Performance & Optimization

### Caching

```python
from fastapi_cache import cache

@app.get("/companies")
@cache(expire=300)  # Cache for 5 minutes
def get_companies():
    pass
```

### Async Operations

```python
@app.get("/async-task")
async def async_task():
    # Run async operations
    result = await expensive_operation()
    return result
```

### Database Optimization

- Proper indexing on frequently queried fields
- Connection pooling for database connections
- Query optimization for large datasets

## Testing

### Unit Tests

```bash
# Run tests
pytest tests/

# With coverage
pytest --cov=routes tests/
```

### Integration Tests

Test full API workflows and database interactions.

### Manual Testing

Use FastAPI interactive docs:
1. Navigate to http://localhost:8000/docs
2. Try out endpoints
3. View request/response examples

## Deployment

### Docker Deployment

See [../DOCKER.md](../DOCKER.md) for full deployment guide.

### Environment for Production

```bash
DEBUG=false
LOG_LEVEL=WARNING
SECRET_KEY=your_strong_production_secret
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ORIGINS=https://yourdomain.com
```

### Health Checks

```bash
# API is healthy
curl http://localhost:8000/docs

# Custom health endpoint
curl http://localhost:8000/health
```

### Monitoring

Monitor with:
- Docker stats: `docker stats loc8-backend`
- Logs: `docker-compose logs -f backend`
- APM tools: Sentry, DataDog, New Relic

## Troubleshooting

### Module Not Found

```bash
# Reinstall requirements
pip install -r requirements.txt --force-reinstall

# Check Python version (need 3.11+)
python --version
```

### Database Connection Issues

```bash
# Check Supabase credentials in .env
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Test connection
python -c "from services.database import SupabaseDB; db = SupabaseDB()"
```

### Port Already in Use

```bash
# Use different port
uvicorn main:app --port 8001

# Or kill process on port 8000
lsof -i :8000
kill -9 <PID>
```

### API Returns 500 Errors

```bash
# Check logs
docker-compose logs -f backend

# Check if all required env vars are set
python -c "import os; print({k: v for k, v in os.environ.items() if k.startswith('SUPABASE') or k.startswith('ANTHROPIC')})"
```

## Dependencies

Key packages:

```
fastapi              - Web framework
uvicorn              - ASGI server
pydantic             - Data validation
python-multipart     - Form data handling
sqlalchemy           - ORM (optional)
psycopg2-binary      - PostgreSQL adapter
supabase             - Supabase client
anthropic            - Claude API client
google-generativeai  - Gemini API client
requests             - HTTP client
python-dotenv        - Environment loading
pytz                 - Timezone support
```

See `requirements.txt` for complete list.

## Performance Benchmarks

- API response time: <100ms (avg)
- Database query time: <50ms (avg)
- Growth prediction: <1s
- Content generation: <2s (with Claude)

## Support

For help with:
- **Configuration**: [../ENV_SETUP.md](../ENV_SETUP.md)
- **Docker**: [../DOCKER.md](../DOCKER.md)
- **Frontend**: [../Frontend/README.md](../Frontend/README.md)
- **Main Project**: [../README.md](../README.md)
