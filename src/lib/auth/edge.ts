import NextAuth from "next-auth";

/**
 * Edge-compatible auth config for middleware.
 * Only performs JWT verification — no providers, no DB adapter.
 * The full config with Credentials + Prisma lives in ./index.ts.
 */
export const { auth: authMiddleware } = NextAuth({
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
