// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  // Only protect these routes
  const protectedRoutes = ["/dashboard", "/setting"];

  // If route doesn't start with any of them, skip
  if (!protectedRoutes.some(path => to.path.startsWith(path))) {
    return;
  }

  // Server render always passes (auth happens only on client)
  if (import.meta.server) return;

  const { isLoggedIn, waitForAuthReady } = useAuth();

  await waitForAuthReady();

  if (!isLoggedIn.value) {
    return navigateTo({
      path: "/",
      query: { redirect: to.fullPath },
    });
  }
});
