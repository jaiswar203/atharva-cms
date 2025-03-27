import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Typography from "@/components/ui/typography"
import { DragDropUpload } from "@/components/ui/drag-drop-upload"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { X, GripVertical } from "lucide-react"
import Image from "next/image"
import { UseFormReturn } from "react-hook-form"
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DropResult } from "@hello-pangea/dnd"

interface IPageForm {
    content: string
    carousel_images: { url: string }[]
    video_url: string
    page: string
}

interface CarouselSectionProps {
    isEditing: boolean
    carouselImages: { id?: string; url: string }[]
    appendCarouselImage: (value: { url: string }) => void
    removeCarouselImage: (index: number) => void
    handleImageUpload: (file: File) => Promise<string>
    form: UseFormReturn<IPageForm>
}

export function CarouselSection({
    isEditing,
    carouselImages,
    appendCarouselImage,
    removeCarouselImage,
    handleImageUpload,
    form,
}: CarouselSectionProps) {
    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return

        const items = Array.from(carouselImages)
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)

        form.setValue("carousel_images", items, { shouldDirty: true })
    }

    const handleFileDrops = async (files: File[]) => {
        for (const file of files) {
            const url = await handleImageUpload(file)
            if (url) {
                appendCarouselImage({ url })
            }
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-semibold">Carousel Images</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center mb-4">
                    {isEditing && (
                        <div className="flex items-center gap-4">
                            {carouselImages.length > 0 && (
                                <Button
                                    variant="destructive"
                                    onClick={() => form.setValue("carousel_images", [], { shouldDirty: true })}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Remove All
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {isEditing && (
                    <div className="mb-6">
                        <DragDropUpload 
                            onFilesDrop={handleFileDrops}
                            accept="image/*"
                            multiple
                            maxSize={5}
                            disabled={!isEditing}
                        />
                    </div>
                )}

                {carouselImages.length > 0 ? (
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="carousel" direction="horizontal">
                            {(provided: DroppableProvided) => (
                                <Carousel
                                    opts={{ align: "start" }}
                                    className="w-full"
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    <CarouselContent>
                                        {carouselImages.map((field: { url: string }, index: number) => (
                                            <Draggable
                                                key={field.url}
                                                draggableId={field.url}
                                                index={index}
                                                isDragDisabled={!isEditing}
                                            >
                                                {(provided: DraggableProvided) => (
                                                    <CarouselItem
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className="md:basis-1/2 lg:basis-1/3"
                                                    >
                                                        <div className="p-1">
                                                            <div className="relative aspect-video">
                                                                {isEditing && (
                                                                    <div
                                                                        {...provided.dragHandleProps}
                                                                        className="absolute top-2 left-2 z-10 cursor-grab bg-black/50 p-1 rounded-md"
                                                                    >
                                                                        <GripVertical className="h-4 w-4 text-white" />
                                                                    </div>
                                                                )}
                                                                <Image
                                                                    src={field.url || "/placeholder.svg"}
                                                                    alt={`Carousel image ${index + 1}`}
                                                                    fill
                                                                    className="object-cover rounded-md"
                                                                />
                                                                {isEditing && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        size="icon"
                                                                        className="absolute top-2 right-2"
                                                                        onClick={() => removeCarouselImage(index)}
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CarouselItem>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            )}
                        </Droppable>
                    </DragDropContext>
                ) : (
                    <Typography variant="p" className="text-sm text-muted-foreground">
                        No images added yet
                    </Typography>
                )}
            </CardContent>
        </Card>
    )
} 