import React, { useEffect, useState } from 'react'
import { ISection, useAddSectionToTabMutation, useDeleteSectionByIdMutation, useGetSectionsByTabIdQuery } from '@/redux/api/college'
import { Button } from '../ui/button'
import { Plus, X } from 'lucide-react'
import Typography from '../ui/typography'
import { Input } from '../ui/input'
import { toast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import SectionEditor from './SectionEditor'

interface ISectionsListProps {
    parentId: string; // This can be collegeId, tabId, highlightId, etc.
    entityType: 'college' | 'tab' | 'highlight'; // Type of parent entity
    collegeId: string; // Always needed for API calls
}

const SectionsList = ({ parentId, entityType, collegeId }: ISectionsListProps) => {
    const [selectedSection, setSelectedSection] = useState<ISection | null>(null)
    const [newSectionName, setNewSectionName] = useState('')
    
    const [modal, setModal] = useState<{
        newSection?: boolean;
        deleteSection?: boolean;
    }>({
        newSection: false,
        deleteSection: false,
    });

    // For now, we're using the tab API as that's what's available
    // This would need to be updated if different APIs are implemented for different entity types
    const { data, refetch } = useGetSectionsByTabIdQuery(parentId)
    const [addSectionToTabApi, { isLoading: isAdding }] = useAddSectionToTabMutation()
    const [deleteSectionByIdApi] = useDeleteSectionByIdMutation()

    useEffect(() => {
        if (!selectedSection) {
            if (data?.data?.length) {
                setSelectedSection(data.data[0])
            }
        }
    }, [data])

    const onAddSection = async () => {
        try {
            await addSectionToTabApi({
                data: { name: newSectionName },
                tabId: parentId,
                collegeId: collegeId,
            }).unwrap()

            toast({
                title: 'Section added successfully',
                description: 'Section added successfully',
            })
            setModal({ newSection: false })
            setNewSectionName('')
            refetch()
        } catch (error: any) {
            if (error.status === 400) {
                toast({
                    title: 'Section already exists',
                    description: 'Section already exists',
                })
            }
            console.log(error)
            toast({
                title: 'Failed to add section',
                description: 'Failed to add section',
            })
        }
    }

    const handleDeleteSection = async (sectionId: string) => {
        try {
            await deleteSectionByIdApi({ 
                collegeId, 
                tabId: parentId, 
                sectionId 
            }).unwrap()
            
            toast({
                title: 'Section deleted successfully',
                description: 'Section deleted successfully',
            })
            
            setModal({ deleteSection: false })
            
            // If the deleted section was selected, clear the selection
            if (selectedSection?._id === sectionId) {
                setSelectedSection(null)
            }
            
            refetch()
        } catch (error) {
            console.log(error)
            toast({
                title: 'Failed to delete section',
                description: 'Failed to delete section',
            })
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center">
                <Typography variant="h3" className='font-semibold'>Sections</Typography>
                <Button onClick={() => setModal(prev => ({ ...prev, newSection: true }))}>
                    <Plus size={20} />
                    <span>Add Section</span>
                </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
                {
                    data?.data?.length ? data.data.map((section) => (
                        <div 
                            className={`flex justify-center items-center border-2 gap-8 p-2 max-w-72 w-fit rounded-lg cursor-pointer relative ${selectedSection?._id === section._id ? 'bg-gray-200' : ''}`} 
                            key={section._id} 
                            onClick={() => setSelectedSection(section)}
                        >
                            <Typography variant="p" className='text-sm text-gray-500'>{section.name}</Typography>
                            <Button 
                                variant="destructive" 
                                size="icon" 
                                className='absolute -top-6 -right-3 rounded-full' 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSection(section);
                                    setModal(prev => ({ ...prev, deleteSection: true }));
                                }}
                            >
                                <X size={15} />
                            </Button>
                        </div>
                    )) : (
                        <div className='flex justify-center items-center h-full w-full'>
                            <Typography variant="p" className='text-sm text-gray-500'>No sections found</Typography>
                        </div>
                    )
                }
            </div>

            <div className="mt-6">
                {selectedSection && (
                    <SectionEditor 
                        section={selectedSection}
                        entityId={collegeId}
                        entityType={entityType}
                        onUpdate={(updatedSection) => {
                            setSelectedSection(updatedSection);
                            refetch();
                        }}
                    />
                )}
            </div>

            {/* Add Section Dialog */}
            {modal.newSection && (
                <Dialog open={modal.newSection} onOpenChange={() => setModal({ newSection: false })}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Section</DialogTitle>
                        </DialogHeader>
                        <form className="space-y-6" onSubmit={(e) => {
                            e.preventDefault();
                            onAddSection();
                        }}>
                            <div>
                                <label htmlFor="sectionName" className="block text-sm font-medium">
                                    Section Name
                                </label>
                                <Input
                                    id="sectionName"
                                    placeholder="Enter section name"
                                    value={newSectionName}
                                    onChange={(e) => setNewSectionName(e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <Button type='submit' disabled={isAdding} loading={{ isLoading: isAdding }}>
                                    Add
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Section Dialog */}
            {modal.deleteSection && selectedSection && (
                <Dialog open={modal.deleteSection} onOpenChange={() => setModal({ deleteSection: false })}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Section</DialogTitle>
                        </DialogHeader>
                        <DialogDescription>
                            Are you sure you want to delete section <span className='font-semibold'>{selectedSection.name}</span>?
                        </DialogDescription>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setModal({ deleteSection: false })}>
                                Cancel
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={() => handleDeleteSection(selectedSection._id)}
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

export default SectionsList 