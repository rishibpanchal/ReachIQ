# Environment Configuration Guide

This project requires a single `.env` configuration file with all API keys and settings for the entire application (Backend, Frontend, Database, Services). All sensitive information has been removed from the repository - you'll provide your own configuration via the `.env` file.

## Quick Setup (Development)

### 1. Create Environment File

```bash
# Copy the template
cp .env.example .env

# Edit with your actual API keys and configuration
# Use any text editor or:
# - Linux/Mac: nano .env
# - Windows: type .env (in VSCode)
```

### 2. Configure API Keys

Edit `.env` and replace placeholder values with your actual credentials (see "Required API Keys" section below)

### 3. Start Application

```bash
docker-compose up --build
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Quick Setup (Production)

### 1. Create Production Environment

```bash
# Start with the template
cp .env.example .env

# Review production settings guide
cat .env.prod.example
```

### 2. Update Production Values

Edit `.env` with your production configuration:

```bash
# Security - Generate strong secret
openssl rand -base64 32  # Copy output to SECRET_KEY

# Update for production
DEBUG=false
VITE_API_BASE_URL=/api  # Use relative path
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Use PRODUCTION API keys (not development/test keys!)
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_API_KEY=sk_live_xxxxx
# ... all other API keys should be production credentials
```

For detailed production settings, see `.env.prod.example`

### 3. Deploy

```bash
docker-compose up -d --build
```

## Required API Keys & Services

The following services are used and require API keys:

### Authentication
- **Clerk**: Multi-purpose authentication
  - `VITE_CLERK_PUBLISHABLE_KEY` (Frontend)
  - `CLERK_API_KEY` (Backend)
  - Sign up at: https://clerk.com

### Content & Intelligence
- **Anthropic Claude**: Content generation
  - `ANTHROPIC_API_KEY`
  - `ANTHROPIC_ADMIN_API_KEY`
  - Sign up at: https://anthropic.com
  
- **Google Gemini**: AI capabilities
  - `GEMINI_API_KEY`
  - Sign up at: https://makersuite.google.com/

### Data & APIs
- **Gnews API**: News data
  - `GNEWS_API_KEY`
  - Sign up at: https://gnews.io

- **Stripe**: Payment processing
  - `STRIPE_API_KEY`
  - Sign up at: https://stripe.com

- **Microsoft**: Integrations (Teams, Outlook, etc.)
  - `MICROSOFT_API_KEY`
  - Sign up at: https://azure.microsoft.com

### Database & Backend Services
- **Supabase**: PostgreSQL database + serverless functions
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - Sign up at: https://supabase.com
  - Deploy functions from `supabase/functions/` directory

### Security
- **SECRET_KEY**: Generate a random secret for the backend
  ```bash
  # Generate on Linux/Mac:
  openssl rand -base64 32
  
  # Or use Python:
  python -c 'import secrets; print(secrets.token_urlsafe(32))'
  ```

## File Structure

### `.env.example` (Master Template)
- **Location**: Root directory
- **Purpose**: Template with all configuration variables for the entire application
- **Usage**: Copy to `.env` and fill in your values
- **Variables**: Includes settings for Backend, Frontend, Database, Security, and all integrations

### `.env.prod.example` (Production Reference)
- **Location**: Root directory  
- **Purpose**: Shows which variables to change for production
- **Usage**: Reference this when configuring `.env` for production deployment

### `.env` (Your Configuration - NOT in git)
- **Location**: Root directory (created by you)
- **Purpose**: Your actual configuration with real API keys
- **Protection**: Automatically excluded from git by `.gitignore`
- **Never commit**: This file is in `.gitignore` for security

## Deployment

### Development (Local Docker)

```bash
# 1. Create .env file
cp .env.example .env

# 2. Edit .env with your development API keys
nano .env  # or use your editor

# 3. Start containers
docker-compose up --build
```

**Services:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Nginx Proxy: http://localhost

### Production

```bash
# 1. Create production .env
cp .env.example .env

# 2. Update for production (see .env.prod.example)
# Key changes:
# - DEBUG=false
# - Generate new SECRET_KEY
# - Update ALLOWED_HOSTS with your domain
# - Use PRODUCTION API keys (pk_live_, sk_live_ prefixes)
# - Set VITE_API_BASE_URL=/api
# - Update CORS_ORIGINS

# 3. Deploy
docker-compose up -d --build

# 4. Verify
docker-compose ps
docker-compose logs -f backend
```

**Environment Variables by Service:**

| Variable | Service | Required |
|----------|---------|----------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Frontend | ✅ |
| `CLERK_API_KEY` | Backend | ✅ |
| `SUPABASE_URL` | Backend/Functions | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend/Functions | ✅ |
| `ANTHROPIC_API_KEY` | Backend/Frontend | ✅ |
| `GEMINI_API_KEY` | Backend | ✅ |
| `GNEWS_API_KEY` | Backend | ✅ |
| `STRIPE_API_KEY` | Backend | ❌ (optional) |
| `MICROSOFT_API_KEY` | Backend | ❌ (optional) |
| `SECRET_KEY` | Backend | ✅ |
| `VITE_API_BASE_URL` | Frontend | ✅ |

## Security Best Practices

1. **Never commit .env files** - Already configured in `.gitignore`
2. **Use environment variables** - All sensitive data should be in `.env` files
3. **Rotate keys regularly** - Especially for production
4. **Use strong secrets** - Generate random `SECRET_KEY` values
5. **Restrict permissions** - Keep `.env` files readable only by the app
6. **Use managed services** - Never store backups unencrypted

## Troubleshooting

### Missing Environment Variables
- Error: `Missing VITE_CLERK_PUBLISHABLE_KEY`
  - Solution: Add key to `Frontend/.env`

### API Connection Errors
- Check that Backend and Frontend `.env` files have correct `VITE_API_BASE_URL`
- In development: use `http://localhost:8000/api`
- In production: use `/api` (proxied through Nginx)

### Database Connection Errors
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check Supabase project settings

## Support

For any configuration issues:
1. Check that all required API keys are generated
2. Verify `.env` file syntax (no extra spaces or quotes)
3. Check that `PYTHONUNBUFFERED=1` is set for proper logging
4. Review Docker logs: `docker-compose logs -f`
