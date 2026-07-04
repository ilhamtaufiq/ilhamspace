<script lang="ts">
  import { Editor } from "@tiptap/core";
  import { onMount } from "svelte";

  import Button from "$lib/components/ui/button.svelte";
  import Textarea from "$lib/components/ui/textarea.svelte";
  import { getEditorExtensions } from "$lib/editor/extensions";
  import { uploadEditorImage } from "$lib/editor/upload-image";

  type Props = {
    initialContent?: string;
  };

  let { initialContent = "{}" }: Props = $props();

  let element = $state<HTMLDivElement | null>(null);
  let editor = $state<Editor | null>(null);
  let markdownMode = $state(false);
  let markdownDraft = $state("");
  let uploading = $state(false);

  const insertImageFile = async (
    instance: Editor,
    file: File,
  ): Promise<void> => {
    uploading = true;
    try {
      const url = await uploadEditorImage(file);
      instance.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to upload image.";
      window.alert(message);
    } finally {
      uploading = false;
    }
  };

  const handleClipboardImages = (
    instance: Editor,
    event: ClipboardEvent,
  ): boolean => {
    const items = event.clipboardData?.items;
    if (!items) {
      return false;
    }

    for (const item of Array.from(items)) {
      const isImage =
        item.type.startsWith("image/") ||
        (item.kind === "file" && item.getAsFile() !== null);

      if (!isImage) {
        continue;
      }

      const file = item.getAsFile();
      if (!file) {
        continue;
      }

      event.preventDefault();
      void insertImageFile(instance, file);
      return true;
    }

    return false;
  };

  const handleDroppedImages = (
    instance: Editor,
    event: DragEvent,
    moved: boolean,
  ): boolean => {
    if (moved || !event.dataTransfer?.files.length) {
      return false;
    }

    const imageFile = Array.from(event.dataTransfer.files).find((file) =>
      file.type.startsWith("image/"),
    );
    if (!imageFile) {
      return false;
    }

    event.preventDefault();
    void insertImageFile(instance, imageFile);
    return true;
  };

  onMount(() => {
    if (!element) {
      return;
    }

    let content: Record<string, unknown> | undefined;
    try {
      content = JSON.parse(initialContent) as Record<string, unknown>;
    } catch {
      content = undefined;
    }

    let instance: Editor;

    instance = new Editor({
      element,
      extensions: getEditorExtensions(),
      content,
      editorProps: {
        attributes: {
          class: "prose-retro min-h-[36vh] outline-none",
        },
        handlePaste: (_view, event): boolean =>
          handleClipboardImages(instance, event),
        handleDrop: (_view, event, _slice, moved): boolean =>
          handleDroppedImages(instance, event, moved),
      },
      onTransaction: ({ editor: current }) => {
        editor = current;
      },
    });

    editor = instance;

    return () => {
      instance.destroy();
    };
  });

  const syncMarkdownToEditor = (): void => {
    if (!editor || !markdownMode) {
      return;
    }

    editor.commands.setContent(markdownDraft, { contentType: "markdown" });
    markdownMode = false;
  };

  export const getJson = (): string => {
    syncMarkdownToEditor();
    return JSON.stringify(editor?.getJSON() ?? { type: "doc", content: [] });
  };

  const run = (fn: (e: Editor) => void): void => {
    if (!editor) {
      return;
    }
    fn(editor);
  };

  const toggleMarkdown = (): void => {
    if (!editor) {
      return;
    }

    if (!markdownMode) {
      markdownDraft = editor.getMarkdown();
      markdownMode = true;
      return;
    }

    editor.commands.setContent(markdownDraft, { contentType: "markdown" });
    markdownMode = false;
  };

  const setLink = (): void => {
    if (!editor) {
      return;
    }
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) {
      return;
    }
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const setImage = (): void => {
    if (!editor) {
      return;
    }
    const url = window.prompt("Image URL");
    if (!url) {
      return;
    }
    editor.chain().focus().setImage({ src: url }).run();
  };

  const setYoutube = (): void => {
    if (!editor) {
      return;
    }
    const url = window.prompt("YouTube URL");
    if (!url) {
      return;
    }
    editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };
</script>

<div class="space-y-2">
  {#if editor}
    <div
      class="pixel-border flex flex-wrap gap-1 bg-card p-2"
      role="toolbar"
      aria-label="Editor toolbar"
    >
      <Button
        type="button"
        size="sm"
        variant={markdownMode ? "default" : "ghost"}
        onclick={toggleMarkdown}
      >
        MD
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("bold") ? "default" : "ghost"}
        onclick={() => run((e) => e.chain().focus().toggleBold().run())}
        disabled={markdownMode}
      >
        B
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("italic") ? "default" : "ghost"}
        onclick={() => run((e) => e.chain().focus().toggleItalic().run())}
        disabled={markdownMode}
      >
        I
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("underline") ? "default" : "ghost"}
        onclick={() => run((e) => e.chain().focus().toggleUnderline().run())}
        disabled={markdownMode}
      >
        U
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("strike") ? "default" : "ghost"}
        onclick={() => run((e) => e.chain().focus().toggleStrike().run())}
        disabled={markdownMode}
      >
        S
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("heading", { level: 1 }) ? "default" : "ghost"}
        onclick={() =>
          run((e) => e.chain().focus().toggleHeading({ level: 1 }).run())}
        disabled={markdownMode}
      >
        H1
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"}
        onclick={() =>
          run((e) => e.chain().focus().toggleHeading({ level: 2 }).run())}
        disabled={markdownMode}
      >
        H2
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("bulletList") ? "default" : "ghost"}
        onclick={() => run((e) => e.chain().focus().toggleBulletList().run())}
        disabled={markdownMode}
      >
        UL
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("orderedList") ? "default" : "ghost"}
        onclick={() => run((e) => e.chain().focus().toggleOrderedList().run())}
        disabled={markdownMode}
      >
        OL
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("taskList") ? "default" : "ghost"}
        onclick={() => run((e) => e.chain().focus().toggleTaskList().run())}
        disabled={markdownMode}
      >
        Task
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("blockquote") ? "default" : "ghost"}
        onclick={() => run((e) => e.chain().focus().toggleBlockquote().run())}
        disabled={markdownMode}
      >
        Quote
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("codeBlock") ? "default" : "ghost"}
        onclick={() => run((e) => e.chain().focus().toggleCodeBlock().run())}
        disabled={markdownMode}
      >
        Code
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onclick={setLink}
        disabled={markdownMode}
      >
        Link
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onclick={setImage}
        disabled={markdownMode}
      >
        Img
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onclick={setYoutube}
        disabled={markdownMode}
      >
        YT
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onclick={() =>
          run((e) =>
            e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
          )}
        disabled={markdownMode}
      >
        Table
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onclick={() => run((e) => e.chain().focus().setDetails().run())}
        disabled={markdownMode}
      >
        Fold
      </Button>
    </div>
    <p class="font-pixel text-muted-foreground text-[8px] uppercase">
      {#if uploading}
        Uploading image…
      {:else if markdownMode}
        Markdown mode · edit source, then press MD to return
      {:else}
        {editor.storage.characterCount?.characters() ?? 0} chars · paste images
        from clipboard
      {/if}
    </p>
  {/if}

  {#if markdownMode}
    <Textarea
      bind:value={markdownDraft}
      class="min-h-[36vh] font-mono text-sm"
      spellcheck={false}
      aria-label="Markdown source"
    />
  {/if}

  <div
    bind:this={element}
    class="pixel-border bg-background p-2"
    class:hidden={markdownMode}
    aria-hidden={markdownMode}
  ></div>
</div>