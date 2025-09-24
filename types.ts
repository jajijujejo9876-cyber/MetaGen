
export type ContentType = 'image' | 'video';

export interface Metadata {
  fileName: string;
  title: string;
  keywords: string[];
  category: string;
}

export interface FileProcessingState {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'success' | 'failed';
  metadata: Metadata | null;
  error?: string;
}
