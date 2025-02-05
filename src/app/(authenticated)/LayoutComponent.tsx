"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React, { useEffect } from "react";
import { useAppSelector } from "@/redux/hook";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/common/Sidebar";

const LayoutWithQuery = ({ children }: Readonly<{
    children: React.ReactNode;
}>) => {
    const { user } = useAppSelector(state => state.app)
    const router = useRouter()

    useEffect(() => {
        if (!user?.token) {
            router.push('/auth/login')
        }
    }, [user, router])

    if (!user?.token) return null

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarTrigger />
            <main className="md:p-6 p-2 mt-5 w-full">{children}</main>
        </SidebarProvider>
    );
};

export default LayoutWithQuery;