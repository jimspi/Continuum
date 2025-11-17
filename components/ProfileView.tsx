'use client';

import type { UserProfile } from '@/lib/db';

interface ProfileViewProps {
  profile: UserProfile;
}

export default function ProfileView({ profile }: ProfileViewProps) {
  const isEmpty = Object.keys(profile).length === 0;

  if (isEmpty) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm font-medium text-gray-900 mb-1">
            No profile data yet
          </p>
          <p className="text-sm text-gray-500">
            Upload content or add insights to start building your profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Your Profile</h2>

      <div className="space-y-4">
        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <ProfileCard title="Interests">
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </ProfileCard>
        )}

        {/* Goals */}
        {profile.goals && profile.goals.length > 0 && (
          <ProfileCard title="Goals">
            <ul className="space-y-2">
              {profile.goals.map((goal, idx) => (
                <li key={idx} className="flex items-start text-sm text-gray-700">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
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
                  {goal}
                </li>
              ))}
            </ul>
          </ProfileCard>
        )}

        {/* Timeline */}
        {profile.timeline && profile.timeline.length > 0 && (
          <ProfileCard title="Upcoming Events">
            <div className="space-y-3">
              {profile.timeline.map((item, idx) => (
                <div key={idx} className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 bg-purple-500 rounded-full mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.event}
                    </p>
                    <p className="text-xs text-gray-500">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </ProfileCard>
        )}

        {/* Platforms */}
        {profile.platforms && profile.platforms.length > 0 && (
          <ProfileCard title="Platforms & Tools">
            <div className="flex flex-wrap gap-2">
              {profile.platforms.map((platform, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                >
                  {platform}
                </span>
              ))}
            </div>
          </ProfileCard>
        )}

        {/* Content Needs */}
        {profile.content_needs && profile.content_needs.length > 0 && (
          <ProfileCard title="Content Needs">
            <ul className="space-y-1">
              {profile.content_needs.map((need, idx) => (
                <li key={idx} className="text-sm text-gray-700">
                  • {need}
                </li>
              ))}
            </ul>
          </ProfileCard>
        )}

        {/* Preferences */}
        {profile.preferences && Object.keys(profile.preferences).length > 0 && (
          <ProfileCard title="Preferences">
            <dl className="space-y-2">
              {Object.entries(profile.preferences).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <dt className="font-medium text-gray-900 inline">{key}:</dt>{' '}
                  <dd className="text-gray-700 inline">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </ProfileCard>
        )}

        {/* Context */}
        {profile.context && profile.context.length > 0 && (
          <ProfileCard title="Context">
            <ul className="space-y-1">
              {profile.context.map((ctx, idx) => (
                <li key={idx} className="text-sm text-gray-700">
                  • {ctx}
                </li>
              ))}
            </ul>
          </ProfileCard>
        )}
      </div>
    </div>
  );
}

function ProfileCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      {children}
    </div>
  );
}
