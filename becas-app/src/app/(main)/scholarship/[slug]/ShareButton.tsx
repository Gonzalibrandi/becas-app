"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

type ShareButtonProps = {
  title: string;
};

export default function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = window.location.href;

    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled or not supported, fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Last resort fallback
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
        copied
          ? "border-emerald-200 bg-emerald-50 text-emerald-600"
          : "border-gray-200 text-gray-500 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50"
      }`}
    >
      {copied ? <Check size={18} /> : <Share2 size={18} />}
      <span className="text-sm font-medium">
        {copied ? "¡Copiado!" : "Compartir"}
      </span>
    </button>
  );
}
