"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import Typography from "../ui/typography"
import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarImage } from "../ui/avatar"
import { AvatarFallback } from "@radix-ui/react-avatar"
import { usePathname } from "next/navigation"
import { useAppSelector } from "@/redux/hook"
import { Building2 } from "lucide-react"

// Menu items.
const items = [
    {
        title: "Colleges",
        url: "colleges",
        icon: Building2,
    },
]

export function AppSidebar() {
    const pathname = usePathname()
    const { user } = useAppSelector(state => state.app)

    if (!user) return null

    const isActive = (url: string) => {
        return pathname.startsWith(`/${url}`)
    }

    return (
        <Sidebar>
            <SidebarHeader className="flex flex-row items-center justify-center">
                <Image src="/images/icon.png" width={100} height={50} alt="logo" />
                <Typography variant="h3" className="!font-bold">Admin Dashboard</Typography>
            </SidebarHeader>
            <SidebarContent className="md:mt-0 p-2">
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                className="[&>svg]:size-5 !data-[active=true]:bg-black[data-active=true] "
                                isActive={isActive(item.url)}
                            >
                                <Link href={`/${item.url}`} className="mb-2">
                                    <item.icon
                                        size={20}
                                    // className={`text-3xl ${isActive(item.url) ? "text-white" : "text-black"
                                    //     }`}
                                    />
                                    <Typography
                                        variant="p"
                                        className="!font-medium"
                                    // className={`font-normal ${isActive(item.url) ? "text-white font-medium" : ""
                                    //     }`}
                                    >
                                        {item.title}
                                    </Typography>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <div className="flex gap-2 cursor-pointer">
                    <Avatar className="w-16 h-16">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="">
                        <Typography variant="h3">{user?.name}</Typography>
                        <Typography variant="p" className="text-xs">
                            {user?.email}
                        </Typography>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}