import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import bcrypt from "bcryptjs";
import connectMongo from "./mongo";

export const authOptions = {
  adapter: MongoDBAdapter(connectMongo),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          _id: profile.sub, // Temporary ID that will be replaced
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const client = await connectMongo;
        const db = client.db();
        const user = await db.collection("users").findOne({
          email: credentials.email.toLowerCase(),
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          _id: user._id.toString(), // Explicit MongoDB _id
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (user) {
        token.userId = user.id; // Store the ID in token
      }
      return token;
    },
    async session({ session, token }) {
      // Send userId to client
      if (session.user && token.userId) {
        session.user["id"] = token.userId;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // For Google OAuth, ensure user exists in DB and get _id
      if (account.provider === "google") {
        const client = await connectMongo;
        const db = client.db();

        // Find or create user
        const existingUser = await db.collection("users").findOneAndUpdate(
          { email: profile.email },
          {
            $setOnInsert: {
              name: profile.name,
              email: profile.email,
              image: profile.picture,
              createdAt: new Date(),
            },
          },
          { upsert: true, returnDocument: "after" }
        );

        user._id = existingUser._id.toString();
        user.id = existingUser._id.toString();
      }
      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth?mode=login",
  },
  debug: process.env.NODE_ENV === "development",
};
