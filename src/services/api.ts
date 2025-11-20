import { EventSourcePolyfill } from 'event-source-polyfill';
import type { StoriesResponse, GenerateResponse, JobStatus, ProgressUpdate } from '@/types';

const API_BASE_URL = 'https://impleadable-ayleen-uncolored.ngrok-free.dev/api';
const DEFAULT_HEADERS = Object.freeze({
  Accept: 'application/json',
  'ngrok-skip-browser-warning': 'true',
});

const mergeHeaders = (...sources: (HeadersInit | undefined)[]): Headers => {
  const headers = new Headers();
  sources.forEach((source) => {
    if (!source) return;
    const incoming = new Headers(source);
    incoming.forEach((value, key) => {
      headers.set(key, value);
    });
  });
  return headers;
};

const headersToObject = (headers: Headers): Record<string, string> => {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

const withDefaultHeaders = (init?: RequestInit): RequestInit => {
  const headers = mergeHeaders(DEFAULT_HEADERS, init?.headers);

  return {
    ...init,
    headers,
  };
};

export const api = {
  async fetchStories(): Promise<StoriesResponse> {
    const response = await fetch(
      `${API_BASE_URL}/stories`,
      withDefaultHeaders()
    );
    if (!response.ok) {
      throw new Error('Failed to fetch stories');
    }
    return response.json();
  },

  async generateStorybook(image: File, storyChoice: string): Promise<GenerateResponse> {
    const formData = new FormData();
    formData.append('person_image', image);
    formData.append('story_choice', storyChoice);

    const response = await fetch(
      `${API_BASE_URL}/generate`,
      withDefaultHeaders({
        method: 'POST',
        body: formData,
      })
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to start generation');
    }

    return response.json();
  },

  async getJobStatus(jobId: string): Promise<JobStatus> {
    const response = await fetch(
      `${API_BASE_URL}/status/${jobId}`,
      withDefaultHeaders()
    );
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
    const eventSource = new EventSourcePolyfill(
      `${API_BASE_URL}/progress/${jobId}`,
      {
        headers: headersToObject(
          mergeHeaders(DEFAULT_HEADERS, { Accept: 'text/event-stream' })
        ),
      }
    );

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
