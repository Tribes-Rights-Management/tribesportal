import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { useState, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
} from "lucide-react";

/**
 * RICH TEXT EDITOR — TIPTAP WYSIWYG
 *
 * Full-featured editor for Help articles with:
 * - Bold, italic, underline formatting
 * - Headings (H2, H3)
 * - Bullet and numbered lists
 * - Links with dialog
 * - Undo/redo
 *
 * Matches institutional dark theme styling.
 */

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        isActive
          ? "bg-[#303030] text-white"
          : "text-[#6B6B6B] hover:text-[#AAAAAA] hover:bg-[#252525]"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="w-px h-4 bg-[#303030] mx-1" />;
}

interface LinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
  initialUrl?: string;
}

function LinkDialog({ isOpen, onClose, onSubmit, initialUrl = "" }: LinkDialogProps) {
  const [url, setUrl] = useState(initialUrl);

  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      // Add https:// if no protocol specified
      const finalUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
      onSubmit(finalUrl);
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] bg-[#0A0A0A] border border-[#303030] rounded-md shadow-xl z-50">
        <form onSubmit={handleSubmit}>
          <div className="px-4 py-3 border-b border-[#303030]">
            <p className="text-[13px] font-medium text-white">Insert Link</p>
          </div>
          <div className="px-4 py-4">
            <label className="block text-[10px] uppercase tracking-wider text-[#6B6B6B] mb-2">
              URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              autoFocus
              className="w-full h-9 px-3 bg-[#1A1A1A] border border-[#303030] rounded text-[13px] text-white placeholder:text-[#505050] focus:outline-none focus:border-[#505050]"
            />
          </div>
          <div className="flex justify-end gap-2 px-4 py-3 border-t border-[#303030]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-[12px] text-[#888888] hover:text-[#CCCCCC] rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-[12px] bg-[#303030] text-white rounded hover:bg-[#404040] transition-colors"
            >
              {initialUrl ? "Update" : "Insert"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function EditorToolbar({ editor }: { editor: Editor | null }) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [currentLinkUrl, setCurrentLinkUrl] = useState("");

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href || "";
    setCurrentLinkUrl(previousUrl);
    setLinkDialogOpen(true);
  }, [editor]);

  const setLink = useCallback(
    (url: string) => {
      if (!editor) return;

      // If empty url, remove link
      if (!url) {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }

      // Set link
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    },
    [editor]
  );

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
  }, [editor]);

  if (!editor) return null;

  return (
    <>
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[#303030] bg-[#141414]">
        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold (Cmd+B)"
        >
          <Bold className="h-3.5 w-3.5" strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic (Cmd+I)"
        >
          <Italic className="h-3.5 w-3.5" strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline (Cmd+U)"
        >
          <UnderlineIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Links */}
        <ToolbarButton
          onClick={openLinkDialog}
          isActive={editor.isActive("link")}
          title="Insert Link"
        >
          <LinkIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
        </ToolbarButton>
        {editor.isActive("link") && (
          <ToolbarButton onClick={removeLink} title="Remove Link">
            <Unlink className="h-3.5 w-3.5" strokeWidth={1.5} />
          </ToolbarButton>
        )}

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="h-3.5 w-3.5" strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="h-3.5 w-3.5" strokeWidth={1.5} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Cmd+Z)"
        >
          <Undo className="h-3.5 w-3.5" strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Cmd+Shift+Z)"
        >
          <Redo className="h-3.5 w-3.5" strokeWidth={1.5} />
        </ToolbarButton>
      </div>

      <LinkDialog
        isOpen={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        onSubmit={setLink}
        initialUrl={currentLinkUrl}
      />
    </>
  );
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  className = "",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-6 space-y-1",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-6 space-y-1",
          },
        },
        heading: {
          levels: [2, 3],
          HTMLAttributes: {
            class: "font-semibold",
          },
        },
        paragraph: {
          HTMLAttributes: {
            class: "leading-relaxed",
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#60A5FA] underline hover:text-[#93C5FD]",
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "before:content-[attr(data-placeholder)] before:text-[#505050] before:float-left before:h-0 before:pointer-events-none",
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-sm max-w-none focus:outline-none min-h-[400px] p-4 text-[13px] text-[#CCCCCC]",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update content when prop changes (for loading existing content)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className={`border border-[#404040] rounded-md overflow-hidden ${className}`}>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

export default RichTextEditor;
