import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import NoticeList from './NoticeList'
import NoticeDetail from './NoticeDetail'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { INotice, ICollege } from '@/redux/api/college'

type NoticeWithCollege = INotice & { college: ICollege }

const Notice = () => {
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [selectedNotice, setSelectedNotice] = useState<NoticeWithCollege | null>(null)

    const handleViewNotice = (notice: NoticeWithCollege) => {
        setSelectedNotice(notice)
    }

    const handleCloseDialog = () => {
        setShowAddDialog(false)
        setSelectedNotice(null)
    }

    return (
        <>
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Notices</h1>
                    <Button onClick={() => setShowAddDialog(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Send New Notice
                    </Button>
                </div>
                <NoticeList onViewNotice={handleViewNotice} />
            </div>

            <Dialog open={showAddDialog || !!selectedNotice} onOpenChange={handleCloseDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedNotice ? 'Update Notice' : 'Add New Notice'}</DialogTitle>
                    </DialogHeader>
                    <NoticeDetail
                        notice={selectedNotice || undefined}
                        onClose={handleCloseDialog}
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}

export default Notice