
type TwitsAndShares = {
    id: string;
    message: string;
    createdAt: Date;
    createdBy: string;
    sharedBy: string | null;
    isPrivate: boolean;
    likes_count: number;
    shares_count: number;
  }

export default TwitsAndShares;