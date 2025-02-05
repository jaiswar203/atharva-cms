"use client"
import { useGetCollegeByIdQuery, useUpdateCollegeByIdMutation } from '@/redux/api/college'
import React, { useState, useEffect, useCallback } from 'react'
import Typography from '../ui/typography'
import { Pencil, X, Eye, Plus } from 'lucide-react'
import { Button } from '../ui/button'
import Image from 'next/image'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { useFieldArray, useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { useFileUpload } from '@/hooks/useFileUpload'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel'
import { toast } from '@/hooks/use-toast'
import CollegeTabs from './CollegeTabs'
import { Separator } from '../ui/separator'

interface IProps {
    id: string
}

export interface ICollegeFormInputs {
    name: string;
    description: string;
    logo: string;
    banner_image: string;
    carousel_images: { url: string }[];
}

const CollegeDetail = ({ id }: IProps) => {
    const [isEditing, setIsEditing] = useState(false)
    const [viewImageUrl, setViewImageUrl] = useState<string | null>(null)
    const [showCarouselModal, setShowCarouselModal] = useState(false)
    const { uploadFile, uploading } = useFileUpload()

    const { data } = useGetCollegeByIdQuery(id)
    const [updateCollegeApi, { isLoading: updating }] = useUpdateCollegeByIdMutation()

    const form = useForm<ICollegeFormInputs>({
        defaultValues: {
            name: '',
            description: '',
            logo: '',
            banner_image: '',
            carousel_images: []
        }
    })


    const { fields: carouselImages, append: appendCarouselImage, remove: removeCarouselImage } = useFieldArray({
        control: form.control,
        name: 'carousel_images'
    })

    useEffect(() => {
        if (data?.data) {
            form.reset({
                name: data.data.name,
                description: data.data.description,
                logo: data.data.logo,
                banner_image: data.data.banner_image,
                carousel_images: data.data.carousel_images.map((image) => ({ url: image })) || []
            })
        }
    }, [data, form])


    const onSubmit = async (data: ICollegeFormInputs) => {
        try {
            const carouselImages = data.carousel_images.map((image) => image.url)
            const res = await updateCollegeApi({ data: { ...data, carousel_images: carouselImages }, id }).unwrap()
            if (res.data) {
                setIsEditing(false)
            }
            toast({
                title: "Success",
                description: "College updated successfully",
                variant: "default"
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive"
            })
            setIsEditing(false)
            console.log(error)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof ICollegeFormInputs) => {
        const files = e.target.files
        if (!files) return

        for (const file of files) {
            const url = await uploadFile(file)
            if (url) {
                if (fieldName === 'carousel_images') {
                    appendCarouselImage({ url })
                } else {
                    form.setValue(fieldName, url, { shouldDirty: true })
                }
            }
        }
    }

    const ImageViewDialog = () => (
        <Dialog open={!!viewImageUrl} onOpenChange={() => setViewImageUrl(null)}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Image Preview</DialogTitle>
                </DialogHeader>
                {viewImageUrl && (
                    <div className="relative w-full h-[60vh]">
                        <Image
                            src={viewImageUrl}
                            alt="Preview"
                            fill
                            className="object-contain"
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )

    return (
        <div className="space-y-6">
            <ImageViewDialog />

            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row items-center gap-2">
                    <Image
                        src={form.watch('logo') || "/placeholder.svg"}
                        alt={`${form.watch('name')} logo`}
                        width={60}
                        height={60}
                    />
                    <Typography className="ml-2" variant="h2">{form.watch('name')}</Typography>
                </div>
                {
                    !isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>
                            <Pencil size={20} />
                            <span>Edit</span>
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                                <X size={20} />
                                <span>Cancel</span>
                            </Button>
                            <Button onClick={form.handleSubmit(onSubmit)} loading={{ isLoading: updating }} disabled={!form.formState.isDirty || updating} >
                                <span>Save</span>
                            </Button>
                        </div>
                    )
                }
            </div>

            <Form {...form}>
                <form className="grid grid-cols-1 gap-6">
                    <div className="flex flex-row gap-4 justify-between">
                        <FormField
                            control={form.control}
                            name="logo"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <div className="">
                                        <FormLabel>
                                            Logo
                                        </FormLabel>
                                        <br />
                                        {!isEditing && (
                                            <Button
                                                type='button'
                                                size="sm"
                                                onClick={() => setViewImageUrl(field.value)}
                                            >
                                                <Eye size={16} />
                                                <span className="ml-2">View</span>
                                            </Button>
                                        )}
                                    </div>
                                    <FormControl>
                                        {isEditing && (
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileUpload(e, 'logo')}
                                                disabled={uploading}
                                            />
                                        )}
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="banner_image"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <div className="">
                                        <FormLabel>
                                            Banner Image
                                        </FormLabel>
                                        <br />
                                        {!isEditing && (
                                            <Button
                                                type='button'
                                                size="sm"
                                                onClick={() => setViewImageUrl(field.value)}
                                            >
                                                <Eye size={16} />
                                                <span className="ml-2">View</span>
                                            </Button>
                                        )}
                                    </div>
                                    <FormControl>
                                        {isEditing && (
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileUpload(e, 'banner_image')}
                                                disabled={uploading}
                                            />
                                        )}
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    College Name
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        disabled={!isEditing}
                                        placeholder="Enter college name"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Description
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        disabled={!isEditing}
                                        placeholder="Enter college description"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <FormLabel>Carousel Images</FormLabel>
                            {
                                isEditing && (
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => setShowCarouselModal(true)}
                                    >
                                        <Plus size={30} />
                                        <Typography variant='p'>Add Image</Typography>
                                    </Button>
                                )
                            }
                        </div>
                        {carouselImages?.length > 0 ? (
                            <div className="relative">
                                <Carousel
                                    opts={{
                                        align: "start",
                                    }}
                                    className="w-full"
                                >
                                    <CarouselContent>
                                        {carouselImages.map((image, index) => (
                                            <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/4">
                                                <div className="p-1">
                                                    <div className="relative aspect-video">
                                                        <Image
                                                            src={image.url}
                                                            alt={`Carousel image ${index + 1}`}
                                                            fill
                                                            className="object-cover rounded-md"
                                                        />
                                                        {
                                                            isEditing && (
                                                                <div className="flex justify-center items-center size-8 absolute bottom-2 right-2  rounded-full bg-destructive hover:bg-destructive/80 transition-all duration-300 cursor-pointer top-1" onClick={() => removeCarouselImage(index)}>
                                                                    <X size={16} className='text-white' />
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="left-2" type='button' />
                                    <CarouselNext className="right-2" type='button' />
                                </Carousel>
                                <Typography variant="p" className="text-sm text-gray-500 mt-2 text-center">
                                    {carouselImages.length} image{carouselImages.length !== 1 ? 's' : ''}
                                </Typography>
                            </div>
                        ) : (
                            <Typography variant="p" className="text-sm text-gray-500">
                                No carousel images added yet
                            </Typography>
                        )}
                    </div>

                    <Dialog open={showCarouselModal} onOpenChange={setShowCarouselModal}>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>Add Carousel Images</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                {isEditing && (
                                    <div className="flex gap-4">
                                        <Input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, 'carousel_images')}
                                            disabled={uploading}
                                        />
                                        <Typography variant="p" className="text-sm text-gray-500">
                                            or
                                        </Typography>
                                        <Input
                                            placeholder="Add image URL and press Enter"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const input = e.target as HTMLInputElement
                                                    if (input.value.trim()) {
                                                        appendCarouselImage({ url: input.value.trim() })
                                                        input.value = ''
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </form>
            </Form>
            <Separator  />
            <br />
            <CollegeTabs collegeId={id} />
        </div>
    )
}

export default CollegeDetail