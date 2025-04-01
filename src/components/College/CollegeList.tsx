"use client"

import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ICollege, useDeleteCollegeMutation } from "@/redux/api/college"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

function trimDescription(description: string, maxLength = 100) {
    if (description.length <= maxLength) return description
    return `${description.slice(0, maxLength)}...`
}

export default function OrganizationsTable({ organizations }: { organizations: ICollege[] }) {
    const router = useRouter()
    const [deleteCollege] = useDeleteCollegeMutation()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [collegeToDelete, setCollegeToDelete] = useState<ICollege | null>(null)

    const handleDelete = async (e: React.MouseEvent, college: ICollege) => {
        e.stopPropagation() // Prevent row click event
        setCollegeToDelete(college)
    }

    const confirmDelete = async () => {
        if (!collegeToDelete) return

        try {
            setDeletingId(collegeToDelete._id)
            await deleteCollege(collegeToDelete._id).unwrap()
            toast({
                title: "Success",
                description: "College deleted successfully",
            })
        } catch (error) {
            console.log(error)  
            toast({
                title: "Error",
                description: "Failed to delete college",
                variant: "destructive"
            })
        } finally {
            setDeletingId(null)
            setCollegeToDelete(null)
        }
    }

    return (
        <div className="w-full">
            <Dialog open={!!collegeToDelete} onOpenChange={(open) => !open && setCollegeToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete College</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {collegeToDelete?.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCollegeToDelete(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deletingId === collegeToDelete?._id}
                        >
                            {deletingId === collegeToDelete?._id ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Logo</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Created</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {organizations.map((org) => (
                        <TableRow key={org.name}>
                            <TableCell onClick={() => router.push(`/colleges/${org._id}`)} className="cursor-pointer">
                                <div className="relative h-12 w-12">
                                    <Image
                                        src={org.logo || "/placeholder.svg"}
                                        alt={`${org.name} logo`}
                                        fill
                                        className="rounded-lg object-contain"
                                    />
                                </div>
                            </TableCell>
                            <TableCell onClick={() => router.push(`/colleges/${org._id}`)} className="font-medium cursor-pointer">{org.name}</TableCell>
                            <TableCell onClick={() => router.push(`/colleges/${org._id}`)} className="cursor-pointer">{trimDescription(org.description)}</TableCell>
                            <TableCell onClick={() => router.push(`/colleges/${org._id}`)} className="text-right cursor-pointer">
                                {formatDistanceToNow(new Date(org.createdAt), { addSuffix: true })}
                            </TableCell>
                            <TableCell>
                                <Button 
                                    variant="destructive" 
                                    size="icon"
                                    onClick={(e) => handleDelete(e, org)}
                                    disabled={deletingId === org._id}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

