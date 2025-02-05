'use client'
import React from 'react'
import { useGetCollegesQuery } from '@/redux/api/college'
import Typography from '../ui/typography'
import CollegeList from './CollegeList'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'

const College = () => {
    const { data, isLoading, isError } = useGetCollegesQuery()

    return (
        <div>
            <div className="flex flex-row justify-between items-center">
                <Typography variant="h1" className='text-2xl'>Colleges</Typography>
                <Button>
                    <Plus size={20} />
                    <span>Add College</span>
                </Button>
            </div>
            <br />
            <CollegeList organizations={data?.data || []} />
        </div>
    )
}

export default College