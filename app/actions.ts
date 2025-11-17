'use server';

import { auth } from '@clerk/nextjs/server';
import {
  ensureUser,
  getUserProfile,
  updateUserProfile,
  createMemory,
  getUserMemories,
  type UserProfile,
} from '@/lib/db';
import {
  analyzeContent,
  generateRecommendations,
  mergeProfile,
  type Recommendation,
} from '@/lib/openai';
import { searchWeb } from '@/lib/search';

// Ensure user is authenticated and return userId
async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

// Initialize or get user
export async function initializeUser() {
  const userId = await requireAuth();
  const authData = await auth();

  await ensureUser(
    userId,
    authData.sessionClaims?.email as string | undefined
  );

  return { userId };
}

// Get user's profile
export async function getProfile(): Promise<UserProfile> {
  const userId = await requireAuth();
  return await getUserProfile(userId);
}

// Get user's memories
export async function getMemories() {
  const userId = await requireAuth();
  return await getUserMemories(userId, 20);
}

// Analyze text content and update profile
export async function analyzeText(content: string) {
  const userId = await requireAuth();

  try {
    // Analyze the content
    const analysis = await analyzeContent(content);

    // Get current profile
    const currentProfile = await getUserProfile(userId);

    // Merge insights into profile
    const updatedProfile = mergeProfile(currentProfile, analysis);

    // Update profile in database
    await updateUserProfile(userId, updatedProfile);

    // Generate recommendations with web search
    const recommendations = await generateRecommendations(
      updatedProfile,
      content,
      searchWeb
    );

    // Save memory
    await createMemory(userId, content, analysis, recommendations);

    return {
      success: true,
      profile: updatedProfile,
      recommendations,
    };
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw error;
  }
}

// Analyze file content (PDF or text)
export async function analyzeFile(formData: FormData) {
  const userId = await requireAuth();

  try {
    const file = formData.get('file') as File;
    if (!file) {
      throw new Error('No file provided');
    }

    let content = '';

    // Handle different file types
    if (file.type === 'application/pdf') {
      // For PDF, we'll need to parse it
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      try {
        const pdfParse = (await import('pdf-parse')).default;
        const pdfData = await pdfParse(buffer);
        content = pdfData.text;
      } catch (pdfError) {
        throw new Error('Failed to parse PDF file');
      }
    } else {
      // Assume text file
      content = await file.text();
    }

    if (!content || content.trim().length === 0) {
      throw new Error('No content could be extracted from file');
    }

    // Use the same analysis logic as text
    return await analyzeText(content);
  } catch (error) {
    console.error('Error analyzing file:', error);
    throw error;
  }
}

// Manually add an insight
export async function addManualInsight(insight: string) {
  // Same as analyzing text
  return await analyzeText(insight);
}

// Transcribe audio and auto-analyze
export async function transcribeAudio(formData: FormData) {
  const userId = await requireAuth();

  try {
    // Call the transcription API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/transcribe`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Transcription failed');
    }

    const data = await response.json();

    if (data.success && data.text) {
      // Auto-analyze the transcribed text
      const analysisResult = await analyzeText(data.text);

      return {
        ...analysisResult,
        text: data.text,
      };
    }

    return { success: false, error: 'No transcription text received' };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}
