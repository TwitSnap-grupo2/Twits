export interface TwitSnap {
  id: string;
  message: string;
  createdBy: string;
  createdAt: Date;
}

export type NewTwitSnap = Omit<TwitSnap, "id" | "createdAt">;

export interface ErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

export type editTwitSnapSchema = {
  message: string;
}


export type Metrics = {
  total: number;
  frequency: Array<{
    date: string;
    count: number;
  }>;
  averageTwitsPerUser: number;
  topLikedTwits: Array<{
    count: number;
    id: string;
    message: string | null;
    createdBy: string;
    createdAt: Date;
    isBlocked: boolean;
  }>;
  topSharedTwits: Array<{
    count: number;
    id: string;
    message: string | null;
    createdBy: string;
    createdAt: Date;
    isBlocked: boolean;
  }>;
}

export type HashtagMetrics = {
  total: number;
  frequency: Array<{
    date: string;
    count: number;
  }>;
  topHashtags: Array<{
    count: number;
    name: string;
  }>;
}