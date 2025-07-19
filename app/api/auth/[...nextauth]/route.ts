import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

export { authOptions }; // ✅ add this line to fix the import error

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
