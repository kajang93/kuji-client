// 당첨 결과 노출과 중복 알림을 막고 새 알림 처리기를 즉시 적용합니다.
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 당첨 결과는 Firebase의 자동 표시가 실행되기 전에 차단합니다.
self.addEventListener('push', (event) => {
  try {
    if (event.data?.json()?.data?.subType === 'WINNING') {
      event.stopImmediatePropagation();
    }
  } catch {
    // Firebase 형식이 아닌 메시지는 기존 처리기에 맡깁니다.
  }
});

// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
const urlParams = new URLSearchParams(self.location.search);
const firebaseConfig = {
  apiKey: urlParams.get('apiKey') || '',
  authDomain: urlParams.get('authDomain') || '',
  projectId: urlParams.get('projectId') || '',
  storageBucket: urlParams.get('storageBucket') || '',
  messagingSenderId: urlParams.get('messagingSenderId') || '',
  appId: urlParams.get('appId') || '',
  measurementId: urlParams.get('measurementId') || ''
};

// Initialize Firebase App
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  if (payload.data?.subType === 'WINNING') return;
  // notification이 있으면 Firebase가 이미 기기 알림을 표시합니다.
  if (payload.notification) return;

  const notificationTitle = payload.data?.title || "알림";
  const notificationOptions = {
    body: payload.data?.body || "",
    icon: '/favicon.ico',
    data: payload.data
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
