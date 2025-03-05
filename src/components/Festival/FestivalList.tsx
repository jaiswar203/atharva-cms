'use client'
import React from 'react'
import { useGetFestivalsQuery, IFestival, useDeleteFestivalMutation } from "@/redux/api/college"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Calendar, Clock, Trash2, Image as ImageIcon, Plus } from "lucide-react"
import Link from "next/link"
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

const FestivalList = () => {
  const router = useRouter()
  const { data, isLoading, isError } = useGetFestivalsQuery()
  const [deleteFestival, { isLoading: isDeleting }] = useDeleteFestivalMutation()
  const [festivalToDelete, setFestivalToDelete] = React.useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (isError) {
    return <div className="text-center text-red-500">Error loading festivals. Please try again later.</div>
  }

  const handleDelete = async () => {
    if (festivalToDelete) {
      await deleteFestival(festivalToDelete).unwrap()
      setFestivalToDelete(null)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Festivals</h1>
        <Button onClick={() => router.push('/festivals/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Festival
        </Button>
      </div>

      <Dialog open={!!festivalToDelete} onOpenChange={(open) => !open && setFestivalToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Festival</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this festival? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setFestivalToDelete(null)}
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
        {data?.data.map((festival) => (
          <Card key={festival._id}>
            <CardHeader className="relative">
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                  onClick={() => setFestivalToDelete(festival._id)}
                  disabled={isDeleting}
                >
                  {isDeleting && festivalToDelete === festival._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="relative w-full h-48 mb-4">
                {festival.banner_image ? (
                  <Image
                    src={festival.banner_image}
                    alt={festival.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <CardTitle>{festival.name}</CardTitle>
              <CardDescription>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{festival.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{festival.time}</span>
                  </div>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-3">{festival.description}</p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => router.push(`/festivals/${festival._id}`)}
              >
                View More
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default FestivalList