import { defineEventHandler, getCookie } from 'h3';
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

    // Get the entity ID from the route
    const id = event.context.params?.id;
    
    if (!id) {
      return { statusCode: 400, body: { error: 'Missing entity ID' } };
    }

    // Try to find the entity as a person first
    let person = await prisma.person.findFirst({
      where: { 
        id,
        teamId
      }
    });

    if (person) {
      // Return the person with proper formatting
      return {
        success: true,
        data: {
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
          updatedAt: person.updatedAt,
          riskDetails: {
            score: null,
            pepPercentage: "-",
            sanctionsPercentage: "-",
            adverseMediaPercentage: "-",
            status: "Pending Risk"
          }
        }
      };
    }

    // If not found as a person, try to find as an organization
    let organization = await prisma.organization.findFirst({
      where: { 
        id,
        teamId
      }
    });

    if (organization) {
      // Return the organization with proper formatting
      return {
        success: true,
        data: {
          id: organization.id,
          name: organization.name,
          type: 'Company',
          caseStatus: 'Not Started',
          registration: '-',
          riskLevel: 'Not Applicable',
          lastUpdate: organization.updatedAt.toLocaleDateString('en-US', {
            day: 'numeric', 
            month: 'short', 
            year: 'numeric'
          }),
          dueDate: '-',
          createdAt: organization.createdAt,
          updatedAt: organization.updatedAt,
          riskDetails: {
            score: null,
            pepPercentage: "-",
            sanctionsPercentage: "-",
            adverseMediaPercentage: "-",
            status: "Pending Risk"
          }
        }
      };
    }

    // If not found at all
    return { statusCode: 404, body: { error: 'Entity not found' } };
  } catch (error) {
    console.error('Error getting entity:', error);
    return { statusCode: 500, body: { error: 'Internal server error' } };
  }
}); 