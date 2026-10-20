import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Ad Astra — Your AI workspace", template: "%s · Ad Astra" },
  description: "Chat, create, analyze and organize your work with AI — all from one powerful workspace.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body className="min-h-screen bg-app-bg font-body text-base text-app-text antialiased">{children}</body></html>;
}
