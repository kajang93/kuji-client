// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
const firebaseConfig = {
  apiKey: "AIzaSyC-bWqDVfHn13mLH3FnHEhOAyxkqjd1RAA",
  authDomain: "kuji-project-abcc8.firebaseapp.com",
  projectId: "kuji-project-abcc8",
  storageBucket: "kuji-project-abcc8.firebasestorage.app",
  messagingSenderId: "181515760530",
  appId: "1:181515760530:web:8758ef9702c24c522c874b",
  measurementId: "G-V62K9SNC1N"
};

// Initialize Firebase App
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || "알림";
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || "",
    icon: '/favicon.ico',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
