import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
        import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
        import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

        const firebaseConfig = {
          apiKey: "AIzaSyBEuhONMXw9xXJejYsdGB5N48tfNk6XwAs",
          authDomain: "mealplanalaeva.firebaseapp.com",
          projectId: "mealplanalaeva",
          storageBucket: "mealplanalaeva.firebasestorage.app",
          messagingSenderId: "780138173787",
          appId: "1:780138173787:web:fedde7aa934d68ba35367e",
          measurementId: "G-QF5L33BL6Z"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth();
        const db = getFirestore();

        export { auth, db, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, getDoc, setDoc, doc };
        // const auth = window.firebaseStuff.auth;