'use client';

import { useEffect, useState } from 'react';

interface HealthCheck {
  healthy: boolean;
  auth: boolean;
  openai: boolean;
  database: boolean;
  tables: {
    users: boolean;
    profile: boolean;
    memories: boolean;
  };
  errors: string[];
}

export default function SystemStatus() {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return null;
  if (!health || health.healthy) return null;

  return (
    <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50">
      <div className="bg-red-50 border-2 border-red-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start space-x-3">
          <svg
            className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-red-900 mb-2">
              System Configuration Required
            </h3>
            <div className="space-y-1 text-sm text-red-800">
              {health.errors.map((error, idx) => (
                <div key={idx} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{error}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-red-700 hover:text-red-900 underline mt-2"
            >
              {showDetails ? 'Hide' : 'Show'} setup instructions
            </button>

            {showDetails && (
              <div className="mt-3 p-3 bg-white rounded border border-red-200 text-xs space-y-2">
                <div>
                  <strong>Required Environment Variables:</strong>
                </div>
                {!health.openai && (
                  <div className="font-mono bg-gray-50 p-2 rounded">
                    OPENAI_API_KEY=sk-...
                  </div>
                )}
                {!health.database && (
                  <div className="font-mono bg-gray-50 p-2 rounded">
                    POSTGRES_URL=postgres://...
                  </div>
                )}
                {!health.tables.users && (
                  <div>
                    <strong>Database Setup:</strong>
                    <div className="font-mono bg-gray-50 p-2 rounded mt-1">
                      npm run db:setup
                    </div>
                    <div className="text-gray-600 mt-1">
                      Or manually run db/schema.sql in your Postgres database
                    </div>
                  </div>
                )}
                <div className="text-gray-600 mt-2">
                  After fixing, refresh the page. See README.md for full setup
                  instructions.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
