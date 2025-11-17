# Continuum Mobile Companion Mode

## Overview

Phase 2 adds a full-featured mobile companion mode that transforms Continuum into a proactive, voice-enabled AI assistant that learns from your daily activities and provides contextual recommendations.

## Features

### 1. Progressive Web App (PWA)

Continuum can be installed as a native app on mobile devices:

- **Install on Home Screen**: Add to your phone's home screen for instant access
- **Offline Support**: View cached profile and recommendations without internet
- **Background Sync**: Voice recordings sync automatically when online
- **App-like Experience**: Full-screen mode without browser UI
- **Fast Loading**: Service worker caches key resources

#### Installation

1. Open Continuum in your mobile browser
2. Look for the install prompt or use "Add to Home Screen"
3. Click "Install" to add the app icon
4. Launch Continuum like any other app

### 2. Voice Capture

Three recording modes to fit your workflow:

#### Manual Mode (Recommended)
- **How it works**: Tap the microphone button when you want to capture a thought
- **Best for**: Quick notes, specific insights, intentional capture
- **Battery impact**: Minimal
- **Example**: "Just finished listening to the Huberman Lab podcast on sleep"

#### Periodic Mode
- **How it works**: Automatically records 30-second clips every 10 minutes
- **Best for**: Passive capture during meetings, commutes, or work sessions
- **Battery impact**: Moderate
- **Example**: Captures ambient conversation about projects you're working on

#### Continuous Mode (Opt-in)
- **How it works**: Always listening and recording
- **Best for**: Full-day capture when you want maximum context
- **Battery impact**: High (use with charger)
- **Privacy**: Requires explicit opt-in, processes locally first

### 3. Auto-Analysis & Transcription

Every voice note is:
1. **Transcribed** using OpenAI Whisper (highly accurate, multilingual)
2. **Analyzed** for insights, goals, interests, and context
3. **Merged** into your evolving profile
4. **Used** to generate proactive recommendations

#### Example Flow

**You say**: "I need to prepare for my presentation on Q1 marketing results next Tuesday"

**Continuum extracts**:
- Goal: Prepare presentation
- Timeline: Next Tuesday
- Context: Marketing, Q1 results
- Needs: Presentation preparation

**Profile updates with**:
- Added to timeline: "Presentation - Next Tuesday"
- Context: Marketing professional, Q1 focus
- Mentioned needs: Presentation tools

**Recommendations generated**:
- Presentation templates for marketing data
- Data visualization tools
- Public speaking preparation tips

### 4. Context-Aware Recommendations

Continuum detects specific contexts from your voice notes and generates hyper-relevant recommendations:

#### Detected Contexts

| Context | Triggers | Recommendation Examples |
|---------|----------|------------------------|
| **Morning Routine** | "morning", "wake up", "breakfast" | Coffee shops nearby, morning routine apps, breakfast delivery |
| **Podcast Consumer** | "podcast", "listening to" | Similar podcasts, podcast apps, related topics |
| **Fitness Activity** | "workout", "exercise", "gym" | Workout gear, fitness apps, recovery products (foam rollers, supplements) |
| **Work Meeting** | "meeting", "call", "presentation" | Agenda templates, productivity tools, relevant background info |
| **Fatigue** | "tired", "exhausted", "sleep" | Sleep tracking apps, supplements (magnesium, melatonin), relaxation techniques |
| **Coffee** | "coffee", "cafe" | Local cafes, coffee subscriptions, brewing equipment |
| **Reading** | "reading", "book" | Book recommendations, reading apps, related articles |
| **Travel Planning** | "travel", "trip", "flight" | Packing lists, travel gear, destination guides |
| **Cooking** | "cook", "recipe", "dinner" | Recipe apps, cooking tools, ingredient delivery |

#### Time-Based Context

Recommendations also consider the time of day:
- **Morning (5am-12pm)**: Breakfast spots, coffee, productivity tools
- **Afternoon (12pm-5pm)**: Lunch options, energy snacks
- **Evening (5pm-9pm)**: Dinner recipes, entertainment
- **Night (9pm-5am)**: Wind-down activities, sleep aids

#### Priority Levels

Each recommendation has a priority:
- **High**: Urgent or time-sensitive (e.g., event tomorrow)
- **Medium**: Relevant but not urgent (e.g., mentioned interest)
- **Low**: Nice to have (e.g., general suggestions)

### 5. Push Notifications

Get proactive recommendations when you need them:

#### Setup
1. Go to Settings (or the notification toggle in your profile)
2. Enable "Proactive Notifications"
3. Grant browser permission when prompted

#### Notification Types

**Context-Based**:
- "Morning coffee? Here are 3 cafes near you" (morning + location)
- "You mentioned podcasts - try 'The Knowledge Project'" (podcast context)
- "Workout detected - recovery tips inside" (fitness activity)

**Goal-Based**:
- "Your Japan trip is in 2 weeks - packing checklist ready"
- "Q1 presentation tomorrow - visualization tools"

**Timeline-Based**:
- "Event in 1 hour - preparation suggestions"
- "Weekly review: 5 new insights this week"

### 6. Offline Capabilities

Continuum works even without internet:

**What works offline**:
- View cached profile data
- Record voice notes (saved locally, synced when online)
- Browse previously loaded recommendations
- Access the app interface

**What requires connection**:
- Voice transcription (OpenAI Whisper)
- Generating new recommendations
- Web search for product links
- Profile synchronization

**Background Sync**:
- Recordings are saved locally
- Automatically uploaded when connection returns
- No data loss even if offline for days

## Technical Implementation

### Architecture

