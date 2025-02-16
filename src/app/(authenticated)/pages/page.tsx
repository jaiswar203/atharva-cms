'use client'

import { useGetPagesQuery } from '@/redux/api/content';
import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from 'next/navigation';

const Page = () => {
    const { data, isLoading } = useGetPagesQuery();
    const router = useRouter();

    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <div className="w-full">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Page</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead>Created At</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.data.map((page) => (
                        <TableRow key={page.page} onClick={() => router.push(`/pages/${page.page}`)} className='cursor-pointer'>
                            <TableCell className="font-medium capitalize">{page.page}</TableCell>
                            <TableCell>{page.content ? "Yes" : "No"}</TableCell>
                            <TableCell>{formatDistanceToNow(new Date(page.createdAt), { addSuffix: true })}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default Page