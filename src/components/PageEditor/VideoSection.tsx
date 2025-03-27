import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { VideoIcon, X } from "lucide-react"
import ReactPlayer from "react-player/lazy"
import { UseFormReturn } from "react-hook-form"

interface IPageForm {
    content: string
    carousel_images: { id?: string; url: string }[]
    video_url: string
    page: string
}

interface VideoSectionProps {
    isEditing: boolean
    form: UseFormReturn<IPageForm>
    handleImageUpload: (file: File) => Promise<string>
}

export function VideoSection({ isEditing, form, handleImageUpload }: VideoSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-semibold">Video</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="video_url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Video URL</FormLabel>
                                <div className="flex gap-4">
                                    <FormControl>
                                        <Input {...field} placeholder="Enter video URL" disabled={!isEditing} />
                                    </FormControl>
                                    {isEditing && field.value && (
                                        <Button variant="destructive" onClick={() => form.setValue("video_url", "", { shouldDirty: true })}>
                                            <X className="mr-2 h-4 w-4" />
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            </FormItem>
                        )}
                    />
                    {isEditing && (
                        <div className="flex items-center gap-4">
                            <div className="text-center text-sm text-muted-foreground">or</div>
                            <Input
                                type="file"
                                accept="video/*"
                                id="video-url"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        const url = await handleImageUpload(file)
                                        if (url) {
                                            form.setValue("video_url", url, { shouldDirty: true })
                                        }
                                    }
                                }}
                            />
                            <Label
                                className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                                htmlFor="video-url"
                            >
                                <VideoIcon className="h-4 w-4" />
                                Upload Video
                            </Label>
                        </div>
                    )}
                    {form.watch("video_url") && (
                        <div className="relative aspect-video w-full max-w-3xl mt-4">
                            <ReactPlayer
                                url={form.watch("video_url")}
                                width="100%"
                                height="100%"
                                controls
                                playsinline
                                config={{
                                    file: {
                                        attributes: {
                                            controlsList: "nodownload",
                                            className: "rounded-md",
                                        },
                                    },
                                    youtube: {
                                        playerVars: {
                                            modestbranding: 1,
                                            controls: 1,
                                        },
                                    },
                                }}
                            />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
} 