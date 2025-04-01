'use client'
import React, { useEffect, useState } from 'react'
import { useGetHighlightsQuery, useDeleteHighlightMutation, useChangeHighlightOrderMutation } from "@/redux/api/college"
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card"
import { Loader2, Trash2, PlusCircle, Eye, Sparkles, Images, ArrowUpDown, GripVertical } from "lucide-react"
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
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

const HighLight = () => {
  const router = useRouter()
  const { data, isLoading, isError } = useGetHighlightsQuery()
  const [deleteHighlight, { isLoading: isDeleting }] = useDeleteHighlightMutation()
  const [changeHighlightOrder, { isLoading: isChangingOrder }] = useChangeHighlightOrderMutation()
  const [highlightToDelete, setHighlightToDelete] = useState<string | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [highlightOrder, setHighlightOrder] = useState<Array<{ id: string; index: number; title: string }>>([])

  useEffect(() => {
    if (data?.data) {
      const sortedHighlights = [...data.data].sort((a, b) => a.index - b.index)
      setHighlightOrder(sortedHighlights.map(h => ({
        id: h._id,
        index: h.index,
        title: h.title
      })))
    }
  }, [data])

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

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(highlightOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update indexes
    const updatedItems = items.map((item, index) => ({
      ...item,
      index
    }));

    setHighlightOrder(updatedItems);
  };

  const handleSaveOrder = async () => {
    try {
      // Prepare the data for the API
      const orderData = {
        highlights: highlightOrder.map(item => ({ id: item.id, index: item.index }))
      }

      // Call the API to update the order
      await changeHighlightOrder(orderData).unwrap()

      // Close the modal
      setShowOrderModal(false)
    } catch (error) {
      console.error("Failed to update highlight order:", error)
      // You could add error handling UI here
    }
  }

  // Create a new array before sorting to avoid mutating the original
  const sortedHighlights = data?.data ? [...data.data].sort((a, b) => b.index - a.index) : []

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-amber-500" />
          <h1 className="text-3xl font-bold">Highlights</h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowOrderModal(true)}
            variant="outline"
            className="border-amber-500 text-amber-700 hover:bg-amber-50"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Change Order
          </Button>
          <Button onClick={() => router.push('/highlights/new')} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Highlight
          </Button>
        </div>
      </div>

      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent className="max-w-2xl h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Change Highlight Order</DialogTitle>
            <DialogDescription>
              Drag and drop to reorder the highlights
            </DialogDescription>
          </DialogHeader>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="highlights">
              {(provided) => (
                <div
                  className="space-y-4 "
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {highlightOrder.map((highlight, index) => (
                    <Draggable key={highlight.id} draggableId={highlight.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-4 p-4 border rounded-lg bg-white ${snapshot.isDragging ? 'z-50 shadow-xl' : ''}`}
                          style={{
                            ...provided.draggableProps.style,
                            zIndex: snapshot.isDragging ? 9999 : 'auto'
                          }}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab"
                          >
                            <GripVertical className="h-5 w-5 text-gray-400" />
                          </div>
                          <span className="font-medium w-6">{index + 1}.</span>
                          <span className="flex-1">{highlight.title}</span>
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            Position {index + 1}
                          </Badge>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowOrderModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveOrder}
              className="bg-amber-500 hover:bg-amber-600"
              disabled={isChangingOrder}
            >
              {isChangingOrder ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Order'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
        {sortedHighlights.map((highlight) => (
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
                      College: {highlight?.college?.name}
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