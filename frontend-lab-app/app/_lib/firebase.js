import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDGrs2_lpJBM3FiTIvIPPi8W1o11B81sO0",
  authDomain: "frontendapp-e6133.firebaseapp.com",
  projectId: "frontendapp-e6133",
  storageBucket: "frontendapp-e6133.firebasestorage.app",
  messagingSenderId: "373317044702",
  appId: "1:373317044702:web:a0264b4d729b304f76354f",
  measurementId: "G-Z7VJVD7J5J"
};

const app = initializeApp(firebaseConfig);

let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    } else {
      console.warn("Firebase Analytics nie jest obsługiwane w tym środowisku.");
    }
  });
}

export { app, analytics };