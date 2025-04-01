import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Web3Provider } from "../components/providers/WalletProvider";
import type { Metadata } from "next";
import "@/app/globals.css";

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
            <body className="antialiased">
                <Web3Provider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        {children}
                    </ThemeProvider>
                </Web3Provider>
            </body>
        </html>
    );
}
