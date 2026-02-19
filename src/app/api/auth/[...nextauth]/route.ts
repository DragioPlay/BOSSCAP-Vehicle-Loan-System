import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

import { Session } from "next-auth"

//NextAuth setup: Not really sure how this works

declare module "next-auth" {
  interface Session {
    user?: {
      name?: string | null
      email?: string | null
      id?: string | null
    }
  }
}

const handler = NextAuth({
  providers: [
    //Google Login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    //Credentials - Email and Password
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        //Needs to replaced with real DB lookup
        if (
          credentials?.email === "test@example.com" &&
          credentials?.password === "1234"
        ) {
          return { id: "1", name: "Test User", email: "test@example.com" }
        }
        return null
      },
    }),
  ],

  session: {
    strategy: "jwt", //Use "database" if storing sessions
  },

  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub
      }
      return session
    },
  },
})

export { handler as GET, handler as POST }
