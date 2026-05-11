import { File, FileText, StickyNote } from "lucide-react";
import type { ReactNode } from "react";

export type FileCategory = "document" | "image" | "spreadsheet" | "presentation" | "archive" | "audio" | "video" | "code" | "other";

const EXTENSION_TO_CATEGORY: Record<string, FileCategory> = {
  pdf: "document",
  doc: "document",
  docx: "document",
  odt: "document",
  rtf: "document",
  txt: "document",
  md: "document",
  
  jpg: "image",
  jpeg: "image",
  png: "image",
  gif: "image",
  webp: "image",
  svg: "image",
  bmp: "image",
  ico: "image",
  
  xls: "spreadsheet",
  xlsx: "spreadsheet",
  ods: "spreadsheet",
  csv: "spreadsheet",
  
  ppt: "presentation",
  pptx: "presentation",
  odp: "presentation",
  
  zip: "archive",
  "7z": "archive",
  rar: "archive",
  tar: "archive",
  gz: "archive",
  
  mp3: "audio",
  wav: "audio",
  ogg: "audio",
  flac: "audio",
  aac: "audio",
  
  mp4: "video",
  webm: "video",
  avi: "video",
  mkv: "video",
  mov: "video",
  
  js: "code",
  ts: "code",
  jsx: "code",
  tsx: "code",
  py: "code",
  java: "code",
  c: "code",
  cpp: "code",
  html: "code",
  css: "code",
  json: "code",
  xml: "code",
  yaml: "code",
  yml: "code",
};

const CATEGORY_COLORS: Record<FileCategory, string> = {
  document: "#3b82f6",
  image: "#10b981",
  spreadsheet: "#22c55e",
  presentation: "#f59e0b",
  archive: "#ef4444",
  audio: "#8b5cf6",
  video: "#ec4899",
  code: "#6366f1",
  other: "#64748b",
};

export function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  if (parts.length > 1) {
    return parts[parts.length - 1].toLowerCase();
  }
  return "";
}

export function getFileCategory(fileName: string): FileCategory {
  const ext = getFileExtension(fileName);
  if (ext && ext in EXTENSION_TO_CATEGORY) {
    return EXTENSION_TO_CATEGORY[ext];
  }
  return "other";
}

export function getFileCategoryColor(category: FileCategory): string {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.other;
}

export function renderFileIcon(
  fileName: string,
  opts?: { size?: number; className?: string }
): ReactNode {
  const size = opts?.size ?? 18;
  const category = getFileCategory(fileName);
  
  switch (category) {
    case "document":
      return <FileText size={size} className={opts?.className} />;
    case "image":
    case "video":
    case "audio":
    case "spreadsheet":
    case "presentation":
    case "archive":
    case "code":
    case "other":
    default:
      return <File size={size} className={opts?.className} />;
  }
}

export function renderNoteIcon(opts?: { size?: number; className?: string }): ReactNode {
  const size = opts?.size ?? 18;
  return <StickyNote size={size} className={opts?.className} />;
}

export function canPreviewInBrowser(fileName: string): boolean {
  const category = getFileCategory(fileName);
  const ext = getFileExtension(fileName);

  if (category === "image") return true;
  if (ext === "pdf") return true;

  if (category === "video") {
    if (ext === "mp4" || ext === "webm") return true;
  }

  if (category === "audio") {
    if (ext === "mp3" || ext === "wav" || ext === "ogg") return true;
  }

  return false;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
