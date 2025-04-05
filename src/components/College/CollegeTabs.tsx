'use client'
import React, { useEffect, useState } from 'react'
import { ITab, useAddTabToCollegeMutation, useDeleteTabByIdMutation, useGetTabsByCollegeIdQuery, useUpdateTabByIdMutation } from '@/redux/api/college'
import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { cn, trimText } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { Check, Edit, Plus, X } from 'lucide-react'
import { Button } from '../ui/button'
import Typography from '../ui/typography'
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form'
import { Input } from '../ui/input'
import { toast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import TabSections from './TabSections'
import MDXEditor from '../Editor/MDXEditor'

interface IProps {
    collegeId: string
}

export interface ITabFormInputs {
    name: string
    description: string
}

const CollegeTabs = ({ collegeId }: IProps) => {
    const [selectedTab, setSelectedTab] = useState<ITab>()
    const [isEditing, setIsEditing] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [deleteModal, setDeleteModal] = useState({ show: false, tabId: '', name: '' })

    const { data, isLoading } = useGetTabsByCollegeIdQuery(collegeId)
    const [updateTabByIdApi, { isLoading: updating }] = useUpdateTabByIdMutation()
    const [addTabToCollegeApi, { isLoading: adding }] = useAddTabToCollegeMutation()
    const [deleteTabByIdApi, { isLoading: deleting }] = useDeleteTabByIdMutation()

    const form = useForm<ITabFormInputs>({
        defaultValues: {
            name: '',
            description: '',
        },
    })

    useEffect(() => {
        if (isAdding) {
            setIsEditing(false)
            setSelectedTab(undefined)
            form.reset({
                name: '',
                description: '',
            })
        } else if (isEditing) {
            setIsAdding(false)
        }
    }, [isAdding, isEditing])

    useEffect(() => {
        if (selectedTab) {
            form.reset({
                name: selectedTab.name,
                description: selectedTab.description,
            })
        }
    }, [selectedTab])

    useEffect(() => {
        if (data?.data && data?.data.length && !selectedTab) {
            setSelectedTab(data?.data[0])
        }
    }, [data?.data])

    const onUpdate = async (data: ITabFormInputs) => {
        if (!selectedTab?._id) return
        try {
            await updateTabByIdApi({ data, id: selectedTab?._id }).unwrap()
            setIsEditing(false)
            toast({
                title: "Tab updated successfully",
                description: "Tab has been updated successfully",
            })
        } catch (error) {
            console.log(error)
            setIsEditing(false)
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            })
        }
    }

    const onCreate = async (data: ITabFormInputs) => {
        if (!collegeId) return
        if (!data.name || !data.description) return toast({
            title: "Error",
            description: "Name and description are required",
            variant: "destructive",
        })
        try {
            await addTabToCollegeApi({ data, id: collegeId }).unwrap()
            setIsAdding(false)
            toast({
                title: "Tab added successfully",
                description: "Tab has been added successfully",
            })
        } catch (error) {
            console.log(error)
            setIsAdding(false)
            toast({

                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            })
        }
    }

    if (isLoading) return <div>Loading...</div>
    if (!data?.data) return <div>No tabs found</div>

    return (
        <div>
            <div className="flex justify-between items-center">
                <Typography variant="h2">Tabs</Typography>
                <Button onClick={() => setIsAdding(prev => !prev)} className={`${isAdding ? 'bg-red-500' : 'bg-green-500'}`}>
                    {
                        isAdding ? (
                            <X size={20} />
                        ) : (
                            <Plus size={20} />
                        )
                    }
                    <span>{isAdding ? 'Cancel' : 'Add Tab'}</span>
                </Button>
            </div>
            <br />
            {
                data?.data?.length ? (
                    <Carousel
                        opts={{
                            align: "start",
                        }}
                        className="w-full"
                    >
                        <CarouselContent>
                            {data.data.map((tab, index) => (
                                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                    <div className="p-1 relative">
                                        <Card className={cn(selectedTab?._id === tab._id ? 'border-primary border-2' : 'border-gray-200', 'cursor-pointer')} onClick={() => setSelectedTab(tab)}>
                                            <CardContent className="flex aspect-auto items-center justify-center p-6">
                                                <span className="text-xl font-semibold">{trimText(tab.name)}</span>
                                            </CardContent>
                                        </Card>

                                        <div className="flex justify-center items-center size-8 absolute bottom-2 right-2  rounded-full bg-destructive hover:bg-destructive/80 transition-all duration-300 cursor-pointer top-1" onClick={() => setDeleteModal({ show: true, tabId: tab._id, name: tab.name })}>
                                            <X size={16} className='text-white' />
                                        </div>


                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-2" type='button' />
                        <CarouselNext className="right-2" type='button' />
                    </Carousel>
                ) : (
                    <div className="flex justify-center items-center h-full">
                        <Typography variant="h3" className='font-semibold'>No tabs found, please add a tab</Typography>
                    </div>
                )
            }

            <br />
            {
                selectedTab && !isAdding && (
                    <div className="flex justify-between items-center">
                        <Typography variant="h3" className='font-semibold'>{selectedTab.name}</Typography>
                        {
                            !isEditing ? (
                                <Button onClick={() => setIsEditing(true)}>
                                    <Edit size={20} />
                                    <span>Edit</span>
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                                        <X size={20} />
                                        <span>Cancel</span>
                                    </Button>
                                    <Button onClick={form.handleSubmit(onUpdate)} loading={{ isLoading: updating }} disabled={!form.formState.isDirty || updating} >
                                        <Check size={20} />
                                        <span>Update</span>
                                    </Button>
                                </div>
                            )
                        }
                    </div>
                )
            }
            {
                isAdding && (
                    <div className="flex justify-between items-center">
                        <Typography variant="h3" className='font-semibold'>Add New Tab</Typography>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsAdding(false)}>
                                <X size={20} />
                                <span>Cancel</span>
                            </Button>
                            <Button onClick={form.handleSubmit(onCreate)} loading={{ isLoading: adding }} disabled={!form.formState.isDirty || adding} >
                                <Plus size={20} />
                                <span>Add</span>
                            </Button>
                        </div>
                    </div>
                )
            }

            <Form {...form}>
                <form className="grid grid-cols-1 gap-6 p-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="w-full md:w-1/2">
                                <FormLabel>
                                    Name
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        disabled={!isEditing && !isAdding}
                                        placeholder="Enter tab name"
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>
                                    Description
                                </FormLabel>
                                <FormControl>
                                    <MDXEditor
                                        editable={isEditing || isAdding}
                                        markdown={field.value || ''}
                                        onChange={(markdown) => {
                                            field.onChange(markdown);
                                        }}
                                        className='max-h-[400px] overflow-y-auto'
                                    />

                                </FormControl>
                            </FormItem>
                        )}
                    />
                </form>
            </Form>

            <Dialog open={deleteModal.show} onOpenChange={() => setDeleteModal({ show: false, tabId: '', name: '' })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure you want to delete tab <span className='underline'>{deleteModal.name}</span> , this action is irreversible?</DialogTitle>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteModal({ show: false, tabId: '', name: '' })}>
                            Cancel
                        </Button>
                        <Button onClick={() => {
                            deleteTabByIdApi({ collegeId, tabId: deleteModal.tabId })
                            setDeleteModal({ show: false, tabId: '', name: '' })
                        }} loading={{ isLoading: deleting }} disabled={deleting} variant="destructive">
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <br />
            {/* Sections */}

            {
                selectedTab && (
                    <div className="p-2">
                        <TabSections tabId={selectedTab._id} collegeId={collegeId} />
                    </div>
                )
            }

        </div >
    )
}

export default CollegeTabs