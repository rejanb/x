import { getApiConfig } from '../config/apiConfig';

const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || 'BB8rUbzyxdKLSCOA_ta_c5zfbQqCJS7VEkOjG2Y84JyJR_IROM8EcwPN2IzJ6sU_XZI';

class PushNotificationService {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.permission = Notification.permission;
    this.subscription = null;
    this.isSubscribed = false;
    this.config = getApiConfig();
  }

  async initialize() {
    if (!this.isSupported) return false;
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      this.subscription = await registration.pushManager.getSubscription();
      this.isSubscribed = !!this.subscription;
      return true;
    } catch (error) {
      return false;
    }
  }

  async requestPermission() {
    if (!this.isSupported) return false;
    if (this.permission === 'granted') return true;
    if (this.permission === 'denied') return false;
    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission === 'granted';
  }

  async subscribe(token) {
    if (!this.isSupported || this.permission !== 'granted') return false;
    try {
      const registration = await navigator.serviceWorker.ready;
      const applicationServerKey = this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      this.subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
      this.isSubscribed = true;
      const response = await fetch(`${this.config.API_BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ subscription: this.subscription, token })
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      return true;
    } catch (error) {
      this.isSubscribed = false;
      return false;
    }
  }

  async unsubscribe(token) {
    if (!this.subscription) return true;
    try {
      const unsubscribed = await this.subscription.unsubscribe();
      if (unsubscribed) {
        await fetch(`${this.config.API_BASE_URL}/notifications/unsubscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ endpoint: this.subscription.endpoint })
        });
        this.subscription = null;
        this.isSubscribed = false;
      }
      return unsubscribed;
    } catch (error) {
      return false;
    }
  }

  async sendTestNotification(token) {
    if (!this.isSubscribed || !token) return false;
    try {
      const response = await fetch(`${this.config.API_BASE_URL}/notifications/push/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  getStatus() {
    return {
      isSupported: this.isSupported,
      permission: this.permission,
      isSubscribed: this.isSubscribed,
      subscription: this.subscription
    };
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  }
}

const pnsClient = new PushNotificationService();
export default pnsClient;
