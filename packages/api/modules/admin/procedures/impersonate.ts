import { TRPCError } from "@trpc/server";
import {
  createSession,
  createSessionCookie,
  generateSessionToken,
  invalidateSession,
} from "auth";
import { UserRoleSchema, db } from "database";
import { setCookie } from "h3";
import { z } from "zod";
import { adminProcedure } from "../../trpc";

export const impersonate = adminProcedure
  .input(
    z.object({
      userId: z.string(),
    }),
  )
  .output(z.void())
  .mutation(async ({ input: { userId }, ctx: { user, session, event } }) => {
    // check if user with id exists
    const userExists = await db.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!userExists) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    // RESTRICTION: Prevent impersonation of users with ADMIN role
    if (userExists.role === UserRoleSchema.Values.ADMIN) {
      throw new TRPCError({ 
        code: "FORBIDDEN", 
        message: "Cannot impersonate admin users" 
      });
    }

    // RESTRICTION: Prevent impersonation of users in specific teams
    // You can uncomment and customize this code to implement team-based restrictions
    /*
    const restrictedTeamIds = ["team-id-1", "team-id-2"]; // IDs of restricted teams
    const userTeams = await db.teamMembership.findMany({
      where: {
        userId: userId,
        teamId: {
          in: restrictedTeamIds
        }
      }
    });

    if (userTeams.length > 0) {
      throw new TRPCError({ 
        code: "FORBIDDEN", 
        message: "Cannot impersonate users in restricted teams" 
      });
    }
    */

    try {
      const newSessionToken = generateSessionToken();

      await createSession(newSessionToken, userId, {
        impersonatorId: user.id,
      });

      await invalidateSession(session.id);

      const sessionCookie = createSessionCookie(newSessionToken);

      if (event) {
        setCookie(
          event,
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
    } catch (e) {
      console.error(e);

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  });
