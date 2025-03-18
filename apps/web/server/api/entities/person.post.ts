import { defineEventHandler, readBody, getCookie } from 'h3';
import { prisma } from 'database/src/client';
import { validateSessionToken } from 'auth/lib/sessions';
import { config } from '@config';

export default defineEventHandler(async (event) => {
  try {
    // Get the token from cookies
    const token = getCookie(event, config.auth.sessionCookieName);
    
    if (!token) {
      return { 
        statusCode: 401, 
        success: false, 
        body: { 
          error: 'Unauthorized - No auth token',
          message: 'You must be logged in to access this resource' 
        } 
      };
    }
    
    // Validate the session
    const { session, user } = await validateSessionToken(token);
    
    if (!session || !user) {
      return { statusCode: 401, body: { error: 'Unauthorized' } };
    }

    // Get user and team information
    const userWithTeam = await prisma.user.findUnique({
      where: { id: user.id },
      include: { memberships: { include: { team: true } } }
    });

    if (!userWithTeam?.memberships?.length) {
      return { statusCode: 400, body: { error: 'User is not a member of any team' } };
    }

    // Use the first team (in a real app, you might want to specify the team)
    const teamId = userWithTeam.memberships[0].teamId;

    // Read request body
    const body = await readBody(event);
    
    // Create person
    const person = await prisma.person.create({
      data: {
        name: body.name,
        teamId: teamId
      }
    });

    return { success: true, data: person };
  } catch (error) {
    console.error('Error creating person:', error);
    return { statusCode: 500, body: { error: 'Internal server error' } };
  }
}); 