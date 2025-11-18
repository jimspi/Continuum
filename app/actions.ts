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
  try {
    const userId = await requireAuth();

    console.log('Analyzing text for user:', userId);

    // Analyze the content
    const analysis = await analyzeContent(content);
    console.log('Content analyzed:', Object.keys(analysis));

    // Get current profile
    const currentProfile = await getUserProfile(userId);
    console.log('Current profile fetched');

    // Merge insights into profile
    const updatedProfile = mergeProfile(currentProfile, analysis);
    console.log('Profile merged');

    // Update profile in database
    await updateUserProfile(userId, updatedProfile);
    console.log('Profile updated in database');

    // Generate recommendations with web search
    const recommendations = await generateRecommendations(
      updatedProfile,
      content,
      searchWeb
    );
    console.log('Generated recommendations:', recommendations.length);

    // Save memory
    await createMemory(userId, content, analysis, recommendations);
    console.log('Memory saved');

    return {
      success: true,
      profile: updatedProfile,
      recommendations,
    };
  } catch (error: any) {
    console.error('Error analyzing text:', error);
    return {
      success: false,
      error: 'Analysis failed',
      details: error.message || 'Unknown error occurred',
      recommendations: [],
    };
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

    const data = await response.json();

    // If the API returned an error, return it with details
    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Transcription failed',
        details: data.details,
        hint: data.hint,
      };
    }

    if (data.success && data.text) {
      console.log('Transcription successful, analyzing...');

      // Auto-analyze the transcribed text
      const analysisResult = await analyzeText(data.text);

      return {
        ...analysisResult,
        text: data.text,
      };
    }

    return { success: false, error: 'No transcription text received' };
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    return {
      success: false,
      error: 'Network error',
      details: error.message || 'Could not connect to transcription service',
    };
  }
}
