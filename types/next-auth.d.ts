import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      currency: string;
      onboarded: boolean;
      role: "USER" | "ADMIN";
    };
  }

  interface User {
    id: string;
    currency?: string;
    onboarded?: boolean;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    currency?: string;
    onboarded?: boolean;
    role?: string;
  }
}