```
User speaks/types
    ↓
Voice Capture (Web Audio API)
    ↓
Transcription (OpenAI Whisper)
    ↓
Content Analysis (GPT-4)
    ↓
Context Detection (pattern matching + AI)
    ↓
Profile Update (intelligent merge)
    ↓
Recommendation Generation (GPT-4 + context)
    ↓
Web Search (Brave/Serper for links)
    ↓
Push Notification (if enabled)
```

### Service Worker

- **Offline caching**: Static assets, app shell
- **Background sync**: Queued recordings
- **Push notifications**: FCM or Web Push
- **Update management**: New version notifications

### Security & Privacy

- **User isolation**: All data scoped to userId (Clerk)
- **Local processing**: Voice recorded locally first
- **Encrypted transmission**: HTTPS for all API calls
- **Data deletion**: Cascade delete on user removal
- **Audio retention**: Transcribed audio not permanently stored (configurable)
- **Opt-in only**: Continuous mode requires explicit consent

## Use Cases

### Daily Companion
Sarah uses Continuum in periodic mode during her workday:
- **9am**: Mentions morning coffee → Gets local cafe recommendations
- **10am**: "Meeting with design team about app redesign"
  - Profile: Working on app redesign
  - Recommendation: UI design tools, competitor apps
- **2pm**: "Need to hire a freelance illustrator"
  - Recommendation: Upwork links, illustration portfolio sites
- **5pm**: "Thinking about dinner, maybe Thai food"
  - Recommendation: Thai restaurants nearby, recipe for Pad Thai

### Podcast Learner
Mike listens to podcasts during commute:
- Says: "Just listened to Huberman Lab on sleep optimization"
- Continuum learns: Interested in neuroscience, health, sleep
- Recommendations:
  - Similar podcasts (Andrew Huberman episodes, Peter Attia)
  - Sleep tracking apps (Whoop, Oura Ring)
  - Books on sleep science
  - Magnesium supplements

### Fitness Enthusiast
Emma uses voice capture at the gym:
- "Great workout today, focusing on strength training"
- Profile updated: Fitness activity, strength training interest
- Recommendations:
  - Strength training programs
  - Protein powder deals
  - Fitness tracking apps
  - Recovery tools (foam roller, massage gun)

### Travel Planner
David is planning a trip:
- "Booked flights to Tokyo for March 15-25"
- Profile: Timeline updated with trip dates
- Immediate recommendations:
  - JR Pass deals (time-sensitive)
  - Tokyo restaurant guides
  - Packing list for March weather
- Follow-up (2 weeks before):
  - Lightweight luggage options
  - Travel adapters
  - Offline maps

## Configuration

### Environment Variables

Add to `.env.local`:

```bash
# Voice Transcription (Required)
OPENAI_API_KEY=sk-...

# Push Notifications (Optional)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...

# PWA Settings (Optional)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Generating VAPID Keys (for Push Notifications)

```bash
npx web-push generate-vapid-keys
```

Copy the keys to your environment variables.

## API Reference

### Transcription Endpoint

**POST** `/api/transcribe`

Transcribes audio to text using OpenAI Whisper.

**Body**: `FormData`
- `audio`: Audio file (webm, mp3, wav)

**Response**:
```json
{
  "success": true,
  "text": "Transcribed text here",
  "userId": "user_abc123"
}
```

### Notifications Endpoint

**POST** `/api/notifications`

Manages push notification subscriptions.

**Body**: `JSON`
```json
{
  "action": "subscribe" | "unsubscribe" | "send",
  "subscription": PushSubscription,
  "title": "Notification title",
  "body": "Notification body",
  "url": "/path/to/recommendation"
}
```

## Browser Compatibility

### Required Features
- Service Workers (Chrome 40+, Firefox 44+, Safari 11.1+)
- Web Audio API (all modern browsers)
- Push API (Chrome 42+, Firefox 44+, Safari 16+)
- Notifications API (all modern browsers)

### Best Experience
- **Chrome/Edge**: Full support
- **Safari (iOS)**: PWA support, limited push notifications
- **Firefox**: Full support
- **Samsung Internet**: Full support

## Battery Optimization

To minimize battery drain:

1. **Use Manual Mode** when possible
2. **Periodic Mode** for meetings/commutes only
3. **Continuous Mode** only when plugged in
4. **Disable notifications** when not needed
5. **Clear cache** periodically to reduce storage

## Troubleshooting

### Voice recording not working
- Check microphone permissions in browser settings
- Ensure HTTPS (required for microphone access)
- Try a different browser

### Transcription failing
- Verify `OPENAI_API_KEY` is set correctly
- Check audio file size (max 25MB for Whisper)
- Ensure audio is clear and in supported format

### Notifications not appearing
- Grant notification permission in browser
- Check notification settings are enabled
- Verify service worker is registered
- For iOS Safari: Add to home screen first

### App not installing
- Must be HTTPS (or localhost)
- manifest.json must be valid
- Icons must be accessible
- Try force refresh (Cmd+Shift+R)

## Future Enhancements

- **Geolocation**: Location-based recommendations
- **Calendar integration**: Automatic event detection
- **Wearable sync**: Apple Watch, Fitbit integration
- **Multi-language**: Support for non-English transcription
- **Voice shortcuts**: Custom triggers ("Hey Continuum...")
- **Sharing**: Share recommendations with friends
- **Analytics**: Personal insights dashboard

## Privacy & Data

- Voice recordings are processed then deleted
- Transcriptions stored with user data
- All data encrypted in transit and at rest
- No third-party sharing
- User can export or delete all data anytime
- GDPR compliant

## Support

For issues with mobile features:
- Check browser console for errors
- Review service worker registration
- Verify all environment variables are set
- See main [README.md](./README.md) for general setup
