// Frontend status for UI state management
export type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';

// Backend status enum from API
export type BackendStatus = 'UPLOADING' | 'PROCESSING' | 'FINISHED' | 'ERROR';

export interface UploadResponse {
  task_id: string;
}

export interface StatusResponse {
  percentage: number;
  status: BackendStatus;
  download_url: string | null;
}

export interface VideoFile {
  file: File;
  preview: string;
}

export interface VideoState {
  status: ProcessingStatus;
  taskId: string | null;
  progress: number;
  originalVideo: VideoFile | null;
  processedVideoUrl: string | null;
  error: string | null;
  setStatus: (status: ProcessingStatus) => void;
  setTaskId: (taskId: string | null) => void;
  setProgress: (progress: number | ((prev: number) => number)) => void;
  setOriginalVideo: (video: VideoFile | null) => void;
  setProcessedVideoUrl: (url: string | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
