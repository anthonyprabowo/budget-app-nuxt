// composables/useAuth.ts
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";

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

    if (!isEmailAllowed(email)) {
      await signOut(auth);
      throw new Error("This Google account is not allowed to access this app.");
    }
  }

  async function logout() {
    await signOut(auth);
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
