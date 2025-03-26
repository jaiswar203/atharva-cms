'use client'
import React from 'react'
import { useGetHighlightsQuery, useDeleteHighlightMutation } from "@/redux/api/college"
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card"
import { Loader2, Trash2, PlusCircle, Eye, Sparkles, Images } from "lucide-react"
import { Button } from '../ui/button'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { Badge } from "../ui/badge"

const HighLight = () => {
  const router = useRouter()
  const { data, isLoading, isError } = useGetHighlightsQuery()
  const [deleteHighlight, { isLoading: isDeleting }] = useDeleteHighlightMutation()
  const [highlightToDelete, setHighlightToDelete] = React.useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (isError) {
    return <div className="text-center text-red-500">Error loading highlights. Please try again later.</div>
  }

  const handleDelete = async () => {
    if (highlightToDelete) {
      await deleteHighlight(highlightToDelete).unwrap()
      setHighlightToDelete(null)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-amber-500" />
          <h1 className="text-3xl font-bold">Highlights</h1>
        </div>
        <Button onClick={() => router.push('/highlights/new')} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Highlight
        </Button>
      </div>

      <Dialog open={!!highlightToDelete} onOpenChange={(open) => !open && setHighlightToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Highlight</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this highlight? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setHighlightToDelete(null)}
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

      <div className="grid gap-6 grid-cols-1">
        {data?.data.map((highlight) => (
          <Card key={highlight._id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 relative h-48 md:h-auto">
                {highlight.banner_image ? (
                  <Image
                    src={highlight.banner_image}
                    alt={highlight.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-amber-50">
                    <Sparkles className="h-16 w-16 text-amber-300" />
                  </div>
                )}
                {highlight.carousel_images && highlight.carousel_images.length > 0 && (
                  <Badge className="absolute bottom-2 right-2 bg-black/70 text-white flex items-center gap-1">
                    <Images className="h-3.5 w-3.5" />
                    {highlight.carousel_images.length}
                  </Badge>
                )}
              </div>
              
              <div className="p-4 md:p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-1">{highlight.title}</CardTitle>
                    <CardDescription className="text-amber-600">
                      {new Date(highlight.createdAt || '').toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                    onClick={() => setHighlightToDelete(highlight._id)}
                    disabled={isDeleting}
                  >
                    {isDeleting && highlightToDelete === highlight._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <CardContent className="px-0 py-3 flex-grow">
                  <p className="text-sm text-gray-600 line-clamp-3">{highlight.description}</p>
                </CardContent>
                
                <CardFooter className="px-0 pt-3 flex justify-between items-center border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">
                      {/* College ID: {highlight.college_id.substring(0, 8)}... */}
                    </Badge>
                    {highlight.section && (
                      <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                        Section
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="border-amber-500 text-amber-700 hover:bg-amber-50"
                    onClick={() => router.push(`/highlights/${highlight._id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </CardFooter>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default HighLight