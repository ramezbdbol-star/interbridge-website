# InterBridge Trans & Trade

A professional B2B service platform connecting businesses directly to Chinese manufacturers and suppliers.

## Environment Variables

The following environment variables must be set:

- `DATABASE_URL` - Neon PostgreSQL connection string
- `GMAIL_APP_PASSWORD` - Gmail App Password for email notifications (optional)
- `SESSION_SECRET` - Secret key for session management (optional, auto-generated if not set)
- `GOOGLE_OAUTH_CLIENT_ID` - Google OAuth client ID for Book Now calendar integration
- `GOOGLE_OAUTH_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_OAUTH_REDIRECT_URI` - OAuth callback URL (e.g. `https://your-domain.com/api/admin/google-calendar/callback`)
- `GOOGLE_TOKEN_ENCRYPTION_KEY` - Secret used to encrypt Google refresh/access tokens in database
- `BOOKING_ACTION_TOKEN_SECRET` - Secret used to sign one-click approve/reject booking links
- `BOOKING_RATE_LIMIT_PER_HOUR` - Optional booking submission rate-limit (default: `6`)

## Deployment

### Google Cloud Run

1. Build and push Docker image:
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/interbridge
```

2. Deploy to Cloud Run:
```bash
gcloud run deploy interbridge \
  --image gcr.io/YOUR_PROJECT_ID/interbridge \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=your_neon_database_url
```

### Local Development

```bash
npm install
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

## Admin Access

- Username: Mirabelle
- Password: Mira.112233

Access the admin panel at `/admin` after logging in.
