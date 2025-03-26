'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import HighlightDetail from '@/components/HighLight/HighlightDetail'

const NewHighlight = () => {
  const router = useRouter()

  const handleClose = () => {
    router.push('/highlights')
  }

  return (
    <div className="container mx-auto py-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold mb-6">Add New Highlight</h1>
        <HighlightDetail onClose={handleClose} />
      </div>
    </div>
  )
}

export default NewHighlight 