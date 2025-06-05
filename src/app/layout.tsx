'use client';

import "./globals.css";
import { Inter } from "next/font/google";
import { UserProvider } from "@/contexts/UserContext";
import { ThemeProvider } from "next-themes";
import { Sidebar } from "@/components/Sidebar";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <html lang="en" suppressHydrationWarning data-theme="corporate">
      <body className={inter.className}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="corporate"
          enableSystem
          themes={["corporate", "business", "winter", "dracula"]}
        >
          <UserProvider>
            <div className="flex min-h-screen">
              <Sidebar 
                isCollapsed={isSidebarCollapsed} 
                onCollapsedChange={setIsSidebarCollapsed}
              />
              <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'pl-[50px]' : 'pl-64'}`}>
                {children}
              </main>
            </div>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
