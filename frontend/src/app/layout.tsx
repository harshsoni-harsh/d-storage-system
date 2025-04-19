import type { Metadata } from "next";
import "@/app/globals.css";
import ClientProviders from "@/components/providers/ClientProviders";

export const metadata: Metadata = {
  title: "D Storage System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased dark:text-zinc-200">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
