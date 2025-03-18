import { TRPCError } from "@trpc/server";
import { TeamSchema, TeamMemberRoleSchema, UserRoleSchema, db } from "database";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const create = protectedProcedure
  .input(
    z.object({
      name: z.string(),
    }),
  )
  .output(
    TeamSchema.extend({
      memberships: z.array(
        z.object({
          id: z.string(),
          role: TeamMemberRoleSchema,
          isCreator: z.boolean(),
        }),
      ),
    }),
  )
  .mutation(async ({ input: { name }, ctx: { user } }) => {
    // If user is not an admin, check if they already own a team
    if (user.role !== UserRoleSchema.Values.ADMIN) {
      const existingOwnerships = await db.teamMembership.findMany({
        where: {
          userId: user.id,
          role: TeamMemberRoleSchema.Values.OWNER,
        },
      });

      if (existingOwnerships.length > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only be the owner of one team. Please contact support if you need to create additional teams.",
        });
      }
    }

    const team = await db.team.create({
      data: {
        name,
        memberships: {
          create: {
            userId: user.id,
            role: TeamMemberRoleSchema.Values.OWNER,
            isCreator: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        memberships: {
          select: {
            id: true,
            role: true,
            isCreator: true,
          },
        },
      },
    });

    return team;
  });
