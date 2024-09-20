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
