import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import type { Adapter } from "next-auth/adapters";
import db from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  secret: process.env.NEXTAUTH_SECRET!,
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.name = token.name!;
        session.user.image = token.picture!;
        session.user.id = token.id;
        session.user.email = token.email!;
        session.user.username = token.username!;
      }
      return session;
    },
    async jwt({ token, user, trigger }) {
      const dbUser = await db.user.findUnique({
        where: {
         id: user.id
        },
      });
      if (!dbUser) {
        token.id = user!.id;
        return token;
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        username: dbUser.username,
        email: dbUser.email,
      };
    },
  },
};
