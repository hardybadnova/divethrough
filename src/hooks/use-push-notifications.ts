
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import { useNavigate } from 'react-router-dom';

// Function to convert base64 string to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Public VAPID key (this would be provided by your push notification service)
const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

interface UsePushNotificationsProps {
  userId?: string;
}

export function usePushNotifications({ userId }: UsePushNotificationsProps = {}) {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);
      
      if (supported && userId) {
        // Check if already subscribed
        const registration = await navigator.serviceWorker.ready;
        const existingSubscription = await registration.pushManager.getSubscription();
        
        if (existingSubscription) {
          setSubscription(existingSubscription);
          setIsSubscribed(true);
        }
      }
    };
    
    checkSupport();
  }, [userId]);

  // Subscribe to push notifications
  const subscribe = async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in your browser",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // Request permission for notifications
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast({
          title: "Permission Denied",
          description: "You need to allow notification permission to receive updates",
          variant: "destructive"
        });
        return false;
      }
      
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push notifications
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });
      
      setSubscription(pushSubscription);
      setIsSubscribed(true);
      
      // Save subscription to your server (via Supabase)
      if (userId) {
        await saveSubscriptionToServer(pushSubscription, userId);
      }
      
      toast({
        title: "Notifications Enabled",
        description: "You'll now receive updates for your games and transactions"
      });
      
      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast({
        title: "Subscription Failed",
        description: "Failed to enable notifications. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Unsubscribe from push notifications
  const unsubscribe = async () => {
    if (!subscription) return false;
    
    try {
      setIsLoading(true);
      
      // Unsubscribe from push manager
      await subscription.unsubscribe();
      
      // Remove subscription from server
      if (userId) {
        await removeSubscriptionFromServer(userId);
      }
      
      setSubscription(null);
      setIsSubscribed(false);
      
      toast({
        title: "Notifications Disabled",
        description: "You won't receive push notifications anymore"
      });
      
      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast({
        title: "Error",
        description: "Failed to disable notifications. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Save subscription to server
  const saveSubscriptionToServer = async (subscription: PushSubscription, userId: string) => {
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        subscription_data: JSON.stringify(subscription),
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error saving subscription to server:', error);
      throw error;
    }
  };

  // Remove subscription from server
  const removeSubscriptionFromServer = async (userId: string) => {
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .match({ user_id: userId });
    
    if (error) {
      console.error('Error removing subscription from server:', error);
      throw error;
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe
  };
}
