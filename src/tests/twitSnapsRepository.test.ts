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

    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    // insert: jest.fn(() => ({
    //   values: jest.fn().mockReturnThis(),
    //   returning: jest.fn(),
    // })),
  },
}));
jest.mock("uuid", () => ({ v4: jest.fn() }));

describe("twitSnapService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getTwitSnapsOrderedByDate", () => {
    it("should return twitsnaps ordered by date", async () => {
      // Arrange: Mock the result of db.select().from().orderBy()
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
      // Act: Call the function
      const result = await twitSnapRepository.getTwitSnaps();

      // Assert: Check if the db was called correctly and the result is as expected
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
      // Arrange: Mock the UUID generation and the result of db.insert().returning()
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
      }; // InsertTwitsnap type

      // Act: Call the function
      const result = await twitSnapRepository.createTwitSnap(newTwitSnap);

      // Assert: Check if the db was called correctly and the result is as expected
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

    // it("should return null if no result is returned from db", async () => {
    //   // Arrange: Mock the UUID generation and an empty result from db.insert().returning()
    //   (uuid4 as jest.Mock).mockReturnValue("new-id");
    //   (db.insert().returning as jest.Mock).mockResolvedValue([]);

    //   const newTwitSnap = {
    //     message: "Test message",
    //     isPrivate: false,
    //     createdBy: "user-1",
    //   };

    //   // Act: Call the function
    //   const result = await twitSnapService.createTwitSnap(newTwitSnap);

    //   // Assert: Check if the function returns null when no result is found
    //   expect(result).toBeNull();
    // });
  });
});
