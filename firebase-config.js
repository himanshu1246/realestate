import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApms8gljy59eDPPM6iAOvn9blj1dJnl9Y",
  authDomain: "vrundavan-16946.firebaseapp.com",
  projectId: "vrundavan-16946",
  storageBucket: "vrundavan-16946.firebasestorage.app",
  messagingSenderId: "62317547197",
  appId: "1:62317547197:web:341c5d761078101622f1d4",
  measurementId: "G-KB8E95SWDX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
