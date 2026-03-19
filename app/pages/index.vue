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

        <v-alert
          v-if="sessionExpired"
          type="warning"
          variant="tonal"
          class="mb-4"
          icon="mdi-clock-alert-outline"
        >
          Your session has expired. Please log in again.
        </v-alert>

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
const { loginWithGoogle, isLoggedIn, waitForAuthReady } = useAuth();
const snackbarOpen = ref<boolean>(false);

const loading = ref(false);
const errorMessage = ref("");
const sessionExpired = computed(() => route.query.expired === 'true');

onMounted(async () => {
  await waitForAuthReady();
  if (isLoggedIn.value) {
    const redirect = (route.query.redirect as string) || "/dashboard";
    router.push(redirect);
  }
});

async function handleGoogleLogin() {
  errorMessage.value = "";
  loading.value = true;
  try {
    await loginWithGoogle();

    await waitForAuthReady();

    const redirect = (route.query.redirect as string) || "/dashboard";
    router.push(redirect);
  } catch (err: any) {
    console.error(err);
    errorMessage.value = err.message ?? "Failed to sign in with Google";
    snackbarOpen.value = true;
  } finally {
    loading.value = false;
  }
}
</script>
