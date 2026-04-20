import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AppProviders } from "@/providers/AppProviders";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { ClerkProvider } from "@clerk/nextjs";
import { BffAuthSync } from "@/providers/BffAuthSync";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenEnergyData (OEDA)",
  description: "Energy AI Platform MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className={`${inter.variable} ${jetbrainsMono.variable} h-full flex font-sans bg-slate-50 text-slate-900 overflow-hidden`}>
        <AppProviders>
          <BffAuthSync />
          <div className="flex h-screen w-full">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-slate-50">
              <Topbar />
              <main className="flex-1 overflow-auto relative p-6">
                {children}
                <CommandPalette />
              </main>
            </div>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
