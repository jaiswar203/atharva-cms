'use client'
import React, { useState } from 'react'
import { useGetCollegesQuery } from '@/redux/api/college'
import Typography from '../ui/typography'
import CollegeList from './CollegeList'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
import CreateCollegeModal from './CreateCollegeModal'

const College = () => {
    const { data } = useGetCollegesQuery()
    const [createModalOpen, setCreateModalOpen] = useState(false)

    return (
        <div>
            <div className="flex flex-row justify-between items-center">
                <Typography variant="h1" className='text-2xl'>Colleges</Typography>
                <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus size={20} />
                    <span>Add College</span>
                </Button>
            </div>
            <br />
            <CollegeList organizations={data?.data || []} />
            
            <CreateCollegeModal 
                open={createModalOpen} 
                onOpenChange={setCreateModalOpen} 
            />
        </div>
    )
}

export default College