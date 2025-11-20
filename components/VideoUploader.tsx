'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useVideoStore } from '@/store/videoStore';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export default function VideoUploader() {
  const { originalVideo, setOriginalVideo, setError, status } = useVideoStore();

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          setError('File is too large. Maximum size is 500MB.');
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          setError('Invalid file type. Please upload a video file (MP4, MOV, WebM, or AVI).');
        } else {
          setError('Failed to upload file. Please try again.');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const preview = URL.createObjectURL(file);
        setOriginalVideo({ file, preview });
      }
    },
    [setOriginalVideo, setError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
      'video/webm': ['.webm'],
      'video/x-msvideo': ['.avi'],
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    disabled: status === 'uploading' || status === 'processing',
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-primary bg-primary/10'
          : originalVideo
          ? 'border-success bg-success/10'
          : 'border-base-300 hover:border-primary hover:bg-base-200'
      } ${
        status === 'uploading' || status === 'processing'
          ? 'opacity-50 cursor-not-allowed'
          : ''
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        {originalVideo ? (
          // Show selected file info
          <>
            <svg
              className="w-16 h-16 text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-lg font-semibold text-success mb-1">
                File Selected
              </p>
              <p className="text-base font-medium text-base-content break-all px-4">
                {originalVideo.file.name}
              </p>
              <p className="text-sm text-base-content/60 mt-2">
                {formatFileSize(originalVideo.file.size)}
              </p>
              <p className="text-xs text-base-content/40 mt-3">
                Click to select a different file
              </p>
            </div>
          </>
        ) : (
          // Show upload prompt
          <>
            <svg
              className="w-16 h-16 text-base-content/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <div>
              <p className="text-lg font-semibold">
                {isDragActive
                  ? 'Drop your video here'
                  : 'Drag & drop your video here'}
              </p>
              <p className="text-sm text-base-content/60 mt-2">
                or click to browse files
              </p>
              <p className="text-xs text-base-content/40 mt-2">
                Supported formats: MP4, MOV, WebM, AVI (Max: 500MB)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
