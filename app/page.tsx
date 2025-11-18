'use client';

import { useEffect, useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import UploadZone from '@/components/UploadZone';
import ProfileView from '@/components/ProfileView';
import RecommendationsList from '@/components/RecommendationsList';
import VoiceCapture from '@/components/VoiceCapture';
import PWAInstall from '@/components/PWAInstall';
import SystemStatus from '@/components/SystemStatus';
import { getProfile, initializeUser } from './actions';
import type { UserProfile } from '@/lib/db';
import type { Recommendation } from '@/lib/openai';

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile>({});
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'voice'>('upload');
  const [transcribedText, setTranscribedText] = useState<string>('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      await initializeUser();
      const userProfile = await getProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalysisComplete = (newRecommendations: Recommendation[]) => {
    setRecommendations(newRecommendations);
  };

  const handleProfileUpdate = async () => {
    try {
      const userProfile = await getProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleVoiceTranscription = async (result: { text: string; recommendations: any[] }) => {
    try {
      // Set the transcribed text to show user what was captured
      setTranscribedText(result.text);

      // Use the recommendations that were already generated
      handleAnalysisComplete(result.recommendations);

      // Update the profile
      await handleProfileUpdate();
    } catch (error) {
      console.error('Error processing voice transcription:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* System Status Check */}
      <SystemStatus />

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Continuum</h1>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10',
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Left Column - Upload/Voice Capture */}
          <div className="lg:col-span-2 space-y-4 md:space-y-8">
            {/* Tab Switcher */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'upload'
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Upload
                </button>
                <button
                  onClick={() => setActiveTab('voice')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'voice'
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Voice
                </button>
              </div>

              <div className="p-4 md:p-6">
                {activeTab === 'upload' ? (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Add Content
                    </h2>
                    <UploadZone
                      onAnalysisComplete={handleAnalysisComplete}
                      onProfileUpdate={handleProfileUpdate}
                    />
                  </div>
                ) : (
                  <VoiceCapture onTranscriptionComplete={handleVoiceTranscription} />
                )}
              </div>
            </div>

            {/* Transcribed Text Display */}
            {transcribedText && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 md:p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-green-900 mb-2">
                      Transcription Complete
                    </h3>
                    <div className="bg-white rounded-md p-3 border border-green-200">
                      <p className="text-sm text-gray-700 italic">{transcribedText}</p>
                    </div>
                    <p className="text-xs text-green-700 mt-2">
                      Analyzing and updating your profile...
                    </p>
                  </div>
                  <button
                    onClick={() => setTranscribedText('')}
                    className="flex-shrink-0 text-green-600 hover:text-green-800"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-4 md:p-6">
                <RecommendationsList recommendations={recommendations} />
              </div>
            )}
          </div>

          {/* Right Column - Profile (Hidden on mobile, sticky on desktop) */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="lg:sticky lg:top-8">
              <ProfileView profile={profile} />
            </div>
          </div>
        </div>
      </main>

      {/* PWA Install Prompt */}
      <PWAInstall />

      {/* Footer */}
      <footer className="mt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Continuum - Your intelligent memory platform
          </p>
        </div>
      </footer>
    </div>
  );
}
