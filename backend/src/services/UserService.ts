import { UserRepository } from "../repositories/UserRepository";
import { AdminUserQuery, UpdateUserRoleInput, ToggleUserStatusInput, SyncUserInput } from "../schemas/user.schema";
import { ApiError } from "../utils/ApiError";
import { User, UserRole } from "@prisma/client";

export class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  async getUsers(queryParams: AdminUserQuery) {
    return this.repository.findAll(queryParams);
  }

  async getCurrentUser(actor: User) {
    return this.repository.findById(actor.id);
  }

  async updateRole(input: UpdateUserRoleInput, actor: User) {
    if (actor.role !== UserRole.ADMIN) {
      throw new ApiError(403, "Forbidden: Only administrators can modify user roles", "UNAUTHORIZED_ROLE");
    }

    try {
      const updated = await this.repository.updateRole(input.targetUserId, input.role, actor);
      return updated;
    } catch (err: any) {
      if (err.message === "USER_NOT_FOUND") {
        throw new ApiError(404, "Target user record not found", "USER_NOT_FOUND");
      }
      if (err.message === "CANNOT_DEMOTE_SELF") {
        throw new ApiError(400, "You cannot demote your own administrator account", "CANNOT_DEMOTE_SELF");
      }
      if (err.message === "LAST_ADMIN_PROTECTION") {
        throw new ApiError(400, "Operation rejected: Cannot demote the last remaining active administrator", "LAST_ADMIN_PROTECTION");
      }
      throw err;
    }
  }

  async toggleStatus(input: ToggleUserStatusInput, actor: User) {
    if (actor.role !== UserRole.ADMIN) {
      throw new ApiError(403, "Forbidden: Only administrators can change user activation status", "UNAUTHORIZED_ROLE");
    }

    try {
      const updated = await this.repository.toggleStatus(input.targetUserId, input.isActive, actor);
      return updated;
    } catch (err: any) {
      if (err.message === "USER_NOT_FOUND") {
        throw new ApiError(404, "Target user record not found", "USER_NOT_FOUND");
      }
      if (err.message === "CANNOT_DEACTIVATE_SELF") {
        throw new ApiError(400, "You cannot deactivate your own account", "CANNOT_DEACTIVATE_SELF");
      }
      if (err.message === "LAST_ADMIN_PROTECTION") {
        throw new ApiError(400, "Operation rejected: Cannot deactivate the last remaining active administrator", "LAST_ADMIN_PROTECTION");
      }
      throw err;
    }
  }

  async syncUser(data: SyncUserInput) {
    return this.repository.upsertFromClerk(data);
  }
}
