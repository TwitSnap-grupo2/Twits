export interface TwitSnap {
  id: string;
  message: string;
  createdBy: string;
  createdAt: Date;
}

export type NewTwitSnap = Omit<TwitSnap, "id" | "createdAt">;
