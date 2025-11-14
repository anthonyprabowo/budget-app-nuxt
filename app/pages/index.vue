<template>
  <div class="d-flex justify-center align-center" style="min-height: 100vh;">
    <div>
      <v-img cover :width="300" :height="150" src="/logo/minty-budget-app-logo.png" />
      <v-card max-width="420" class="pa-4">
        <v-card-title class="text-h5 mb-4 text-center">
          Sign in
        </v-card-title>

        <v-snackbar
          color="error"
          v-model="snackbarOpen"
          location="top right"
        >
          {{ errorMessage }}
        </v-snackbar>

        <v-btn
          block
          color="primary"
          :loading="loading"
          @click="handleGoogleLogin"
        >
          Continue with Google
        </v-btn>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();
const route = useRoute();
const { loginWithGoogle, isLoggedIn } = useAuth();
const snackbarOpen = ref<boolean>(false);

const loading = ref(false);
const errorMessage = ref("");

// If already logged in, bounce away from /login
watch(
  isLoggedIn,
  (val) => {
    if (val) {
      const redirect = (route.query.redirect as string) || "/dashboard";
      router.push(redirect);
    }
  },
  { immediate: true }
);

async function handleGoogleLogin() {
  errorMessage.value = "";
  loading.value = true;
  try {
    await loginWithGoogle();
  } catch (err: any) {
    console.error(err);
    errorMessage.value = err.message ?? "Failed to sign in with Google";
    snackbarOpen.value = true;
  } finally {
    loading.value = false;
  }
}
</script>
