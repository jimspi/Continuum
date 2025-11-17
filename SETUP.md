# Continuum Setup Guide

## Quick Start

This guide will help you set up Continuum locally or deploy it to Vercel.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Clerk account (free)
- OpenAI API key
- Vercel account (for database and deployment)
- Brave or Serper API key (optional but recommended for web search)

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Fill in the required values:

#### Clerk Authentication

1. Go to [https://clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Choose "Next.js" as your framework
4. Copy your keys from the Clerk dashboard:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

#### OpenAI API

1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to `OPENAI_API_KEY`

**Note**: You'll need billing enabled on your OpenAI account to use GPT-4.

#### Vercel Postgres

For local development, you have two options:

**Option A: Use Vercel CLI (Recommended)**

```bash
# Install Vercel CLI globally
npm i -g vercel

# Link your project
vercel link

# Pull environment variables (includes database URL)
vercel env pull .env.local
```

**Option B: Create a Vercel Postgres Database**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project or select existing one
3. Go to Storage tab
4. Create a new Postgres database
5. Copy the `POSTGRES_URL` to your `.env.local`

#### Web Search API (Choose One)

**Option A: Brave Search (Recommended)**

1. Go to [https://brave.com/search/api/](https://brave.com/search/api/)
2. Sign up for API access
3. Get your API key
4. Add to `.env.local`: `BRAVE_API_KEY=...`

**Option B: Serper**

1. Go to [https://serper.dev](https://serper.dev)
2. Sign up for API access
3. Get your API key
4. Add to `.env.local`: `SERPER_API_KEY=...`

### 3. Set Up Database

Run the database setup script:

```bash
npm run db:setup
```

This will create the necessary tables in your Vercel Postgres database.

**Manual Setup**: If the script doesn't work, you can manually run the SQL in `db/schema.sql` in your Vercel Postgres dashboard.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 3. Configure Environment Variables

Add all environment variables from `.env.local` in the Vercel dashboard:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `OPENAI_API_KEY`
- `BRAVE_API_KEY` or `SERPER_API_KEY`

### 4. Add Postgres Storage

1. In your Vercel project, go to the "Storage" tab
2. Click "Create Database"
3. Select "Postgres"
4. Create the database
5. It will automatically add `POSTGRES_URL` to your environment

### 5. Deploy

Click "Deploy" and Vercel will:
- Build your application
- Set up the database
- Deploy to production

### 6. Set Up Database Schema

After first deployment, run the database setup:

```bash
# Connect to your Vercel project
vercel link

# Run setup
npm run db:setup
```

Or manually execute the SQL in `db/schema.sql` through the Vercel Postgres dashboard.

## Verifying Your Setup

### Test Authentication

1. Visit your app URL
2. You should be redirected to Clerk sign-in
3. Sign up with Google or email
4. You should be redirected to the dashboard

### Test Content Analysis

1. Click the upload zone or paste text
2. Add some content (e.g., "I want to learn React and build a project")
3. Click "Analyze"
4. Your profile should update with interests
5. You should see recommendations

### Check Database

Verify data is being stored:

```bash
# Connect to Vercel
vercel env pull .env.local

# Check tables exist
psql $POSTGRES_URL -c "SELECT * FROM users LIMIT 5;"
```

## Troubleshooting

### "Unauthorized" errors

- Make sure Clerk environment variables are correct
- Clear browser cookies and try signing in again
- Check that middleware is working by viewing `/middleware.ts`

### OpenAI API errors

- Verify your API key is correct
- Make sure you have billing enabled
- Check your usage limits at [platform.openai.com](https://platform.openai.com)

### Database connection errors

- Verify `POSTGRES_URL` is set correctly
- Make sure tables are created (run `npm run db:setup`)
- Check Vercel Postgres dashboard for connection issues

### Build failures

- Run `npm run build` locally first to catch errors
- Check that all dependencies are installed
- Verify TypeScript compiles: `npx tsc --noEmit`

## Architecture Overview

```
Continuum/
├── app/
│   ├── page.tsx              # Main dashboard (protected)
│   ├── actions.ts            # Server actions for data operations
│   ├── layout.tsx            # Root layout with Clerk provider
│   ├── globals.css           # Global styles
│   ├── sign-in/              # Clerk sign-in page
│   └── sign-up/              # Clerk sign-up page
├── components/
│   ├── UploadZone.tsx        # File upload & text input UI
│   ├── ProfileView.tsx       # Display user profile
│   └── RecommendationsList.tsx # Show AI recommendations
├── lib/
│   ├── db.ts                 # Database operations (user-scoped)
│   ├── openai.ts             # AI analysis & recommendations
│   └── search.ts             # Web search integration
├── db/
│   └── schema.sql            # PostgreSQL schema
├── scripts/
│   └── setup-db.js           # Database setup script
└── middleware.ts             # Clerk authentication middleware
```

## Key Features

### Complete User Isolation

All database queries are filtered by `userId` from Clerk:
- Users can only see their own data
- No cross-user data leakage
- Automatic data deletion when user is deleted

### Intelligent Profile Updates

The AI merges new insights into existing profile:
- Deduplicates similar entries
- Combines related information
- Preserves historical context

### Proactive Recommendations

After each upload, the system:
1. Analyzes the new content
2. Updates the user profile
3. Considers the full user history
4. Generates contextual recommendations
5. Searches the web for relevant links

### Persistent Memory

User profiles grow over time:
- Day 1: Basic interests and goals
- Day 30: Rich context with timeline, preferences, needs
- Day 90+: Comprehensive understanding for highly personalized suggestions

## Next Steps

- Customize the UI in `app/page.tsx` and components
- Adjust AI prompts in `lib/openai.ts`
- Add more profile fields in the database schema
- Implement memory timeline view
- Add export/import functionality

## Support

For issues or questions:
- Check the main [README.md](./README.md)
- Review [Clerk documentation](https://clerk.com/docs)
- Review [Next.js documentation](https://nextjs.org/docs)
- Review [Vercel Postgres documentation](https://vercel.com/docs/storage/vercel-postgres)
