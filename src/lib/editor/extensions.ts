import CharacterCount from "@tiptap/extension-character-count";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Details, {
  DetailsContent,
  DetailsSummary,
} from "@tiptap/extension-details";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import Youtube from "@tiptap/extension-youtube";
import { Markdown } from "@tiptap/markdown";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";

import type { Extensions } from "@tiptap/core";

const lowlight = createLowlight(common);

export const getRenderExtensions = (): Extensions => [
  StarterKit.configure({
    codeBlock: false,
    link: false,
    underline: false,
  }),
  CodeBlockLowlight.configure({ lowlight }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: { class: "text-[var(--ring)] underline" },
  }),
  Image.configure({ HTMLAttributes: { class: "pixel-border max-w-full" } }),
  Youtube.configure({ width: 640, height: 360 }),
  Table.configure({ resizable: false }),
  TableRow,
  TableHeader,
  TableCell,
  TaskList,
  TaskItem.configure({ nested: true }),
  Underline,
  Highlight.configure({ multicolor: false }),
  Subscript,
  Superscript,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Typography,
  Details,
  DetailsSummary,
  DetailsContent,
  Markdown.configure({
    indentation: { style: "space", size: 2 },
  }),
];

export const getEditorExtensions = (): Extensions => [
  ...getRenderExtensions(),
  Placeholder.configure({
    placeholder: "Start writing your note…",
  }),
  CharacterCount,
];