# Continuum - Intelligent Memory Platform

A minimal, elegant memory platform that learns from uploaded content and provides proactive, contextual recommendations.

## Features

- **User Authentication**: Secure sign-in with Clerk (Google or email)
- **Content Upload & Analysis**: Support for text files (.txt, .md), PDFs, and direct text input
- **Evolving User Profile**: Single JSON profile per user that grows with each upload
- **Proactive Recommendations**: AI-generated contextual recommendations based on your complete history
- **Complete Data Isolation**: Each user's data is completely separate and secure

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Authentication**: Clerk
- **Database**: Vercel Postgres
- **AI**: OpenAI GPT-4
- **Web Search**: Brave or Serper API
- **Styling**: Tailwind CSS

## Project Structure

```
/app
  /page.tsx                     # Main dashboard (protected)
  /sign-in/[[...sign-in]]/      # Clerk sign-in page
  /sign-up/[[...sign-up]]/      # Clerk sign-up page
  /actions.ts                   # Server actions
  /layout.tsx                   # Root layout with Clerk provider
  /globals.css                  # Global styles

/lib
  /openai.ts                    # OpenAI client & analysis functions
  /db.ts                        # Database queries (user-scoped)
  /search.ts                    # Web search utility

/components
  /UploadZone.tsx              # File upload & text input
  /ProfileView.tsx             # User profile display
  /RecommendationsList.tsx     # AI recommendations display

/db
  /schema.sql                  # Database schema

/middleware.ts                 # Clerk authentication protection
```

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the required environment variables:

#### Clerk Authentication

1. Sign up at [Clerk](https://clerk.com)
2. Create a new application
3. Copy your publishable and secret keys
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

#### OpenAI API

1. Sign up at [OpenAI](https://platform.openai.com)
2. Create an API key
3. Add to `.env.local`:
   ```
   OPENAI_API_KEY=sk-...
   ```

#### Vercel Postgres

**Option A: Deploy to Vercel (Recommended)**

1. Push your code to GitHub
2. Import to Vercel
3. Add Vercel Postgres storage
4. Environment variables will be set automatically

**Option B: Local Development**

1. Create a Vercel account
2. Install Vercel CLI: `npm i -g vercel`
3. Link your project: `vercel link`
4. Pull environment variables: `vercel env pull .env.local`

#### Web Search API (Choose One)

**Brave Search API** (Recommended):

1. Sign up at [Brave Search API](https://brave.com/search/api/)
2. Get your API key
3. Add to `.env.local`:
   ```
   BRAVE_API_KEY=...
   ```

**OR Serper API**:

1. Sign up at [Serper](https://serper.dev)
2. Get your API key
3. Add to `.env.local`:
   ```
   SERPER_API_KEY=...
   ```

### 3. Set Up Database

Run the database migration:

```bash
# If using Vercel Postgres
npm run db:setup
```

Or manually execute the SQL in `db/schema.sql` in your Vercel Postgres dashboard.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Sign In**: Create an account or sign in with Google
2. **Upload Content**:
   - Drag and drop files (.txt, .md, .pdf)
   - Or paste text directly
   - Click "Analyze"
3. **View Profile**: Your evolving profile appears on the right
4. **Get Recommendations**: AI generates contextual recommendations after each upload
5. **Continuous Learning**: Your profile grows smarter with each interaction

## Database Schema

```sql
-- Users table
CREATE TABLE users (
  clerk_user_id TEXT PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Profile table (one per user, evolving JSON)
CREATE TABLE profile (
  user_id TEXT PRIMARY KEY REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  profile_json JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Memories table (all uploaded content)
CREATE TABLE memories (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  analysis JSONB,
  recommendations JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Add Vercel Postgres storage
5. Deploy!

The app will automatically run the database setup on first deployment.

## Design Philosophy

- **Clean & Professional**: White/light backgrounds, modern sans-serif fonts
- **No Clutter**: Maximum 12 files in the entire project
- **User Isolation**: All queries filtered by userId
- **Proactive Intelligence**: Recommendations surprise users with relevant suggestions
- **Persistent Memory**: Profile grows smarter over days/weeks/months

## Example User Journey

**Day 1**: Sarah uploads meeting notes mentioning "hire video editor" and "Japan trip in March"
- Profile captures goals and timeline
- Recommendations: Video editor hiring platforms, Japan travel prep

**Day 5**: Sarah adds "focus on TikTok and Instagram Reels, need vertical video"
- Profile updates to specify vertical video needs
- Recommendations: TikTok-specialized video editors, Reels templates

**Day 30**: Sarah uploads "Booked Japan flights! March 15-25, need restaurant recommendations"
- System recognizes timeline event approaching
- Recommendations: Tokyo restaurant guides, packing tips, lightweight luggage

## License

MIT
