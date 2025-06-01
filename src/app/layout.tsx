'use client';

import "./globals.css";
import { Inter } from "next/font/google";
import { UserProvider } from "@/contexts/UserContext";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="corporate">
      <body className={inter.className}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="corporate"
          enableSystem
          themes={["corporate", "business", "winter", "dracula"]}
        >
          <UserProvider>{children}</UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
