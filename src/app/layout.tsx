import type { Metadata } from "next";
import { Inter } from "next/font/google"
import "./globals.css";
import StoreProvider from "@/redux/StoreProvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "AGI Admin Dashboard",
  description: "AGI Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <main>
          <StoreProvider>
            {children}
            <Toaster />
          </StoreProvider>
        </main>
      </body>
    </html>
  );
}