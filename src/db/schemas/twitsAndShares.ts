
type TwitsAndShares = {
    id: string;
    message: string | null;
    createdAt: Date;
    createdBy: string;
    sharedBy: string | null;
    isPrivate: boolean;
    likesCount: number;
    sharesCount: number;
    repliesCount: number;
    parentId: string | null;
  }

export { TwitsAndShares };