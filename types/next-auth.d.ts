import { User } from "@prisma/client";
import "next-auth/jwt";

type UserId = string;
declare module "next-auth/jwt" {
  interface JWT {
    id: UserId;
    name?: string | null;
    email: string | null;
    username?: string | null;
  }
}

declare module "next-auth" {
  interface Session {
    user: User & {
      id: UserId;
      email: string | null;
      username?: string | null;
      image?: string | null;
    };
  }
}
