import OpenAI from 'openai';
import { UserProfile } from './db';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ContentAnalysis {
  interests?: string[];
  goals?: string[];
  preferences?: Record<string, any>;
  platforms?: string[];
  content_needs?: string[];
  timeline?: Array<{ event: string; date: string }>;
  context?: string[];
  mentioned_needs?: string[];
  key_topics?: string[];
}

export interface Recommendation {
  title: string;
  why: string;
  action: string;
  link?: string;
  type: 'product' | 'action' | 'resource' | 'preparation';
}

// Analyze content and extract insights
export async function analyzeContent(content: string): Promise<ContentAnalysis> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an intelligent assistant that analyzes text to extract actionable insights about a user.

Extract the following from the provided content:
- interests: topics, hobbies, or areas the user is interested in
- goals: things the user wants to accomplish or achieve
- preferences: specific likes, dislikes, or requirements mentioned
- platforms: social media platforms, tools, or technologies mentioned
- content_needs: types of content or resources the user needs
- timeline: upcoming events with dates (format as "event: date")
- context: general context about the user's situation or role
- mentioned_needs: specific things the user said they need to do or acquire
- key_topics: main subjects discussed in the content

Return ONLY a valid JSON object with these fields. Include only fields that have relevant information.
Be specific and actionable. If a date is mentioned, try to parse it. If it's relative (like "in March"), note that.`,
        },
        {
          role: 'user',
          content: `Analyze this content and extract insights:\n\n${content}`,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const result = completion.choices[0].message.content;
    return result ? JSON.parse(result) : {};
  } catch (error) {
    console.error('Error analyzing content:', error);
    throw error;
  }
}

// Merge new insights into existing profile intelligently
export function mergeProfile(
  existingProfile: UserProfile,
  newInsights: ContentAnalysis
): UserProfile {
  const merged: UserProfile = { ...existingProfile };

  // Merge arrays (deduplicate)
  const arrayFields: (keyof ContentAnalysis)[] = [
    'interests',
    'goals',
    'platforms',
    'content_needs',
    'context',
    'mentioned_needs',
    'key_topics',
  ];

  arrayFields.forEach((field) => {
    if (newInsights[field]) {
      const existing = (merged[field] as string[]) || [];
      const newItems = newInsights[field] as string[];
      merged[field] = [...new Set([...existing, ...newItems])];
    }
  });

  // Merge timeline (deduplicate by event name)
  if (newInsights.timeline) {
    const existingTimeline = merged.timeline || [];
    const timelineMap = new Map(
      existingTimeline.map((item) => [item.event.toLowerCase(), item])
    );

    newInsights.timeline.forEach((item) => {
      timelineMap.set(item.event.toLowerCase(), item);
    });

    merged.timeline = Array.from(timelineMap.values());
  }

  // Merge preferences (shallow merge)
  if (newInsights.preferences) {
    merged.preferences = {
      ...(merged.preferences || {}),
      ...newInsights.preferences,
    };
  }

  return merged;
}

// Generate recommendations based on full user profile and new content
export async function generateRecommendations(
  userProfile: UserProfile,
  latestContent: string,
  webSearchFunction?: (query: string) => Promise<string[]>
): Promise<Recommendation[]> {
  try {
    // First, get AI to suggest what recommendations would be helpful
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a proactive assistant that generates contextual, actionable recommendations for users based on their accumulated knowledge and latest activity.

Given a user's profile and their latest content, generate 3-5 specific, actionable recommendations.

Types of recommendations:
- product: Specific products or services they might need (be specific, suggest real brands/options)
- action: Things they should do based on their goals
- resource: Helpful articles, guides, or tools
- preparation: Things to prepare for upcoming events

For each recommendation, provide:
- title: Short, specific title (e.g., "Vertical Video Editing Tools" not just "Video Tools")
- why: One sentence explaining why this is relevant to THIS user (reference their specific context)
- action: Clear call-to-action
- search_query: If this recommendation could benefit from web search results (products, current deals, etc), provide a specific search query. Otherwise omit this field.
- type: one of: product, action, resource, preparation

Consider:
- Their goals and how to help achieve them
- Upcoming events on their timeline
- Their mentioned needs and interests
- How their latest content relates to their overall profile
- Be proactive - suggest things they might not have thought of yet

Return ONLY a valid JSON object with a "recommendations" array.`,
        },
        {
          role: 'user',
          content: `User Profile:\n${JSON.stringify(userProfile, null, 2)}\n\nLatest Content:\n${latestContent}\n\nGenerate recommendations:`,
        },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const result = completion.choices[0].message.content;
    const parsed = result ? JSON.parse(result) : { recommendations: [] };
    const recommendations: Recommendation[] = parsed.recommendations || [];

    // If web search function is provided, enhance recommendations with real links
    if (webSearchFunction) {
      for (const rec of recommendations) {
        if ((rec as any).search_query) {
          try {
            const links = await webSearchFunction((rec as any).search_query);
            if (links && links.length > 0) {
              rec.link = links[0]; // Use the top search result
            }
          } catch (error) {
            console.error('Web search failed for recommendation:', error);
          }
        }
      }
    }

    return recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
}
