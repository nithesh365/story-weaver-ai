export interface Story {
  id: string;
  title: string;
  scenes: number;
  description?: string;
  emoji?: string;
  themes?: string[];
}

export interface StoriesResponse {
  success: boolean;
  stories: Record<string, Story>;
}

export interface GenerateResponse {
  success: boolean;
  job_id: string;
  message: string;
  status_url: string;
  stream_url: string;
}

export interface JobStatus {
  job_id: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  current_scene?: number | null;
  total_scenes?: number | null;
  error?: string | null;
  result_url?: string | null;
  started_at?: string;
  updated_at?: string;
}

export interface ProgressUpdate extends JobStatus {}
