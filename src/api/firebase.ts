import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
// Only initialize messaging if the browser supports it
let messaging: any = null;
if (typeof window !== "undefined" && "Notification" in window) {
  messaging = getMessaging(app);
}

export { app, messaging };

/**
 * Handle foreground messages when the app is active.
 */
export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (!messaging) return;
  return onMessage(messaging, callback);
};

/**
 * Request FCM Token from Firebase
 * Prompts the user for notification permissions if not already granted.
 */
export const requestFirebaseToken = async (): Promise<string | null> => {
  if (Capacitor.isNativePlatform()) {
    try {
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
      if (permStatus.receive !== 'granted') {
        console.log("앱 푸시 권한이 거부되었습니다.");
        return null;
      }

      // Add listener to capture token
      return new Promise(async (resolve) => {
        await PushNotifications.removeAllListeners();
        
        PushNotifications.addListener('registration', (token) => {
          console.log("네이티브 FCM 토큰 발급 성공:", token.value);
          resolve(token.value);
        });

        PushNotifications.addListener('registrationError', (error) => {
          console.error("네이티브 FCM 토큰 등록 에러:", error);
          resolve(null);
        });

        await PushNotifications.register();
      });
    } catch (err) {
      console.error("네이티브 푸시 설정 실패:", err);
      return null;
    }
  }

  if (!messaging) {
    console.warn("이 브라우저에서는 Firebase 메시징이 지원되지 않습니다.");
    return null;
  }

  try {
    let registration: ServiceWorkerRegistration | undefined;
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const configParams = new URLSearchParams({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
        appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
      }).toString();

      registration = await navigator.serviceWorker.register(
        `/firebase-messaging-sw.js?${configParams}`
      );
    }

    const currentToken = await getToken(messaging, { 
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      ...(registration ? { serviceWorkerRegistration: registration } : {})
    });

    if (currentToken) {
      console.log("FCM 토큰 발급 성공:", currentToken);
      return currentToken;
    } else {
      console.log("FCM 토큰을 가져올 수 없습니다. 알림 권한을 요청해주세요.");
      return null;
    }
  } catch (err) {
    console.error("FCM 토큰 가져오기 실패:", err);
    throw err;
  }
};
