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

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'OpenAI API key not configured',
          details: 'Please set OPENAI_API_KEY in your environment variables'
        },
        { status: 500 }
      );
    }

    // Get audio file from form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({
        success: false,
        error: 'No audio file provided'
      }, { status: 400 });
    }

    console.log('Received audio file:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size
    });

    // Convert to buffer for OpenAI
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a File object with a proper extension
    // OpenAI Whisper supports: mp3, mp4, mpeg, mpga, m4a, wav, webm
    const file = new File([buffer], 'audio.webm', {
      type: 'audio/webm'
    });

    console.log('Sending to OpenAI Whisper...');

    // Transcribe using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en',
      response_format: 'json',
    });

    console.log('Transcription successful:', transcription.text);

    return NextResponse.json({
      success: true,
      text: transcription.text,
      userId,
    });
  } catch (error: any) {
    console.error('Transcription error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Transcription failed',
        details: error.message || 'Unknown error',
        hint: error.message?.includes('API key')
          ? 'Please check your OpenAI API key configuration'
          : error.message?.includes('audio')
          ? 'Audio format may not be supported'
          : 'Please try recording again'
      },
      { status: 500 }
    );
  }
}

// Optional: Support for streaming large audio files
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max for transcription
