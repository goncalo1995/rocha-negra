import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from "rehype-sanitize";

interface MarkdownEditorProps {
    value: string;
    onChange: (value?: string) => void;
    height?: number;
}

export function MarkdownEditor({ value, onChange, height = 300 }: MarkdownEditorProps) {
    return (
        <div data-color-mode="dark">
            <MDEditor
                value={value}
                onChange={onChange}
                previewOptions={{
                    rehypePlugins: [[rehypeSanitize]],
                }}
                height={height}
                preview="edit"
            />
        </div>
    );
}

interface MarkdownPreviewProps {
    source: string;
    className?: string;
}

export function MarkdownPreview({ source, className }: MarkdownPreviewProps) {
    return (
        <div data-color-mode="dark" className={className}>
            <MDEditor.Markdown
                source={source}
                rehypePlugins={[[rehypeSanitize]]}
                style={{ backgroundColor: 'transparent' }}
            />
        </div>
    );
}
