
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch((error) => {
    if (error.code === 'auth/operation-not-allowed') {
      alert("Anonymous authentication is not enabled in the Firebase Console. Please enable it to proceed.");
    } else {
      console.error("Anonymous Sign-In Error:", error);
    }
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password).catch((error) => {
    console.error("Email Sign-Up Error:", error);
  });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password).catch((error) => {
    console.error("Email Sign-In Error:", error);
  });
}

/** Initiate Google sign-in (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth): void {
  const provider = new GoogleAuthProvider();
  signInWithPopup(authInstance, provider).catch((error) => {
    if (error.code === 'auth/operation-not-allowed') {
      alert("Google authentication is not enabled in the Firebase Console. Please enable it to proceed.");
    } else {
      console.error("Google Sign-In Error:", error);
    }
  });
}
