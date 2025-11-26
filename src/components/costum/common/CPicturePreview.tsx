// src/components/costum/common/CPicturePreview.tsx
import React from "react";

interface CPicturePreviewProps {
  file: File | null;
  preview: string | null;
  onFileChange: (file: File | null) => void;
}

const CPicturePreview: React.FC<CPicturePreviewProps> = ({
  file,
  preview,
  onFileChange,
}) => {
  return (
    <div className="flex flex-col gap-1">
      {/* Upload Box */}
      <label
        htmlFor="c_picture_input"
        className="
          border border-dashed rounded-md p-6 w-full
          flex flex-col items-center justify-center
          cursor-pointer hover:bg-muted/40 transition
          text-center
        "
      >
        {/* Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-muted-foreground mb-2"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 13v8" />
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="m8 17 4-4 4 4" />
        </svg>

        {/* Text */}
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-primary">Choose file</span> atau drag & drop
        </p>

        {/* File name */}
        {file && (
          <p className="mt-2 text-xs text-muted-foreground">
            File dipilih: <span className="font-semibold">{file.name}</span>
          </p>
        )}

        {/* Preview */}
        {preview && (
          <img
            src={preview}
            className="mt-3 h-32 rounded-md object-cover border"
            alt="Preview"
          />
        )}
      </label>

      {/* Real input */}
      <input
        id="c_picture_input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          onFileChange(f);
        }}
      />
    </div>
  );
};

export default CPicturePreview;
