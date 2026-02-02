import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { useState, useEffect, useCallback, useRef } from "react";
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
  ImageIcon,
  Video,
  Loader2,
} from "lucide-react";
import { uploadImage, isValidImageFile, isValidFileSize, MAX_IMAGE_SIZE } from "@/lib/storage";

/**
 * RICH TEXT EDITOR — TIPTAP WYSIWYG
 *
 * Full-featured editor for Help articles with:
 * - Bold, italic, underline formatting
 * - Headings (H2, H3)
 * - Bullet and numbered lists
 * - Links with dialog
 * - Image upload (drag-drop + file picker)
 * - Video embeds (YouTube & Vimeo)
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
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:text-muted-foreground hover:bg-muted"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="w-px h-4 bg-muted mx-1" />;
}

// ============================================================================
// LINK DIALOG
// ============================================================================

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
      const finalUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
      onSubmit(finalUrl);
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] bg-card border border-border rounded-lg shadow-xl z-50">
        <form onSubmit={handleSubmit}>
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[14px] font-medium text-foreground">Insert Link</p>
          </div>
          <div className="px-4 py-4">
            <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
              URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              autoFocus
              className="w-full h-10 px-3 bg-muted border border-border rounded-md text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
            />
          </div>
          <div className="flex justify-end gap-2 px-4 py-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-[13px] bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors"
            >
              {initialUrl ? "Update" : "Insert"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ============================================================================
// IMAGE DIALOG
// ============================================================================

interface ImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
}

function ImageDialog({ isOpen, onClose, onInsert }: ImageDialogProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setUrlInput("");
      setActiveTab("upload");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileSelect = async (file: File) => {
    setError(null);

    if (!isValidImageFile(file)) {
      setError("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    if (!isValidFileSize(file)) {
      setError(`Image must be smaller than ${MAX_IMAGE_SIZE / 1024 / 1024}MB`);
      return;
    }

    setUploading(true);
    const url = await uploadImage(file);
    setUploading(false);

    if (url) {
      onInsert(url);
      onClose();
    } else {
      setError("Failed to upload image. Please try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onInsert(urlInput.trim());
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-card border border-border rounded-lg shadow-xl z-50">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-[14px] font-medium text-foreground">Insert Image</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex-1 px-4 py-2.5 text-[13px] transition-colors ${
              activeTab === "upload"
                ? "text-foreground border-b-2 border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`flex-1 px-4 py-2.5 text-[13px] transition-colors ${
              activeTab === "url"
                ? "text-foreground border-b-2 border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            From URL
          </button>
        </div>

        <div className="px-4 py-4">
          {activeTab === "upload" ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-ring hover:bg-muted transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                    <span className="text-[13px] text-muted-foreground">Uploading...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-5 w-5 text-muted-foreground" strokeWidth={1.25} />
                    <span className="text-[13px] text-muted-foreground">
                      Click to select or drag an image here
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      JPEG, PNG, GIF, WebP up to 5MB
                    </span>
                  </>
                )}
              </button>
            </>
          ) : (
            <form onSubmit={handleUrlSubmit}>
              <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                autoFocus
                className="w-full h-10 px-3 bg-muted border border-border rounded-md text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
              />
            </form>
          )}

          {error && (
            <p className="mt-3 text-[12px] text-red-400">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground rounded-md transition-colors"
          >
            Cancel
          </button>
          {activeTab === "url" && (
            <button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim()}
              className="px-4 py-1.5 text-[13px] bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Insert
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================================================
// VIDEO DIALOG
// ============================================================================

interface VideoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string, type: "youtube" | "vimeo") => void;
}

function VideoDialog({ isOpen, onClose, onInsert }: VideoDialogProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ type: "youtube" | "vimeo"; id: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl("");
      setError(null);
      setPreview(null);
    }
  }, [isOpen]);

  // Parse video URL and extract ID
  const parseVideoUrl = (input: string): { type: "youtube" | "vimeo"; id: string } | null => {
    // YouTube patterns
    const youtubePatterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of youtubePatterns) {
      const match = input.match(pattern);
      if (match) {
        return { type: "youtube", id: match[1] };
      }
    }

    // Vimeo patterns
    const vimeoPatterns = [
      /vimeo\.com\/(\d+)/,
      /player\.vimeo\.com\/video\/(\d+)/,
    ];

    for (const pattern of vimeoPatterns) {
      const match = input.match(pattern);
      if (match) {
        return { type: "vimeo", id: match[1] };
      }
    }

    return null;
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setError(null);

    if (value.trim()) {
      const parsed = parseVideoUrl(value);
      if (parsed) {
        setPreview(parsed);
      } else {
        setPreview(null);
      }
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError("Please enter a video URL");
      return;
    }

    const parsed = parseVideoUrl(url);
    if (!parsed) {
      setError("Please enter a valid YouTube or Vimeo URL");
      return;
    }

    onInsert(url, parsed.type);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] bg-card border border-border rounded-lg shadow-xl z-50">
        <form onSubmit={handleSubmit}>
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[14px] font-medium text-foreground">Embed Video</p>
          </div>

          <div className="px-4 py-4 space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                Video URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                autoFocus
                className="w-full h-10 px-3 bg-muted border border-border rounded-md text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Supports YouTube and Vimeo links
              </p>
            </div>

            {/* Preview */}
            {preview && (
              <div className="rounded-lg overflow-hidden bg-black aspect-video">
                {preview.type === "youtube" ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${preview.id}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <iframe
                    src={`https://player.vimeo.com/video/${preview.id}`}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            )}

            {error && (
              <p className="text-[12px] text-red-400">{error}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 px-4 py-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!preview}
              className="px-4 py-1.5 text-[13px] bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Embed
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ============================================================================
// EDITOR TOOLBAR
// ============================================================================

interface EditorToolbarProps {
  editor: Editor | null;
  onImageUpload: (file: File) => Promise<void>;
}

function EditorToolbar({ editor, onImageUpload }: EditorToolbarProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
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

      if (!url) {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }

      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    },
    [editor]
  );

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
  }, [editor]);

  const insertImage = useCallback(
    (url: string) => {
      if (!editor) return;
      editor.chain().focus().setImage({ src: url }).run();
    },
    [editor]
  );

  const insertVideo = useCallback(
    (url: string, type: "youtube" | "vimeo") => {
      if (!editor) return;

      if (type === "youtube") {
        editor.chain().focus().setYoutubeVideo({ src: url }).run();
      } else {
        // For Vimeo, extract the ID and insert as iframe HTML
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) {
          const vimeoId = vimeoMatch[1];
          const html = `<div class="vimeo-embed" data-vimeo-id="${vimeoId}"><iframe src="https://player.vimeo.com/video/${vimeoId}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
          editor.chain().focus().insertContent(html).run();
        }
      }
    },
    [editor]
  );

  if (!editor) return null;

  return (
    <>
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted">
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

        {/* Image */}
        <ToolbarButton
          onClick={() => setImageDialogOpen(true)}
          title="Insert Image"
        >
          <ImageIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
        </ToolbarButton>

        {/* Video */}
        <ToolbarButton
          onClick={() => setVideoDialogOpen(true)}
          title="Embed Video"
        >
          <Video className="h-3.5 w-3.5" strokeWidth={1.5} />
        </ToolbarButton>

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

      <ImageDialog
        isOpen={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        onInsert={insertImage}
      />

      <VideoDialog
        isOpen={videoDialogOpen}
        onClose={() => setVideoDialogOpen(false)}
        onInsert={insertVideo}
      />
    </>
  );
}

// ============================================================================
// MAIN EDITOR COMPONENT
// ============================================================================

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  className = "",
}: RichTextEditorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {},
        },
        orderedList: {
          HTMLAttributes: {},
        },
        heading: {
          levels: [2, 3],
          HTMLAttributes: {},
        },
        paragraph: {
          HTMLAttributes: {},
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-400 underline hover:text-blue-300",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4",
        },
        allowBase64: false,
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: "w-full aspect-video rounded-lg my-4",
        },
        width: 640,
        height: 360,
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "before:content-[attr(data-placeholder)] before:text-muted-foreground before:float-left before:h-0 before:pointer-events-none",
      }),
    ],
    content,
    autofocus: false,
    enableCoreExtensions: true,
    editorProps: {
      attributes: {
        class: "max-w-none focus:outline-none min-h-[400px]",
      },
      scrollThreshold: { top: 0, right: 0, bottom: 0, left: 0 },
      scrollMargin: { top: 0, right: 0, bottom: 0, left: 0 },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (isValidImageFile(file)) {
            event.preventDefault();
            handleImageUpload(file, view.state.selection.from);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of items) {
            if (item.type.startsWith("image/")) {
              const file = item.getAsFile();
              if (file) {
                event.preventDefault();
                handleImageUpload(file, view.state.selection.from);
                return true;
              }
            }
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleImageUpload = async (file: File, position?: number) => {
    if (!editor || !isValidImageFile(file)) return;

    if (!isValidFileSize(file)) {
      console.error("File too large");
      return;
    }

    setIsUploading(true);
    const url = await uploadImage(file);
    setIsUploading(false);

    if (url) {
      if (position !== undefined) {
        editor.chain().focus().setImage({ src: url }).run();
      } else {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }
  };

  // Update content when prop changes (for loading existing content)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Handle drag events on the editor container
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && isValidImageFile(file)) {
      await handleImageUpload(file);
    }
  };

  return (
    <div
      className={`bg-card border border-border rounded-lg overflow-hidden relative ${className} ${
        isDragging ? "ring-2 ring-[#60A5FA] ring-opacity-50" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <EditorToolbar editor={editor} onImageUpload={handleImageUpload} />
      <EditorContent editor={editor} />

      {/* Upload overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-card/90 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center">
            <ImageIcon className="h-5 w-5 text-muted-foreground mx-auto mb-2" strokeWidth={1.0} />
            <p className="text-[14px] text-foreground">Drop image to upload</p>
          </div>
        </div>
      )}

      {/* Uploading indicator */}
      {isUploading && (
        <div className="absolute inset-0 bg-card/90 flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 className="h-5 w-5 text-muted-foreground mx-auto mb-2 animate-spin" />
            <p className="text-[14px] text-foreground">Uploading image...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default RichTextEditor;
