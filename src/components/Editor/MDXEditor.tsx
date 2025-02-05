'use client'

import {
    MDXEditor as BaseMDXEditor,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    markdownShortcutPlugin,
    linkPlugin,
    imagePlugin,
    codeBlockPlugin,
    sandpackPlugin,
    frontmatterPlugin,
    toolbarPlugin,
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    CodeToggle,
    CreateLink,
    InsertImage,
    InsertThematicBreak,
    linkDialogPlugin,
    ListsToggle,
    MDXEditorMethods,
    UndoRedo,
    type MDXEditorProps as BaseMDXEditorProps
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import './editor.css'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info } from 'lucide-react'

interface MDXEditorProps extends Omit<BaseMDXEditorProps, 'plugins'> {
    editable?: boolean
    onImageUpload?: (file: File) => Promise<string>
}

export const MDXEditor = forwardRef<MDXEditorMethods, MDXEditorProps>(
    ({ editable = true, onImageUpload, ...props }, ref) => {
        const editorRef = useRef<MDXEditorMethods>(null)

        // Forward the editor methods
        useImperativeHandle(ref, () => ({
            getMarkdown: () => editorRef.current?.getMarkdown() || '',
            setMarkdown: (markdown: string) => editorRef.current?.setMarkdown(markdown),
            insertMarkdown: (markdown: string) => editorRef.current?.insertMarkdown(markdown),
            focus: () => editorRef.current?.focus(),
        }))

        useEffect(() => {
            if (editorRef.current) {
                editorRef.current.setMarkdown(props.markdown || '')
            }
        }, [props.markdown])

        // Handle keyboard shortcuts
        useEffect(() => {
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.ctrlKey && e.key.toLowerCase() === 'b') {
                    e.preventDefault()
                    e.stopPropagation()

                    const editor = editorRef.current
                    if (editor) {
                        const markdown = editor.getMarkdown()
                        const selection = window.getSelection()
                        if (selection && selection.toString()) {
                            const selectedText = selection.toString()
                            const start = markdown.indexOf(selectedText)
                            if (start !== -1) {
                                const before = markdown.substring(0, start)
                                const after = markdown.substring(start + selectedText.length)
                                const newMarkdown = `${before}**${selectedText}**${after}`
                                editor.setMarkdown(newMarkdown)
                            }
                        }
                    }
                }
            }

            document.addEventListener('keydown', handleKeyDown, true)
            return () => document.removeEventListener('keydown', handleKeyDown, true)
        }, [])

        return (
            <>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger className='flex items-center gap-2 text-sm text-gray-500'>
                            <Info size={15} /> Instruction
                        </TooltipTrigger>
                        <TooltipContent className='bg-gray-100 text-gray-800'>
                            <p>
                                1. Press Ctrl + K (or Cmd + K on Mac) to insert a link with a custom title
                                <br />
                                2. Click the Image icon in the toolbar to upload and insert an image
                            </p>
                        </TooltipContent>

                    </Tooltip>
                </TooltipProvider>
                <div className="relative w-full rounded-lg border bg-background">
                    <BaseMDXEditor
                        ref={editorRef}
                        readOnly={!editable}
                        contentEditableClassName="prose prose-sm sm:prose-base dark:prose-invert max-w-full px-3 py-2 min-h-[200px]"
                        {...props}
                        plugins={[
                            headingsPlugin({
                                allowedHeadingLevels: [1, 2, 3, 4, 5]
                            }),
                            listsPlugin(),
                            quotePlugin(),
                            thematicBreakPlugin(),
                            markdownShortcutPlugin(),
                            linkPlugin(),
                            linkDialogPlugin(),
                            imagePlugin({
                                imageUploadHandler: onImageUpload,
                                imageAutocompleteSuggestions: [],
                            }),
                            codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
                            sandpackPlugin(),
                            frontmatterPlugin(),
                            toolbarPlugin({
                                toolbarContents: () => (
                                    <div className="flex flex-wrap items-center gap-1">
                                        <UndoRedo />
                                        <BlockTypeSelect />
                                        <BoldItalicUnderlineToggles />
                                        <CodeToggle />
                                        <ListsToggle />
                                        <CreateLink />
                                        <InsertImage  />
                                        <InsertThematicBreak />
                                    </div>
                                )
                            })
                        ]}
                    />
                </div>
            </>
        )
    }
)