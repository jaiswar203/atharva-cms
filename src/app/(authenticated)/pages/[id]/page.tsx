"use client"

import { use } from "react"
import { useGetPageByIdQuery, useUpdatePageContentMutation } from "@/redux/api/content"
import { useState, useEffect } from "react"
import { useFieldArray, useForm, UseFormReturn } from "react-hook-form"
import { Edit, Plus, Check, X, VideoIcon } from "lucide-react"
import ReactPlayer from "react-player/lazy"
import Image from "next/image"
import { useFileUpload } from "@/hooks/useFileUpload"
import { toast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Typography from "@/components/ui/typography"
import MDXEditor from "@/components/Editor/MDXEditor"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface IPageForm {
    content: string
    carousel_images: { url: string }[]
    video_url: string
    page: string
}

interface CarouselSectionProps {
    isEditing: boolean
    carouselImages: { id: string; url: string }[]
    appendCarouselImage: (value: { url: string }) => void
    removeCarouselImage: (index: number) => void
    handleImageUpload: (file: File) => Promise<string>
    form: UseFormReturn<IPageForm>
}

interface VideoSectionProps {
    isEditing: boolean
    form: UseFormReturn<IPageForm>
    handleImageUpload: (file: File) => Promise<string>
}

interface ContentSectionProps {
    isEditing: boolean
    form: UseFormReturn<IPageForm>
    handleImageUpload: (file: File) => Promise<string>
}

export default function PageEditor({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [isEditing, setIsEditing] = useState(false)
    const { data, isLoading } = useGetPageByIdQuery(id)
    const [updatePageContent, { isLoading: updating }] = useUpdatePageContentMutation()
    const { uploadFile } = useFileUpload()

    const form = useForm<IPageForm>({
        defaultValues: {
            content: "",
            carousel_images: [],
            video_url: "",
            page: "",
        },
    })

    const {
        fields: carouselImages,
        append: appendCarouselImage,
        remove: removeCarouselImage,
    } = useFieldArray({
        control: form.control,
        name: "carousel_images",
    })

    useEffect(() => {
        if (data?.data) {
            form.reset({
                content: data.data.content,
                carousel_images: data.data.carousel_images.map((url) => ({ url })),
                video_url: data.data.video_url || "",
                page: data.data.page,
            })
        }
    }, [data, form])

    const handleImageUpload = async (file: File): Promise<string> => {
        const url = await uploadFile(file)
        if (!url) throw new Error("Failed to upload file")
        return url
    }

    const onSubmit = async (formData: IPageForm) => {
        try {
            await updatePageContent({
                id,
                body: {
                    ...formData,
                    carousel_images: formData.carousel_images.map((img) => img.url),
                },
            }).unwrap()

            setIsEditing(false)
            toast({
                title: "Success",
                description: "Page updated successfully",
            })
        } catch (error) {
            console.log(error)
            toast({
                title: "Error",
                description: "Failed to update page",
                variant: "destructive",
            })
        }
    }

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-2xl font-bold">{data?.data?.page}</CardTitle>
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                            <Button onClick={form.handleSubmit(onSubmit)} disabled={!form.formState.isDirty || updating}>
                                <Check className="mr-2 h-4 w-4" />
                                Update
                            </Button>
                        </div>
                    )}
                </CardHeader>
            </Card>

            <Form {...form}>
                <form className="space-y-8">
                    <CarouselSection
                        isEditing={isEditing}
                        carouselImages={carouselImages}
                        appendCarouselImage={appendCarouselImage}
                        removeCarouselImage={removeCarouselImage}
                        handleImageUpload={handleImageUpload}
                        form={form}
                    />

                    <Separator />

                    <VideoSection isEditing={isEditing} form={form} handleImageUpload={handleImageUpload} />

                    <Separator />

                    <ContentSection isEditing={isEditing} form={form} handleImageUpload={handleImageUpload} />
                </form>
            </Form>
        </div>
    )
}

function CarouselSection({
    isEditing,
    carouselImages,
    appendCarouselImage,
    removeCarouselImage,
    handleImageUpload,
    form,
}: CarouselSectionProps) {
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
                            <label className="cursor-pointer">
                                <Input
                                    type="file"
                                    className="hidden"
                                    id="carousel-images"
                                    multiple
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const files = e.target.files
                                        if (files) {
                                            for (const file of Array.from(files)) {
                                                const url = await handleImageUpload(file)
                                                if (url) {
                                                    appendCarouselImage({ url })
                                                }
                                            }
                                        }
                                    }}
                                />
                                <Label
                                    className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                                    htmlFor="carousel-images"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Images
                                </Label>
                            </label>
                        </div>
                    )}
                </div>

                {carouselImages.length > 0 ? (
                    <Carousel opts={{ align: "start" }} className="w-full">
                        <CarouselContent>
                            {carouselImages.map((field: { url: string }, index: number) => (
                                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                    <div className="p-1">
                                        <div className="relative aspect-video">
                                            <Image
                                                src={field.url || "/placeholder.svg"}
                                                alt={`Carousel image ${index + 1}`}
                                                fill
                                                className="object-cover rounded-md"
                                            />
                                            {isEditing && (
                                                <Button
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
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                ) : (
                    <Typography variant="p" className="text-sm text-muted-foreground">
                        No images added yet
                    </Typography>
                )}
            </CardContent>
        </Card>
    )
}

function VideoSection({ isEditing, form, handleImageUpload }: VideoSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-semibold">Video</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="video_url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Video URL</FormLabel>
                                <div className="flex gap-4">
                                    <FormControl>
                                        <Input {...field} placeholder="Enter video URL" disabled={!isEditing} />
                                    </FormControl>
                                    {isEditing && field.value && (
                                        <Button variant="destructive" onClick={() => form.setValue("video_url", "", { shouldDirty: true })}>
                                            <X className="mr-2 h-4 w-4" />
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            </FormItem>
                        )}
                    />
                    {isEditing && (
                        <div className="flex items-center gap-4">
                            <div className="text-center text-sm text-muted-foreground">or</div>
                            <Input
                                type="file"
                                accept="video/*"
                                id="video-url"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        const url = await handleImageUpload(file)
                                        if (url) {
                                            form.setValue("video_url", url, { shouldDirty: true })
                                        }
                                    }
                                }}
                            />
                            <Label
                                className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                                htmlFor="video-url"
                            >
                                <VideoIcon className="h-4 w-4" />
                                Upload Video
                            </Label>
                        </div>
                    )}
                    {form.watch("video_url") && (
                        <div className="relative aspect-video w-full max-w-3xl mt-4">
                            <ReactPlayer
                                url={form.watch("video_url")}
                                width="100%"
                                height="100%"
                                controls
                                playsinline
                                config={{
                                    file: {
                                        attributes: {
                                            controlsList: "nodownload",
                                            className: "rounded-md",
                                        },
                                    },
                                    youtube: {
                                        playerVars: {
                                            modestbranding: 1,
                                            controls: 1,
                                        },
                                    },
                                }}
                            />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function ContentSection({ isEditing, form, handleImageUpload }: ContentSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-semibold">Content</CardTitle>
            </CardHeader>
            <CardContent>
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MDXEditor
                                    markdown={field.value}
                                    onChange={field.onChange}
                                    editable={isEditing}
                                    onImageUpload={handleImageUpload}
                                    placeholder="Enter content here..."
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    )
}

