import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async redirect({ baseUrl }) {
      return `${baseUrl}/focus`;
    },
  },
};

const handler = NextAuth(authOptions);

// Export named HTTP methods for App Router
export const GET = handler;
export const POST = handler;
