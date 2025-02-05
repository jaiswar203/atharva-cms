'use client'

import { useEffect, useState } from 'react'
import { useFileUpload } from '@/hooks/useFileUpload'
import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'
import './editor.css'

interface MarkdownRendererProps {
  content: string
  className?: string
}

const MarkdownRenderer = ({ content, className }: MarkdownRendererProps) => {
  const [processedContent, setProcessedContent] = useState('')
  const { getSignedUrl } = useFileUpload()

  useEffect(() => {
    const processContent = async () => {
      try {
        // Then convert markdown to HTML
        const processedContent = await remark()
          .use(html, { sanitize: false }) // Disable sanitization to allow custom HTML
          .use(remarkGfm) // Enable GFM (tables, strikethrough, etc.)
          .process(content)

        setProcessedContent(processedContent.toString())
      } catch (error) {
        console.error('Failed to process markdown:', error)
        setProcessedContent('')
      }
    }

    processContent()
  }, [content, getSignedUrl])

  return (
    <div
      className={`markdown-content ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  )
}

export default MarkdownRenderer 