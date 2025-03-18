import { defineEventHandler, getCookie } from 'h3';
import { prisma } from 'database/src/client';
import { validateSessionToken } from 'auth/lib/sessions';
import { config } from '@config';

export default defineEventHandler(async (event) => {
  try {
    // Get the token from cookies
    const token = getCookie(event, config.auth.sessionCookieName);
    
    console.log('Auth token from cookie:', token ? 'Present (masked)' : 'Not present');
    
    if (!token) {
      console.log('No auth token found in cookie');
      return { 
        statusCode: 401, 
        success: false, 
        body: { 
          error: 'Unauthorized - No auth token',
          message: 'You must be logged in to access this resource' 
        } 
      };
    }
    
    // Try normal validation flow
    console.log('Attempting to validate session token');
    const { session, user } = await validateSessionToken(token);
    
    if (!session || !user) {
      console.log('Session validation failed');
      return { 
        statusCode: 401, 
        success: false, 
        body: { 
          error: 'Unauthorized - Invalid session',
          message: 'Your session is invalid or expired. Please log in again.' 
        } 
      };
    }

    console.log('Session validation successful for user:', user.email);
    
    // Get user and team information
    const userWithTeam = await prisma.user.findUnique({
      where: { id: user.id },
      include: { memberships: { include: { team: true } } }
    });

    if (!userWithTeam?.memberships?.length) {
      console.log('User has no team memberships');
      return { 
        statusCode: 400, 
        success: false, 
        body: { 
          error: 'User is not a member of any team',
          message: 'You must be a member of a team to access this resource' 
        } 
      };
    }

    // Use the first team (in a real app, you might want to specify the team)
    const teamId = userWithTeam.memberships[0].teamId;
    console.log('Using team:', userWithTeam.memberships[0].team.name, 'ID:', teamId);

    // Get persons and organizations for the team
    const [persons, organizations] = await Promise.all([
      prisma.person.findMany({
        where: { teamId },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.organization.findMany({
        where: { teamId },
        orderBy: { updatedAt: 'desc' }
      })
    ]);
    
    console.log('Found', persons.length, 'persons and', organizations.length, 'organizations');

    // Transform data for the frontend to match expected format
    const entities = [
      ...persons.map(person => ({
        id: person.id,
        name: person.name,
        type: 'Individual',
        caseStatus: 'Not Started',
        registration: '-',
        riskLevel: 'Not Applicable',
        lastUpdate: person.updatedAt.toLocaleDateString('en-US', {
          day: 'numeric', 
          month: 'short', 
          year: 'numeric'
        }),
        dueDate: '-',
        createdAt: person.createdAt,
        updatedAt: person.updatedAt
      })),
      ...organizations.map(org => ({
        id: org.id,
        name: org.name,
        type: 'Company',
        caseStatus: 'Not Started',
        registration: '-',
        riskLevel: 'Not Applicable',
        lastUpdate: org.updatedAt.toLocaleDateString('en-US', {
          day: 'numeric', 
          month: 'short', 
          year: 'numeric'
        }),
        dueDate: '-',
        createdAt: org.createdAt,
        updatedAt: org.updatedAt
      }))
    ];

    return { success: true, data: entities };
  } catch (error) {
    console.error('Error getting entities:', error);
    return { 
      statusCode: 500, 
      success: false, 
      body: { 
        error: 'Internal server error',
        message: 'An unexpected error occurred' 
      } 
    };
  }
}); 