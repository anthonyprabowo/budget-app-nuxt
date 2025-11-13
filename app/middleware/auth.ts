// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith("/dashboard")) return;

  if (import.meta.server) return;

  const { isLoggedIn, waitForAuthReady } = useAuth();

  // Wait until Firebase auth finishes initializing
  await waitForAuthReady();

  if (!isLoggedIn.value) {
    return navigateTo({
      path: "/",
      query: { redirect: to.fullPath },
    });
  }
});
