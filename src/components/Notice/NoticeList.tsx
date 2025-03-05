import React from 'react'
import { useGetNoticesQuery, INotice, ICollege, useDeleteNoticeByIdMutation } from "@/redux/api/college"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Paperclip, ExternalLink, Eye, Trash2 } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type NoticeWithCollege = INotice & { college: ICollege }

interface NoticeListProps {
  onViewNotice: (notice: NoticeWithCollege) => void
}

const NoticeList = ({ onViewNotice }: NoticeListProps) => {
  const { data, isLoading, isError } = useGetNoticesQuery()
  const [deleteNotice, { isLoading: isDeleting }] = useDeleteNoticeByIdMutation()
  const [noticeToDelete, setNoticeToDelete] = React.useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (isError) {
    return <div className="text-center text-red-500">Error loading notices. Please try again later.</div>
  }

  const handleDelete = async () => {
    if (noticeToDelete) {
      await deleteNotice(noticeToDelete).unwrap()
      setNoticeToDelete(null)
    }
  }

  return (
    <>
      <Dialog open={!!noticeToDelete} onOpenChange={(open) => !open && setNoticeToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Notice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this notice? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setNoticeToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Delete</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data?.data.map((notice) => (
          <Card key={notice._id}>
            <CardHeader className="relative">
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                  onClick={() => setNoticeToDelete(notice._id)}
                  disabled={isDeleting}
                >
                  {isDeleting && noticeToDelete === notice._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Avatar className="mb-2" >
                <AvatarImage src={notice.college.logo} />
                <AvatarFallback>
                  {notice.college.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{notice.title}</CardTitle>
              <CardDescription>
                <div className="flex justify-between items-center">
                  <span>{notice.college.name}</span>
                  <span>{new Date(notice.date).toLocaleDateString()}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{notice.description}</p>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2">
              {notice.attachments.length > 0 && (
                <div className="flex items-center gap-2 w-full">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    <span className="text-sm text-gray-600">
                      {notice.attachments.length} attachment{notice.attachments.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-2">
                        <Eye className="h-4 w-4" />
                        <span className="ml-2">View</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {notice.attachments.map((attachment) => (
                        <DropdownMenuItem key={attachment.id} asChild>
                          <Link
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Paperclip className="h-4 w-4" />
                            {attachment.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              <div className="flex gap-2 w-full">
                {notice.link && (
                  <Link
                    href={notice.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    External Link
                  </Link>
                )}
                <Button
                  variant="outline"
                  className="ml-auto"
                  onClick={() => onViewNotice(notice)}
                >
                  View More
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  )
}

export default NoticeList