'use client';

import { useEffect, useRef } from 'react';
import { useVideoStore } from '@/store/videoStore';
import { videoApi } from '@/services/api';
import VideoUploader from '@/components/VideoUploader';
import ProgressBar from '@/components/ProgressBar';
import VideoPreview from '@/components/VideoPreview';
import AlertModal from '@/components/AlertModal';
import DownloadButton from '@/components/DownloadButton';

export default function Home() {
  const {
    originalVideo,
    status,
    taskId,
    setStatus,
    setTaskId,
    setProgress,
    setProcessedVideoUrl,
    setError,
  } = useVideoStore();

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Polling mechanism
  useEffect(() => {
    if (status === 'processing' && taskId) {
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const statusResponse = await videoApi.checkStatus(taskId);

          // Update progress from backend percentage
          setProgress(statusResponse.percentage);

          // Map backend status to frontend status
          if (statusResponse.status === 'FINISHED') {
            setStatus('completed');

            // Download the processed video
            const videoBlob = await videoApi.downloadVideo(taskId);
            const videoUrl = URL.createObjectURL(videoBlob);
            setProcessedVideoUrl(videoUrl);

            // Clear polling
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          } else if (statusResponse.status === 'ERROR') {
            setStatus('failed');
            setError('Failed to process video');

            // Clear polling
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          }
        } catch (error) {
          console.error('Polling error:', error);
          setStatus('failed');
          setError('Failed to check processing status');

          // Clear polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      }, 2000); // Poll every 2 seconds
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [status, taskId, setStatus, setProgress, setProcessedVideoUrl, setError]);

  const handleRemoveWatermark = async () => {
    if (!originalVideo) {
      setError('Please select a video file first');
      return;
    }

    try {
      setStatus('uploading');
      setProgress(0);
      setError(null);

      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(uploadInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // Upload video
      const uploadResponse = await videoApi.uploadVideo(originalVideo.file);

      clearInterval(uploadInterval);
      setProgress(100);

      // Start processing
      setTaskId(uploadResponse.task_id);
      setStatus('processing');
      setProgress(0);
    } catch (error: any) {
      console.error('Upload error:', error);
      setStatus('failed');
      setError(
        error.response?.data?.error || 'Failed to upload video. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Sora 2 Watermark Remover
          </h1>
          <p className="text-lg text-base-content/70">
            Remove watermarks from your Sora AI videos in seconds
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Upload Section */}
          {status === 'idle' && (
            <div className="space-y-6">
              <VideoUploader />
              {originalVideo && (
                <div className="flex justify-center">
                  <button
                    onClick={handleRemoveWatermark}
                    className="btn btn-primary btn-lg"
                  >
                    Remove Watermark!
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Progress Section */}
          {(status === 'uploading' || status === 'processing') && (
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <ProgressBar />
              </div>
            </div>
          )}

          {/* Result Section */}
          {status === 'completed' && (
            <div className="space-y-6">
              <VideoPreview />
              <DownloadButton />
            </div>
          )}

          {/* Alert Modal */}
          <AlertModal />
        </div>
      </div>
    </div>
  );
}
