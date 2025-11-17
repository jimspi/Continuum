'use client';

import { useState, useEffect } from 'react';
import {
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  areNotificationsSupported,
  getNotificationPermission,
} from '@/lib/notifications';

export default function NotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsSupported(areNotificationsSupported());
    setPermission(getNotificationPermission());
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error('Failed to check subscription:', error);
      }
    }
  };

  const handleEnableNotifications = async () => {
    setIsLoading(true);

    try {
      // Request permission
      const granted = await requestNotificationPermission();

      if (granted) {
        setPermission('granted');

        // Subscribe to push
        const subscription = await subscribeToPush();

        if (subscription) {
          // Send subscription to server
          await fetch('/api/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'subscribe',
              subscription: subscription.toJSON(),
            }),
          });

          setIsSubscribed(true);
        }
      } else {
        setPermission('denied');
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsLoading(true);

    try {
      await unsubscribeFromPush();

      // Notify server
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'unsubscribe',
        }),
      });

      setIsSubscribed(false);
    } catch (error) {
      console.error('Failed to disable notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          Push notifications are not supported in this browser
        </p>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg
            className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5"
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
            <h4 className="text-sm font-medium text-orange-900 mb-1">
              Notifications Blocked
            </h4>
            <p className="text-sm text-orange-800">
              You have blocked notifications. Enable them in your browser settings to receive proactive recommendations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <svg
            className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
              isSubscribed ? 'text-green-600' : 'text-gray-400'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              Proactive Notifications
            </h4>
            <p className="text-sm text-gray-600">
              Get notified about contextual recommendations based on your activities
            </p>
          </div>
        </div>

        <button
          onClick={isSubscribed ? handleDisableNotifications : handleEnableNotifications}
          disabled={isLoading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isSubscribed ? 'bg-blue-600' : 'bg-gray-200'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isSubscribed ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {isSubscribed && (
        <div className="mt-3 text-xs text-gray-500">
          Examples: Morning coffee shop suggestions, podcast recommendations, workout gear when you mention exercise
        </div>
      )}
    </div>
  );
}
