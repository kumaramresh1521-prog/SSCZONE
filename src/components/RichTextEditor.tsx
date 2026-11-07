"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// React Quill doesn't support SSR well, so we load it dynamically
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      ["blockquote", "code-block"],
      ["link", "image", "video"],
      ["clean"],
    ],
  }), []);

  return (
    <div className="bg-white text-black rounded-md overflow-hidden">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder || "Write something amazing..."}
        className="h-[400px] mb-[45px]"
      />
      <style jsx global>{`
        .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
          font-family: inherit;
        }
        .ql-container.ql-snow {
          border: none;
          font-family: inherit;
          font-size: 1rem;
          background: #ffffff !important;
          color: #0f172a !important;
        }
        .ql-editor {
          min-height: 350px;
          padding: 1.5rem;
          color: #0f172a !important;
          background-color: #ffffff !important;
        }
        .ql-editor * {
          color: #0f172a !important;
        }
        .ql-editor.ql-blank::before {
          color: #94a3b8 !important;
        }
        .ql-editor p { margin-bottom: 1em; }
        .ql-editor h1, .ql-editor h2, .ql-editor h3 { margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 700; }
        .ql-editor a { color: #2563eb; text-decoration: underline; }
      `}</style>
    </div>
  );
}
