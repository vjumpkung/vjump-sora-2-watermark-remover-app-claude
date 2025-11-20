'use client';

import { useVideoStore } from '@/store/videoStore';

export default function ProgressBar() {
  const { status, progress } = useVideoStore();

  if (status !== 'uploading' && status !== 'processing') {
    return null;
  }

  const statusText = status === 'uploading' ? 'Uploading...' : 'Processing...';

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{statusText}</span>
        <span className="text-sm font-semibold">{progress}%</span>
      </div>
      <div className="w-full bg-base-300 rounded-full h-3 overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        >
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
        </div>
      </div>
      <p className="text-xs text-base-content/60 text-center">
        {status === 'uploading'
          ? 'Uploading your video to the server...'
          : 'Removing watermark from your video...'}
      </p>
    </div>
  );
}
