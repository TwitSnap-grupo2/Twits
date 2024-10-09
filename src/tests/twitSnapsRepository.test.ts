import twitSnapRepository from "../db/repositories/twits";
import { db } from "../db/setup";
import { v4 as uuid4 } from "uuid";
import { twitSnap as twitSnapsTable } from "../db/schemas/twisnapSchema";
import { desc } from "drizzle-orm";

jest.mock("../db/setup", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),

    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
  },
}));
jest.mock("uuid", () => ({ v4: jest.fn() }));

describe("twitSnapService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getTwitSnapsOrderedByDate", () => {
    it("should return twitsnaps ordered by date", async () => {
      const mockTwitSnaps = [
        {
          id: "1",
          message: "First message",
          createdAt: new Date(),
          isPrivate: false,
          createdBy: "user-1",
        },
        {
          id: "2",
          message: "Second message",
          createdAt: new Date(),
          isPrivate: false,
          createdBy: "user-2",
        },
      ];
      (db.select().from(twitSnapsTable).orderBy as jest.Mock).mockResolvedValue(
        mockTwitSnaps
      );

      const result = await twitSnapRepository.getTwitSnaps();

      expect(db.select).toHaveBeenCalled();
      expect(db.select().from).toHaveBeenCalledWith(twitSnapsTable);
      expect(db.select().from(twitSnapsTable).orderBy).toHaveBeenCalledWith(
        desc(twitSnapsTable.createdAt)
      );
      expect(result).toEqual(mockTwitSnaps);
    });
  });

  describe("createTwitSnap", () => {
    it("should create a twitsnap and return the result", async () => {
      const mockTwitSnap = {
        id: "new-id",
        message: "Test message",
        createdAt: new Date(),
        isPrivate: false,
        createdBy: "user-1",
      };
      (uuid4 as jest.Mock).mockReturnValue("new-id");
      (
        db.insert(twitSnapsTable).values({ ...mockTwitSnap, id: "new-id" })
          .returning as jest.Mock
      ).mockResolvedValue([mockTwitSnap]);

      const newTwitSnap = {
        message: "Test message",
        isPrivate: false,
        createdBy: "user-1",
      };
      const result = await twitSnapRepository.createTwitSnap(newTwitSnap);

      expect(db.insert).toHaveBeenCalledWith(twitSnapsTable);
      expect(db.insert(twitSnapsTable).values).toHaveBeenCalledWith({
        ...newTwitSnap,
        id: "new-id",
      });
      expect(
        db.insert(twitSnapsTable).values({ ...mockTwitSnap, id: "new-id" })
          .returning
      ).toHaveBeenCalled();
      expect(result).toEqual(mockTwitSnap);
    });
  });
});
