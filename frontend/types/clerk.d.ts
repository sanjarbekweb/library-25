import { UserRole } from "@prisma/client";

declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: UserRole;
    };
  }

  interface UserPublicMetadata {
    role?: UserRole;
  }
}
