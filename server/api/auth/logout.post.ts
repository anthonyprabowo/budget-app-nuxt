import { deleteCookie } from "#imports";

export default defineEventHandler((event) => {
  // Remove the UID cookie
  deleteCookie(event, 'uid', {
    path: '/', 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return { success: true };
});
