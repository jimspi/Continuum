import { sql } from '@vercel/postgres';

export interface UserProfile {
  interests?: string[];
  goals?: string[];
  preferences?: Record<string, any>;
  platforms?: string[];
  content_needs?: string[];
  timeline?: Array<{ event: string; date: string }>;
  context?: string[];
  [key: string]: any;
}

export interface Memory {
  id: number;
  user_id: string;
  content: string;
  analysis: any;
  recommendations: any;
  created_at: Date;
}

// Get or create user in database
export async function ensureUser(clerkUserId: string, email?: string) {
  try {
    const result = await sql`
      INSERT INTO users (clerk_user_id, email)
      VALUES (${clerkUserId}, ${email || null})
      ON CONFLICT (clerk_user_id) DO UPDATE SET email = EXCLUDED.email
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error ensuring user:', error);
    throw error;
  }
}

// Get user profile (user-scoped)
export async function getUserProfile(userId: string): Promise<UserProfile> {
  try {
    const result = await sql`
      SELECT profile_json FROM profile
      WHERE user_id = ${userId}
    `;

    if (result.rows.length === 0) {
      // Create default profile if doesn't exist
      await sql`
        INSERT INTO profile (user_id, profile_json)
        VALUES (${userId}, ${JSON.stringify({})})
      `;
      return {};
    }

    return result.rows[0].profile_json as UserProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

// Update user profile (user-scoped)
export async function updateUserProfile(userId: string, profileData: UserProfile) {
  try {
    const result = await sql`
      INSERT INTO profile (user_id, profile_json, updated_at)
      VALUES (${userId}, ${JSON.stringify(profileData)}, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        profile_json = ${JSON.stringify(profileData)},
        updated_at = NOW()
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Create memory (user-scoped)
export async function createMemory(
  userId: string,
  content: string,
  analysis: any,
  recommendations: any
) {
  try {
    const result = await sql`
      INSERT INTO memories (user_id, content, analysis, recommendations, created_at)
      VALUES (${userId}, ${content}, ${JSON.stringify(analysis)}, ${JSON.stringify(recommendations)}, NOW())
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error creating memory:', error);
    throw error;
  }
}

// Get user memories (user-scoped)
export async function getUserMemories(userId: string, limit = 10): Promise<Memory[]> {
  try {
    const result = await sql`
      SELECT * FROM memories
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return result.rows as Memory[];
  } catch (error) {
    console.error('Error getting user memories:', error);
    throw error;
  }
}

// Get single memory (user-scoped)
export async function getMemory(userId: string, memoryId: number) {
  try {
    const result = await sql`
      SELECT * FROM memories
      WHERE id = ${memoryId} AND user_id = ${userId}
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error getting memory:', error);
    throw error;
  }
}
