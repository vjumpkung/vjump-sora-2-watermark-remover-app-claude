'use client';

import { useState } from 'react';
import { useVideoStore } from '@/store/videoStore';
import { videoApi } from '@/services/api';

export default function DownloadButton() {
  const { status, taskId, processedVideoUrl, reset } = useVideoStore();
  const [isDownloading, setIsDownloading] = useState(false);

  if (status !== 'completed' || !taskId) {
    return null;
  }

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      if (processedVideoUrl) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = processedVideoUrl;
        link.download = `watermark-removed-${taskId}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Fallback: fetch from API
        const blob = await videoApi.downloadVideo(taskId);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `watermark-removed-${taskId}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download video. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="btn btn-primary btn-lg gap-2"
      >
        {isDownloading ? (
          <>
            <span className="loading loading-spinner"></span>
            Downloading...
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Video
          </>
        )}
      </button>
      <button onClick={handleReset} className="btn btn-outline btn-lg">
        Remove Another Video
      </button>
    </div>
  );
}
