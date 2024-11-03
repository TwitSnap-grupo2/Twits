
type TwitsAndShares = {
    id: string;
    message: string;
    createdAt: Date;
    createdBy: string;
    sharedBy: string | null;
    isPrivate: boolean;
    likes_count: number;
    shares_count: number;
    responses_count: number;
  }

type TwitResponse = {
    id: string;
    inResponseToId: string;
    message: string;
    createdAt: Date;
    createdBy: string;
    isPrivate: boolean;
    likes_count: number;
    shares_count: number;
    responses_count: number;

}
export { TwitResponse, TwitsAndShares };