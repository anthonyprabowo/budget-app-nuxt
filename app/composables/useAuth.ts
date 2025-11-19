// composables/useAuth.ts
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import type { FetchError } from 'ofetch';

const userState = ref<User | null>(null);
let initialized = false;
const authReady = ref(false);

const ALLOWED_EMAILS = [
  "anthonyprabowo@gmail.com",
  "soetadi.hellosharon@gmail.com",
];

function isEmailAllowed(email: string | null | undefined) {
  if (!email) return false;
  return ALLOWED_EMAILS.includes(email.toLowerCase());
}

export function useAuth() {
  const nuxtApp = useNuxtApp();
  const auth = nuxtApp.$firebase.auth;

  if (!initialized) {
    initialized = true;
    onAuthStateChanged(auth, (u) => {
      if (u && !isEmailAllowed(u.email)) {
        signOut(auth);
        userState.value = null;
      } else {
        userState.value = u;
        authReady.value = true;
      }
    });
  }

  const isLoggedIn = computed(() => !!userState.value);

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const email = cred.user.email;
    const idToken = await cred.user.getIdToken();

    // if (!isEmailAllowed(email)) {
    //   await signOut(auth);
    //   throw new Error("This Google account is not allowed to access this app.");
    // }

    try {
      await $fetch('/api/auth/login', {
        method: 'POST',
        body: { idToken }
      })
    } catch(err) {
      const e = err as FetchError
      await signOut(auth);
      console.log(e.statusCode);
      throw new Error(e.message);
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      await $fetch('/api/auth/logout', { method: 'POST' })

      const router = useRouter();
      router.push('/');
    } catch(e) {
      console.log(e);
    }
    
  }

  async function getIdToken() {
    if (!userState.value) return null;
    return await userState.value.getIdToken();
  }

  function waitForAuthReady(): Promise<void> {
    if (authReady.value) return Promise.resolve();

    return new Promise((resolve) => {
      const stop = watch(
        authReady,
        (ready) => {
          if (ready) {
            stop();
            resolve();
          }
        },
        { immediate: true }
      );
    });
  }

  return {
    user: userState,
    isLoggedIn,
    loginWithGoogle,
    logout,
    getIdToken,
    waitForAuthReady
  };
}
