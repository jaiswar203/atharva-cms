import type { Metadata } from "next";
import "../globals.css";
import LayoutWithQuery from "./LayoutComponent";

export const metadata: Metadata = {
    title: "AGI Admin Dashboard",
    description: "AGI Admin Dashboard",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <LayoutWithQuery>{children}</LayoutWithQuery>;
}