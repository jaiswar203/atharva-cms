"use client"

import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ICollege } from "@/redux/api/college"
import { useRouter } from "next/navigation"


function trimDescription(description: string, maxLength = 100) {
    if (description.length <= maxLength) return description
    return `${description.slice(0, maxLength)}...`
}

export default function OrganizationsTable({ organizations }: { organizations: ICollege[] }) {
    const router = useRouter()
    return (
        <div className="w-full">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Logo</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Created</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {organizations.map((org) => (
                        <TableRow key={org.name} onClick={() => router.push(`/colleges/${org._id}`)} className="cursor-pointer">
                            <TableCell>
                                <div className="relative h-12 w-12">
                                    <Image
                                        src={org.logo || "/placeholder.svg"}
                                        alt={`${org.name} logo`}
                                        fill
                                        className="rounded-lg object-contain"
                                    />
                                </div>
                            </TableCell>
                            <TableCell className="font-medium">{org.name}</TableCell>
                            <TableCell>{trimDescription(org.description)}</TableCell>
                            <TableCell className="text-right">
                                {formatDistanceToNow(new Date(org.createdAt), { addSuffix: true })}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

