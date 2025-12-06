# IntelliHire Deployment Guide for Render

This guide will help you deploy IntelliHire to Render.com with both backend and frontend.

## Prerequisites

- GitHub repository with your code
- Render account (free tier available at render.com)
- Environment variables ready (API keys, secrets, etc.)

## Backend Deployment (Flask API)

### Step 1: Prepare Your Repository

Make sure these files exist in your `backend/` directory:
- ✅ `requirements.txt` - Python dependencies
- ✅ `Procfile` - Tells Render how to start the app
- ✅ `runtime.txt` - Specifies Python version
- ✅ `render.yaml` - Render configuration (optional)

### Step 2: Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

   ```
   Name: intellihire-backend
   Region: Choose closest to you
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn app:app --bind 0.0.0.0:$PORT --workers 4
   ```

### Step 3: Set Environment Variables

Add these environment variables in Render dashboard:

```
FLASK_ENV=production
JWT_SECRET_KEY=<generate-a-secure-random-string>
GEMINI_API_KEY=<your-gemini-api-key>
AZURE_API_KEY=<your-azure-api-key>
DATABASE_URL=<will-be-auto-set-by-render-postgres>
FRONTEND_URL=<your-frontend-url-after-deployment>
```

**To generate JWT_SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Step 4: Add PostgreSQL Database

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:
   ```
   Name: intellihire-db
   Database: intellihire
   User: intellihire_user
   Region: Same as your web service
   Plan: Free
   ```
3. After creation, copy the **Internal Database URL**
4. Add it to your web service as `DATABASE_URL` environment variable

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy
3. Once deployed, you'll get a URL like: `https://intellihire-backend.onrender.com`

### Step 6: Test Your Backend

Visit your backend URL and test:
- `https://your-app.onrender.com/` - Should show API info
- `https://your-app.onrender.com/health` - Should show health status

---

## Frontend Deployment (React)

### Option 1: Deploy to Render (Static Site)

1. Go to Render Dashboard → **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:
   ```
   Name: intellihire-frontend
   Branch: main
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: build
   ```

4. **Add Environment Variables:**
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com
   ```

5. Click **"Create Static Site"**

### Option 2: Deploy to Vercel (Recommended for React)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow prompts and set environment variable:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com
   ```

### Option 3: Deploy to Netlify

1. Go to [Netlify](https://netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect GitHub repository
4. Configure:
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/build
   ```
5. Add environment variable: `REACT_APP_API_URL`

---

## Update Frontend API Configuration

Update your frontend API configuration to use the deployed backend URL:

**File: `frontend/src/services/api.js`**

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

---

## Post-Deployment Checklist

- [ ] Backend health check responding: `/health`
- [ ] Database connected successfully
- [ ] Frontend can connect to backend API
- [ ] CORS configured correctly (backend allows frontend origin)
- [ ] Environment variables set correctly
- [ ] File uploads working (if using)
- [ ] Authentication flow working
- [ ] Test key features: job creation, interviews, reports

---

## Important Notes

### Free Tier Limitations (Render)
- **Backend**: Sleeps after 15 minutes of inactivity (takes 30-60s to wake up)
- **Database**: 90-day expiry on free PostgreSQL (backup your data!)
- **Build Minutes**: 500 minutes/month free

### Cost Considerations
- Free tier is good for development/testing
- For production, consider paid plans ($7-25/month)

### Database Migration
Your local MySQL database needs to be migrated to PostgreSQL for Render:

1. Export your MySQL data
2. Convert to PostgreSQL format
3. Import to Render PostgreSQL

Or use a MySQL hosting service like:
- PlanetScale (free tier)
- Railway (with MySQL)
- ClearDB (Heroku addon)

---

## Troubleshooting

### Issue: Backend not starting
- Check logs in Render dashboard
- Verify `requirements.txt` has all dependencies
- Ensure `Procfile` has correct start command

### Issue: Database connection failed
- Verify `DATABASE_URL` environment variable
- Check if database is running in Render
- Update SQLAlchemy connection string format

### Issue: CORS errors
- Add frontend URL to CORS origins in `app.py`
- Ensure both http and https URLs are allowed

### Issue: Build fails
- Check Python version in `runtime.txt`
- Verify all dependencies have compatible versions
- Check build logs for specific errors

---

## Next Steps

1. Set up custom domain (optional)
2. Configure SSL certificate (auto with Render)
3. Set up monitoring and logging
4. Configure auto-deploy from GitHub
5. Set up staging environment

## Support

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Your GitHub Issues: https://github.com/OmerKhan24/IntelliHire/issues

---

**Happy Deploying! 🚀**
