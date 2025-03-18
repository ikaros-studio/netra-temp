export default defineNuxtRouteMiddleware((to, from) => {
  // This middleware intercepts all route changes and ensures consistent handling
  // Add any global route handling logic here

  if (process.server) {
    // Server-side handling
    return;
  }

  // Let the navigation continue normally for other cases
  return;
}); 