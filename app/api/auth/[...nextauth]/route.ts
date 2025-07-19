import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// ✅ Define and export authOptions
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

// ✅ Use authOptions in handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
