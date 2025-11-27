import connectToDatabase from "@/lib/mongo";
import User from "@/models/users";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredintialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

//================== NextAuth Options =======================
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
  },

  providers: [
    GoogleProvider({
      id: "google-signin",
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    GoogleProvider({
      id: "google-signup",
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      id: "facebook-signin",
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    FacebookProvider({
      id: "facebook-signup",
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),

    CredintialsProvider({
      name: "credentials",
      credentials: {
        email: {},
        password: {},
        rememberMe: { label: "Remember Me", type: "checkbox" },
      },

      //================== Authorize =======================
      async authorize(credentials) {
        try {
          await connectToDatabase();
          const user = await User.findOne({ email: credentials?.email });
          if (!user) {
            throw new Error("Invalid credentials");
          }
          const isValidPassword = await bcrypt.compare(
            credentials?.password ?? "",
            user.password as string
          );
          if (!isValidPassword) {
            throw new Error("Invalid credentials");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            rememberMe: credentials?.rememberMe === "true",
          };
        } catch (error) {
          console.error("Authorization Error:", error);
          return null;
        }
      },
    }),
  ],

  //================== Callbacks =======================
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account) return true;

      await connectToDatabase();
      if (
        account.provider === "google-signin" ||
        account.provider === "facebook-signin"
      ) {
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          return "/Login?error=NoAccount";
        }

        user.id = existingUser._id.toString();
        return true;
      }

      if (
        account.provider === "google-signup" ||
        account.provider === "facebook-signup"
      ) {
        const existingUser = await User.findOne({ email: user.email });

        if (existingUser) {
          return "/Login?error=AlreadyExists";
        }
        let loginProvider: string;

        if (account.provider === "google-signup") {
          loginProvider = "google";
        } else {
          loginProvider = "facebook";
        }

        const newUser = await User.create({
          name: user.name || profile?.name || "",
          email: user.email,
          password: null,
          image: user.image,
          provider: loginProvider,
        });

        user.id = newUser._id.toString();
        return true;
      }

      return true;
    },

    //================== JWT Callback =======================
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? token.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image ?? token.picture;

        token.rememberMe = user.rememberMe ?? false;

        if (token.rememberMe) {
          token.exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
        } else {
          token.exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
        }
      }
      console.log("JWT TOKEN:", token);
      return token;
    },
    //================== Session Callback =======================
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          image: token.picture as string | undefined,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/Login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
