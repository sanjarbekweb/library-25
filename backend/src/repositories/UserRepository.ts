import { prisma } from "../utils/prisma";
import { Prisma, UserRole, DomainEntityType } from "@prisma/client";
import { AdminUserQuery, SyncUserInput } from "../schemas/user.schema";

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByClerkId(clerkId: string) {
    return prisma.user.findUnique({
      where: { clerkId },
    });
  }

  async findAll(queryParams: AdminUserQuery) {
    const { query, role, status, page, limit } = queryParams;
    const where: Prisma.UserWhereInput = {};

    if (query && query.trim() !== "") {
      const q = query.trim();
      where.OR = [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }

    if (role !== "ALL") {
      where.role = role as UserRole;
    }

    if (status === "ACTIVE") {
      where.isActive = true;
    } else if (status === "INACTIVE") {
      where.isActive = false;
    }

    const skip = (page - 1) * limit;

    const [users, total, totalCount, studentCount, assistantCount, adminCount, inactiveCount] =
      await Promise.all([
        prisma.user.findMany({
          where,
          orderBy: [{ createdAt: "desc" }],
          skip,
          take: limit,
          select: {
            id: true,
            clerkId: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                loans: true,
                reservations: true,
                assistedLoans: true,
              },
            },
          },
        }),
        prisma.user.count({ where }),
        prisma.user.count(),
        prisma.user.count({ where: { role: UserRole.STUDENT } }),
        prisma.user.count({ where: { role: UserRole.ASSISTANT } }),
        prisma.user.count({ where: { role: UserRole.ADMIN } }),
        prisma.user.count({ where: { isActive: false } }),
      ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      stats: {
        totalCount,
        studentCount,
        assistantCount,
        adminCount,
        inactiveCount,
      },
    };
  }

  async upsertFromClerk(data: SyncUserInput) {
    const existing = await prisma.user.findUnique({
      where: { clerkId: data.clerkId },
    });

    if (existing) {
      // Stale webhook protection: never downgrade active admin/assistant via unauthenticated webhook
      const preservedRole =
        (existing.role === UserRole.ADMIN || existing.role === UserRole.ASSISTANT) && data.role === UserRole.STUDENT
          ? existing.role
          : data.role ?? existing.role;

      return prisma.user.update({
        where: { clerkId: data.clerkId },
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: preservedRole,
          isActive: existing.isActive,
        },
      });
    }

    return prisma.user.create({
      data: {
        clerkId: data.clerkId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role ?? UserRole.STUDENT,
      },
    });
  }

  async updateRole(targetUserId: string, newRole: UserRole, actor: any) {
    return prisma.$transaction(async (tx) => {
      try {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('admin_role_mutation_lock'))`;
      } catch {
        // Fallback if advisory locks unsupported in test
      }

      const target = await tx.user.findFirst({
        where: { OR: [{ id: targetUserId }, { clerkId: targetUserId }] },
      });

      if (!target) {
        throw new Error("USER_NOT_FOUND");
      }

      if ((target.id === actor.id || target.clerkId === actor.clerkId) && newRole !== UserRole.ADMIN) {
        throw new Error("CANNOT_DEMOTE_SELF");
      }

      if (target.role === UserRole.ADMIN && newRole !== UserRole.ADMIN) {
        const activeAdmins = await tx.user.count({
          where: { role: UserRole.ADMIN, isActive: true },
        });
        if (activeAdmins <= 1) {
          throw new Error("LAST_ADMIN_PROTECTION");
        }
      }

      const updated = await tx.user.update({
        where: { id: target.id },
        data: { role: newRole },
      });

      await tx.domainAudit.create({
        data: {
          entityType: DomainEntityType.USER,
          entityId: target.id,
          action: "ROLE_UPDATE",
          actorId: actor.id,
          actorRole: actor.role,
          beforeState: { role: target.role },
          afterState: { role: newRole },
        },
      });

      return updated;
    });
  }

  async toggleStatus(targetUserId: string, isActive: boolean, actor: any) {
    return prisma.$transaction(async (tx) => {
      try {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('admin_role_mutation_lock'))`;
      } catch {
        // Fallback if advisory locks unsupported in test
      }

      const target = await tx.user.findFirst({
        where: { OR: [{ id: targetUserId }, { clerkId: targetUserId }] },
      });

      if (!target) {
        throw new Error("USER_NOT_FOUND");
      }

      if ((target.id === actor.id || target.clerkId === actor.clerkId) && !isActive) {
        throw new Error("CANNOT_DEACTIVATE_SELF");
      }

      if (target.role === UserRole.ADMIN && !isActive) {
        const activeAdmins = await tx.user.count({
          where: { role: UserRole.ADMIN, isActive: true },
        });
        if (activeAdmins <= 1) {
          throw new Error("LAST_ADMIN_PROTECTION");
        }
      }

      const updated = await tx.user.update({
        where: { id: target.id },
        data: { isActive },
      });

      await tx.domainAudit.create({
        data: {
          entityType: DomainEntityType.USER,
          entityId: target.id,
          action: "STATUS_TOGGLE",
          actorId: actor.id,
          actorRole: actor.role,
          beforeState: { isActive: target.isActive },
          afterState: { isActive },
        },
      });

      return updated;
    });
  }
}
