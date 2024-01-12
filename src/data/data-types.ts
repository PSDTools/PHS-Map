import { z } from "zod";
import { rooms } from "./rooms";

/**
 * Represents a level of the school.
 */
type Lvl = 0 | 1 | 2;

/**
 * Represents the stairs.
 */
interface StairList {
  [x: string]: Coords;
}

/**
 * Represents the schema for coordinates.
 */
type Coords = readonly [number, number];

/**
 * Represents the level data.
 */
// TODO(ParkerH27): Use a Map here.
type Level = number[][];

type ProfilesList = z.infer<typeof profilesListSchema>;

type Room = z.infer<typeof roomStrictSchema>;

/**
 * Normalizes a room string by removing special characters.
 *
 * @param room - The room string to be normalized.
 * @returns The normalized room string.
 */
function normalizeRoomString(room: string): string {
  return room
    .normalize()
    .replaceAll("-", "")
    .replaceAll("_", "")
    .replaceAll("#", "")
    .replaceAll("/", "");
}

/**
 * Represents the custom schema for a room.
 *
 * This schema is used to validate if a value is a valid room.
 * A valid room, well, exists in the list of rooms.
 */
const roomStrictSchema = z.custom<keyof typeof rooms>(
  (val) =>
    z
      .string()
      .toUpperCase()
      .trim()
      .transform(normalizeRoomString)
      .refine((val2) => Object.hasOwn(rooms, val2))
      .safeParse(val).success,
  (val) => ({ message: `${val} is not a room` }),
);

/**
 * Represents the custom schema for a room.
 *
 * This schema is used to validate if a value is a valid room.
 * A valid room, well, exists in the list of rooms.
 * In addition, this allows an empty string to pass, so that that validation can be caught better.
 */
const roomSchema = z.union([roomStrictSchema, z.literal("")]).readonly();

/**
 * Represents the schema for profiles data.
 */
const profilesSchema = z.union([
  z.tuple([z.null()]).rest(z.union([z.string(), z.string().array()])),
  z.tuple([]),
]);

/**
 * Represents the schema for an individual profile.
 */
const profileSchema = z.array(z.tuple([z.string(), z.string()]));

/**
 * Represents the schema for a list of profiles.
 */
const profilesListSchema = z.union([
  z.tuple([profilesSchema]).rest(profileSchema),
  z.tuple([]),
]);

export {
  profilesListSchema,
  roomSchema,
  type Level,
  type Lvl,
  type ProfilesList,
  type Room,
  type StairList,
};
