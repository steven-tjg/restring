import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { writable } from 'svelte/store';
import { auth, db } from './firebase';

export const user = writable<User | null>(null);
/** False until Firebase has restored the saved session (or found none). */
export const authReady = writable(false);

onAuthStateChanged(auth, (u) => {
  user.set(u);
  authReady.set(true);
});

export async function signUp(name: string, email: string, password: string): Promise<void> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  // Do not block on this write: it queues offline and syncs later.
  setDoc(doc(db, 'users', cred.user.uid), {
    name,
    email,
    unit: 'lb',
    createdAt: Date.now(),
  }).catch(() => {});
  user.set(auth.currentUser);
}

export async function logIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export function friendlyError(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'That email is already registered. Try logging in.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Wrong email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'No connection. Check your signal and try again.';
    case 'auth/operation-not-allowed':
    case 'auth/configuration-not-found':
      return 'Email/password sign-in is not enabled in Firebase yet (Authentication > Sign-in method).';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase (Authentication > Settings > Authorized domains).';
    default:
      return `Something went wrong (${code || 'unknown error'}). Please try again.`;
  }
}
