import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormControl, FormField, FormItem } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import MDXEditor from "@/components/Editor/MDXEditor"

interface IPageForm {
    content: string
    carousel_images: { id?: string; url: string }[]
    video_url: string
    page: string
}

interface ContentSectionProps {
    isEditing: boolean
    form: UseFormReturn<IPageForm>
    handleImageUpload: (file: File) => Promise<string>
}

export function ContentSection({ isEditing, form, handleImageUpload }: ContentSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-semibold">Content</CardTitle>
            </CardHeader>
            <CardContent>
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MDXEditor
                                    markdown={field.value}
                                    onChange={field.onChange}
                                    editable={isEditing}
                                    onImageUpload={handleImageUpload}
                                    placeholder="Enter content here..."
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    )
} 