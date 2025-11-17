import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get audio file from form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Convert File to format OpenAI expects
    const buffer = await audioFile.arrayBuffer();
    const blob = new Blob([buffer], { type: audioFile.type });

    // Create a File object with the correct name and type
    const file = new File([blob], 'audio.webm', { type: audioFile.type });

    // Transcribe using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en', // Can be made dynamic
      response_format: 'json',
    });

    return NextResponse.json({
      success: true,
      text: transcription.text,
      userId,
    });
  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      {
        error: 'Transcription failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Optional: Support for streaming large audio files
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max for transcription
