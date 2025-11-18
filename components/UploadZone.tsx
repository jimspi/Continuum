'use client';

import { useState, useRef } from 'react';
import { analyzeFile, analyzeText } from '@/app/actions';
import type { Recommendation } from '@/lib/openai';

interface UploadZoneProps {
  onAnalysisComplete: (recommendations: Recommendation[]) => void;
  onProfileUpdate: () => void;
}

export default function UploadZone({
  onAnalysisComplete,
  onProfileUpdate,
}: UploadZoneProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualText, setManualText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    console.log('Analyzing file:', file.name, file.type, file.size);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await analyzeFile(formData);

      console.log('File analysis result:', result);

      if (result.success && result.recommendations) {
        onAnalysisComplete(result.recommendations);
        onProfileUpdate();
        setSuccess(`Successfully analyzed ${file.name}`);
      } else {
        setError(`Failed to analyze file: ${result.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setError(`Error: ${error.message || 'Failed to analyze file. Please try again.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextAnalyze = async () => {
    if (!manualText.trim()) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    console.log('Analyzing text, length:', manualText.length);

    try {
      const result = await analyzeText(manualText);

      console.log('Text analysis result:', result);

      if (result.success && result.recommendations) {
        onAnalysisComplete(result.recommendations);
        onProfileUpdate();
        setManualText('');
        setSuccess('Successfully analyzed your text!');
      } else {
        setError(`Failed to analyze text: ${result.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error analyzing text:', error);
      setError(`Error: ${error.message || 'Failed to analyze text. Please try again.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".txt,.md,.pdf"
          onChange={handleFileInputChange}
          disabled={isProcessing}
        />

        <div className="space-y-2">
          <div className="text-gray-600">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
              Choose a file
            </span>{' '}
            or drag and drop
          </div>
          <p className="text-xs text-gray-500">TXT, MD, or PDF up to 10MB</p>
        </div>
      </div>

      {/* Manual Text Input */}
      <div className="space-y-3">
        <label
          htmlFor="manual-text"
          className="block text-sm font-medium text-gray-700"
        >
          Or enter text directly
        </label>
        <textarea
          id="manual-text"
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
          placeholder="Paste meeting notes, thoughts, or any content you'd like me to learn from..."
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          disabled={isProcessing}
        />
        <button
          onClick={handleTextAnalyze}
          disabled={isProcessing || !manualText.trim()}
          className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {isProcessing ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {isProcessing && (
        <div className="text-center text-sm text-gray-600">
          Processing your content...
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <svg
              className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5"
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
            <div className="flex-1">
              <p className="text-sm text-green-900">{success}</p>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="flex-shrink-0 text-green-600 hover:text-green-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <svg
              className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-red-900">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="flex-shrink-0 text-red-600 hover:text-red-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
