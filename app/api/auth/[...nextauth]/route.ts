import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login", // Optional
  },
  callbacks: {
    async redirect({ baseUrl }) {
      return `${baseUrl}/focus`; // Custom redirect
    },
  },
});

export { handler as GET, handler as POST };
