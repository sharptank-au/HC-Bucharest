"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { AuthProvider } from "@/contexts/auth-context";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ConvexAuthProvider client={convex}>
        <ConvexProvider client={convex}>{children}</ConvexProvider>
      </ConvexAuthProvider>
    </AuthProvider>
  );
}
