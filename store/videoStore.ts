import { create } from 'zustand';
import { VideoState } from '@/types';

export const useVideoStore = create<VideoState>((set) => ({
  status: 'idle',
  taskId: null,
  progress: 0,
  originalVideo: null,
  processedVideoUrl: null,
  error: null,
  setStatus: (status) => set({ status }),
  setTaskId: (taskId) => set({ taskId }),
  setProgress: (progress) =>
    set((state) => ({
      progress: typeof progress === 'function' ? progress(state.progress) : progress,
    })),
  setOriginalVideo: (originalVideo) => set({ originalVideo }),
  setProcessedVideoUrl: (processedVideoUrl) => set({ processedVideoUrl }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      status: 'idle',
      taskId: null,
      progress: 0,
      originalVideo: null,
      processedVideoUrl: null,
      error: null,
    }),
}));
