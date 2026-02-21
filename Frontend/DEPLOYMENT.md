# Deployment Guide

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Environment Variables**
Add in Vercel dashboard:
- `VITE_API_BASE_URL`: Your production API URL

### Option 2: Netlify

1. **Install Netlify CLI**
```bash
npm i -g netlify-cli
```

2. **Build**
```bash
npm run build
```

3. **Deploy**
```bash
netlify deploy --prod --dir=dist
```

### Option 3: Docker

**Dockerfile:**
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Build and run:**
```bash
docker build -t ai-outreach-frontend .
docker run -p 3000:80 ai-outreach-frontend
```

### Option 4: AWS S3 + CloudFront

1. **Build**
```bash
npm run build
```

2. **Upload to S3**
```bash
aws s3 sync dist/ s3://your-bucket-name
```

3. **Configure CloudFront** to point to S3 bucket

## 🔧 Pre-Deployment Checklist

- [ ] Update API base URL in environment variables
- [ ] Set `USE_MOCK_DATA = false` in `src/hooks/useApi.ts`
- [ ] Test all API endpoints
- [ ] Check responsive design on all devices
- [ ] Test on multiple browsers
- [ ] Optimize images and assets
- [ ] Enable proper error tracking
- [ ] Set up monitoring
- [ ] Configure CORS on backend
- [ ] Test production build locally: `npm run build && npm run preview`

## 🌐 Environment Configuration

### Development
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCK_DATA=true
```

### Production
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_USE_MOCK_DATA=false
```

## 📊 Performance Optimization

Already implemented:
- ✅ Code splitting
- ✅ Lazy loading routes
- ✅ React.memo for expensive components
- ✅ Pagination
- ✅ Query caching with React Query

Additional optimizations:
- Consider adding service worker for offline support
- Add image optimization
- Implement virtual scrolling for large lists
- Add bundle analyzer: `npm install --save-dev rollup-plugin-visualizer`

## 🔒 Security Considerations

1. **API Security**
   - Implement proper authentication
   - Use HTTPS only
   - Store tokens securely
   - Implement CSRF protection

2. **Content Security Policy**
   Add to `index.html`:
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
   ```

3. **Environment Variables**
   - Never commit .env files
   - Use different keys for dev/prod
   - Rotate API keys regularly

## 📈 Monitoring & Analytics

Consider adding:
- Google Analytics or Plausible
- Error tracking (Sentry, LogRocket)
- Performance monitoring (Web Vitals)
- User analytics

## 🧪 Testing Before Deployment

```bash
# Run linter
npm run lint

# Build production
npm run build

# Preview production build
npm run preview
```

Visit http://localhost:4173 and test all features.

## 🔄 CI/CD Pipeline Example (GitHub Actions)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📝 Post-Deployment Tasks

1. Test all pages in production
2. Verify API connections
3. Check console for errors
4. Test on real devices
5. Monitor performance
6. Set up error tracking
7. Document any issues
8. Create user documentation

## 🆘 Troubleshooting Production Issues

**White screen:**
- Check browser console for errors
- Verify API base URL is correct
- Check network tab for failed requests

**API errors:**
- Verify backend is running
- Check CORS configuration
- Verify API keys/tokens

**Slow performance:**
- Check bundle size
- Verify CDN is working
- Check for memory leaks
- Monitor network requests

## 📞 Support

For deployment issues:
1. Check logs in deployment platform
2. Verify environment variables
3. Test API endpoints manually
4. Check browser compatibility

---

**Ready to deploy!** Choose your preferred deployment method and follow the steps above.
