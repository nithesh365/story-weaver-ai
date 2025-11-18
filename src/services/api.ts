import type { StoriesResponse, GenerateResponse, JobStatus, ProgressUpdate } from '@/types';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  async fetchStories(): Promise<StoriesResponse> {
    const response = await fetch(`${API_BASE_URL}/stories`);
    if (!response.ok) {
      throw new Error('Failed to fetch stories');
    }
    return response.json();
  },

  async generateStorybook(image: File, storyChoice: string): Promise<GenerateResponse> {
    const formData = new FormData();
    formData.append('person_image', image);
    formData.append('story_choice', storyChoice);

    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to start generation');
    }

    return response.json();
  },

  async getJobStatus(jobId: string): Promise<JobStatus> {
    const response = await fetch(`${API_BASE_URL}/status/${jobId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch job status');
    }
    return response.json();
  },

  createProgressStream(
    jobId: string,
    onUpdate: (update: ProgressUpdate) => void,
    onError: (error: Error) => void,
    onComplete: () => void
  ): EventSource {
    const eventSource = new EventSource(`${API_BASE_URL}/progress/${jobId}`);

    eventSource.onmessage = (event) => {
      try {
        const data: ProgressUpdate = JSON.parse(event.data);
        onUpdate(data);

        if (data.status === 'completed' || data.status === 'failed') {
          eventSource.close();
          onComplete();
        }
      } catch (error) {
        console.error('Failed to parse SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
      onError(new Error('Connection lost. Falling back to polling...'));
    };

    return eventSource;
  },

  getDownloadUrl(filename: string): string {
    return `${API_BASE_URL}/download/${filename}`;
  },

  downloadPDF(resultUrl: string): void {
    const filename = resultUrl.split('/').pop() || 'storybook.pdf';
    const downloadUrl = this.getDownloadUrl(filename);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
