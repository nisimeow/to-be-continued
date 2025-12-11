'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface CustomContextEditorProps {
    chatbotId: string;
    initialContext: string;
    onSave: (context: string) => Promise<void>;
}

const MAX_CHARS = 2000;

export default function CustomContextEditor({
    chatbotId,
    initialContext,
    onSave,
}: CustomContextEditorProps) {
    const [context, setContext] = useState(initialContext || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(context);
            toast.success('Context saved successfully');
        } catch (error) {
            toast.error('Failed to save context');
        } finally {
            setIsSaving(false);
        }
    };

    const charCount = context.length;
    const isOverLimit = charCount > MAX_CHARS;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <CardTitle>Custom Context</CardTitle>
                </div>
                <CardDescription>
                    Add custom instructions or context that the chatbot should consider when answering questions.
                    This will be included in every response.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Example: If the user asks about admissions, emphasize our rolling admissions policy and mention the scholarship opportunities..."
                    className="min-h-[200px] resize-y"
                    maxLength={MAX_CHARS}
                />

                <div className="flex items-center justify-between">
                    <span className={`text-sm ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {charCount} / {MAX_CHARS} characters
                    </span>

                    <Button
                        onClick={handleSave}
                        disabled={isSaving || isOverLimit}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Context
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
