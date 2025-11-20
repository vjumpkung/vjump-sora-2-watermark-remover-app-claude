import axios from 'axios';
import { UploadResponse, StatusResponse } from '@/types';

const api = axios.create({
  baseURL: '/api/',
  timeout: 30000,
});

export const videoApi = {
  uploadVideo: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('video', file);

    const response = await api.post<UploadResponse>('/submit_remove_task', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  checkStatus: async (taskId: string): Promise<StatusResponse> => {
    const response = await api.get<StatusResponse>('/get_results', {
      params: {
        remove_task_id: taskId,
      },
    });
    return response.data;
  },

  downloadVideo: async (taskId: string): Promise<Blob> => {
    const response = await api.get(`/download/${taskId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
