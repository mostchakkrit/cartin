"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#003399",
            color: "#fff",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "600",
          },
          success: { style: { background: "#0A8A00" } },
          error: { style: { background: "#CC0008" } },
        }}
      />
    </SessionProvider>
  );
}
