import { H3Event, getCookie } from 'h3';
import { validateSessionToken } from 'auth/lib/sessions';
import { config } from '@config';

export async function getServerSession(event: H3Event) {
  // Get the token from cookies
  const token = getCookie(event, config.auth.sessionCookieName);
  
  if (!token) {
    return null;
  }
  
  // Validate the session
  const { session, user } = await validateSessionToken(token);
  
  if (!session || !user) {
    return null;
  }
  
  return { session, user };
} 