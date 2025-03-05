'use client'
import React, { useRef } from 'react'
import { useGetCollegesQuery, useCreateFestivalMutation, useUpdateFestivalMutation } from '@/redux/api/college'
import { IFestival } from '@/redux/api/college'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useFileUpload } from '@/hooks/useFileUpload'
import { toast } from '@/hooks/use-toast'
import { X, CalendarIcon } from 'lucide-react'
import Image from 'next/image'
import MDXEditor, { MDXEditorMethods } from '../Editor/MDXEditor'
import { DateRange } from 'react-day-picker'
import { addDays, format } from 'date-fns'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { cn } from '@/lib/utils'

export type FestivalFormInputs = {
    name: string;
    description: string;
    content: string;
    banner_image: string;
    images: string[];
    college_id: string;
    date: string;
    time: string;
}

interface FestivalDetailProps {
    festival?: IFestival
    onClose: () => void
}

const FestivalDetail = ({ festival, onClose }: FestivalDetailProps) => {
    const { data: colleges } = useGetCollegesQuery()
    const [createFestival, { isLoading: isCreating }] = useCreateFestivalMutation()
    const [updateFestival, { isLoading: isUpdating }] = useUpdateFestivalMutation()
    const { uploadFile, uploading } = useFileUpload()
    const editorRef = useRef<MDXEditorMethods>(null)
    const [startDate, setStartDate] = React.useState<Date | undefined>(undefined)
    const [endDate, setEndDate] = React.useState<Date | undefined>(undefined)
    const [startTime, setStartTime] = React.useState<string>('10:00 AM')
    const [endTime, setEndTime] = React.useState<string>('10:00 PM')

    // Parse the date range if it exists
    React.useEffect(() => {
        if (festival?.date) {
            const [startStr, endStr] = festival.date.split(' - ')
            setStartDate(new Date(startStr))
            setEndDate(new Date(endStr))
        }
        if (festival?.time) {
            const [start, end] = festival.time.split(' - ')
            setStartTime(start)
            setEndTime(end)
        }
    }, [festival])

    const form = useForm<FestivalFormInputs>({
        defaultValues: {
            name: festival?.name || '',
            description: festival?.description || '',
            content: festival?.content || '',
            banner_image: festival?.banner_image || '',
            images: festival?.images || [],
            college_id: festival?.college_id || '',
            date: festival?.date || '',
            time: festival?.time || '10:00 AM - 10:00 PM'
        }
    })

    // Update form values when dates/times change
    React.useEffect(() => {
        if (startDate && endDate) {
            const dateStr = `${format(startDate, 'yyyy-MM-dd')} - ${format(endDate, 'yyyy-MM-dd')}`
            form.setValue('date', dateStr)
        }
    }, [startDate, endDate, form])

    React.useEffect(() => {
        const timeStr = `${startTime} - ${endTime}`
        form.setValue('time', timeStr)
    }, [startTime, endTime, form])

    const onSubmit = async (formData: FestivalFormInputs) => {
        try {
            const content = editorRef.current?.getMarkdown() || formData.content

            const submitData = {
                ...formData,
                content,
                images: formData.images || []
            }

            if (festival?._id) {
                await updateFestival({ id: festival._id, data: submitData }).unwrap()
                toast({
                    title: "Success",
                    description: "Festival updated successfully",
                })
            } else {
                await createFestival(submitData).unwrap()
                toast({
                    title: "Success",
                    description: "Festival added successfully",
                })
            }
            onClose()
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive"
            })
        }
    }

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const url = await uploadFile(file)
        if (url) {
            form.setValue('banner_image', url)
        }
    }

    const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        const currentImages = form.getValues('images') || []
        
        for (const file of files) {
            const url = await uploadFile(file)
            if (url) {
                currentImages.push(url)
            }
        }

        form.setValue('images', currentImages)
    }

    const handleImageUpload = async (file: File): Promise<string> => {
        const url = await uploadFile(file)
        return url || ''
    }

    const removeImage = (index: number) => {
        const currentImages = form.getValues('images')
        const filteredImages = currentImages.filter((_: string, i: number) => i !== index)
        form.setValue('images', filteredImages)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="college_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>College</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a college" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {colleges?.data.map((college) => (
                                        <SelectItem key={college._id} value={college._id} className=''>
                                            <div className="flex flex-row items-center gap-2">
                                                <Image src={college.logo} alt={college.name} width={20} height={20} />
                                                <p className='text-sm'>{college.name}</p>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Enter festival name" />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Enter short description" />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                                <MDXEditor
                                    ref={editorRef}
                                    markdown={field.value}
                                    onImageUpload={handleImageUpload}
                                    onChange={(value) => {
                                        field.onChange(value)
                                    }}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !startDate && "text-muted-foreground"
                                    )}
                                >
                                    {startDate ? (
                                        format(startDate, "PPP")
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
                                    disabled={(date) =>
                                        date < new Date()
                                    }
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </FormItem>

                    <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !endDate && "text-muted-foreground"
                                    )}
                                >
                                    {endDate ? (
                                        format(endDate, "PPP")
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                    disabled={(date) =>
                                        date < (startDate || new Date())
                                    }
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </FormItem>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <Input
                            type="time"
                            value={startTime}
                            onChange={(e) => {
                                const time = e.target.value
                                const formattedTime = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    hour12: true
                                })
                                setStartTime(formattedTime)
                            }}
                        />
                    </FormItem>

                    <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <Input
                            type="time"
                            value={endTime}
                            onChange={(e) => {
                                const time = e.target.value
                                const formattedTime = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    hour12: true
                                })
                                setEndTime(formattedTime)
                            }}
                        />
                    </FormItem>
                </div>

                <FormField
                    control={form.control}
                    name="banner_image"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Banner Image</FormLabel>
                            {field.value && (
                                <div className="relative w-full h-48 mb-2">
                                    <Image
                                        src={field.value}
                                        alt="Banner"
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                </div>
                            )}
                            <FormControl>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBannerUpload}
                                    disabled={uploading}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Gallery Images</FormLabel>
                            <div className="grid grid-cols-3 gap-4 mb-2">
                                {field.value?.map((image, index) => (
                                    <div key={index} className="relative">
                                        <Image
                                            src={image}
                                            alt={`Gallery ${index + 1}`}
                                            width={200}
                                            height={200}
                                            className="object-cover rounded-lg"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 h-6 w-6"
                                            onClick={() => removeImage(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <FormControl>
                                <Input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImagesUpload}
                                    disabled={uploading}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating || isUpdating}>
                        {isCreating || isUpdating ? (
                            <>Saving...</>
                        ) : (
                            <>{festival ? 'Update' : 'Create'} Festival</>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

export default FestivalDetail 