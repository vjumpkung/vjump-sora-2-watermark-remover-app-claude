'use client';

import { useVideoStore } from '@/store/videoStore';

export default function VideoPreview() {
  const { originalVideo, processedVideoUrl, status } = useVideoStore();

  if (!originalVideo || status !== 'completed') {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      <h2 className="text-2xl font-bold text-center">
        Watermark Removed Successfully!
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Video */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-center uppercase tracking-wide text-base-content/60">
            Original
          </h3>
          <div className="rounded-lg overflow-hidden bg-base-300 aspect-video">
            <video
              src={originalVideo.preview}
              controls
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* Processed Video */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-center uppercase tracking-wide text-primary">
            Watermark Removed
          </h3>
          <div className="rounded-lg overflow-hidden bg-base-300 aspect-video relative">
            {processedVideoUrl ? (
              <video
                src={processedVideoUrl}
                controls
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
