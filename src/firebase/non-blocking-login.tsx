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
      alert("Anonymous authentication is not enabled in the Firebase Console. \n\nGo to Authentication > Sign-in method and enable Anonymous.");
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
export function initiateGoogleSignIn(authInstance: Auth, onLoadingChange?: (loading: boolean) => void): void {
  const provider = new GoogleAuthProvider();
  if (onLoadingChange) onLoadingChange(true);
  
  signInWithPopup(authInstance, provider)
    .then(() => {
      if (onLoadingChange) onLoadingChange(false);
    })
    .catch((error) => {
      if (onLoadingChange) onLoadingChange(false);
      
      const domain = window.location.hostname;
      
      if (error.code === 'auth/operation-not-allowed') {
        alert("Google authentication is not enabled in the Firebase Console. \n\n1. Go to Authentication > Sign-in method.\n2. Click 'Add new provider'.\n3. Select Google and click 'Enable'.");
      } else if (error.code === 'auth/unauthorized-domain') {
        alert(`UNAUTHORIZED DOMAIN: ${domain}\n\nTo fix this for your Vercel deployment:\n1. Go to Firebase Console > Authentication > Settings.\n2. Click 'Authorized domains'.\n3. Click 'Add domain' and enter: ${domain}\n\nGoogle login will start working immediately after this step.`);
      } else if (error.code === 'auth/popup-blocked') {
        alert("The sign-in popup was blocked by your browser. Please allow popups for this site and try again.");
      } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        // User closed the popup, no need for an alert
      } else {
        console.error("Google Sign-In Error:", error);
        alert(`Google Sign-In failed (${error.code}): ` + error.message);
      }
    });
}
