"use client"

import { use } from "react"
import { useGetPageByIdQuery, useUpdatePageContentMutation } from "@/redux/api/content"
import { useState, useEffect } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { Edit, Check, X } from "lucide-react"
import { useFileUpload } from "@/hooks/useFileUpload"
import { toast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CarouselSection, VideoSection, ContentSection } from "@/components/PageEditor"
import { Form } from "@/components/ui/form"

interface IPageForm {
    content: string
    carousel_images: { id?: string; url: string }[]
    video_url: string
    page: string
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

