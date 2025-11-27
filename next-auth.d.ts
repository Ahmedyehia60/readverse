import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      rememberMe?: boolean;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    // image?: string;
    rememberMe?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    picture?: string;
    rememberMe?: boolean;
  }
}
