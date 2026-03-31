"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface ShareBarProps {
  readonly slug: string;
  readonly title: string;
}

export default function ShareBar({ slug, title }: ShareBarProps) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined"
    ? `${window.location.origin}/${slug}`
    : `/${slug}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 mb-6">
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl py-3 px-4 text-sm font-medium text-gray-700 shadow-sm border border-white/50 hover:bg-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <button
          onClick={handleNativeShare}
          className="flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl py-3 px-4 text-sm font-medium text-gray-700 shadow-sm border border-white/50 hover:bg-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </button>
        <button
          onClick={() => setShowQR(!showQR)}
          className="flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl py-3 px-4 text-sm font-medium text-gray-700 shadow-sm border border-white/50 hover:bg-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="8" height="8" rx="1" />
            <rect x="14" y="2" width="8" height="8" rx="1" />
            <rect x="2" y="14" width="8" height="8" rx="1" />
            <rect x="14" y="14" width="4" height="4" rx="1" />
            <rect x="20" y="14" width="2" height="2" />
            <rect x="14" y="20" width="2" height="2" />
            <rect x="20" y="20" width="2" height="2" />
          </svg>
        </button>
      </div>

      {showQR && (
        <div className="mt-4 flex justify-center">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <QRCodeSVG value={url} size={200} level="M" />
            <p className="text-xs text-gray-400 text-center mt-3">Scan to open on mobile</p>
          </div>
        </div>
      )}
    </div>
  );
}
