import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github"; // Add GitHubProvider
import { NextResponse } from "next/server";

// Create the NextAuth handler
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID, // GitHub Client ID from your GitHub OAuth app
      clientSecret: process.env.GITHUB_CLIENT_SECRET, // GitHub Client Secret
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.image = token.image;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
