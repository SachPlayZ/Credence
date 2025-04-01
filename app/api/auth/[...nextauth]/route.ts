import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";
import { compare } from "bcryptjs";

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const client = await clientPromise;
        const db = client.db("credence");
        const user = await db.collection("users").findOne({
          email: credentials.email,
        });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }
      if (trigger === "update" && session) {
        // Handle session update
        return { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const client = await clientPromise;
        const db = client.db("credence");

        // Check if user has completed onboarding
        const dbUser = await db
          .collection("users")
          .findOne({ email: user.email });
        if (!dbUser?.onboarding?.completedAt) {
          // Redirect to onboarding if not completed
          return "/onboarding";
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Handle onboarding redirect
      if (url.startsWith("/onboarding")) {
        return `${baseUrl}/onboarding`;
      }
      // Default to dashboard for other cases
      if (url === baseUrl) {
        return `${baseUrl}/dashboard`;
      }
      return url;
    },
  },
});

export { handler as GET, handler as POST };
