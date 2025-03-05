'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import FestivalDetail from '@/components/Festival/FestivalDetail'

const NewFestival = () => {
  const router = useRouter()

  const handleClose = () => {
    router.push('/festivals')
  }

  return (
    <div className="container mx-auto py-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold mb-6">Add New Festival</h1>
        <FestivalDetail onClose={handleClose} />
      </div>
    </div>
  )
}

export default NewFestival 