import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import type { Adapter } from "next-auth/adapters";
import db from "@/lib/db";
import { generateUniqueUsername } from "./utils/username-generator";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  secret: process.env.NEXTAUTH_SECRET!,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
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
        session.user = {
          ...session.user,
          name: token.name ?? null,
          image: token.picture ?? null,
          email: token.email!,
          id: token.id ?? null,
          username: token.username ?? null,
        };
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      const dbUser = await db.user.findFirst({
        where: {
          email: token.email!,
        },
      });

      if (!dbUser) {
        token.id = user!.id;
        return token;
      }

      if (trigger === "signUp") {
        if (!dbUser.username) {
          const username = await generateUniqueUsername(dbUser.email!);
          
          await db.user.update({
            where: {
              id: dbUser.id,
            },
            data: {
              username,
            },
          });
        }
      }
      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        username: dbUser.username,
      };
    },
  },
};

