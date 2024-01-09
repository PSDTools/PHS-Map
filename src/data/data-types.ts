import { z } from "zod";
import { rooms } from "./rooms";

type Lvl = z.infer<typeof lvlSchema>;
type StairList = z.infer<typeof stairListSchema>;
type Level = z.infer<typeof levelSchema>;
type ProfilesList = z.infer<typeof profilesListSchema>;
type Room = z.infer<typeof roomSchema>;

const levelSchema = z.array(z.array(z.number()));

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
 * Helper function for normalizing and validating room strings.
 *
 * @param val - The room string to be normalizing and validating.
 * @returns A normalizing and validating room string.
 */
const roomSchemaHelper = z
  .string()
  .toUpperCase()
  .trim()
  .transform(normalizeRoomString)
  .refine((val) => Object.hasOwn(rooms, val) || val === "");

/**
 * Represents the custom schema for a room.
 *
 * This schema is used to validate if a value is a valid room.
 * A valid room, well, exists in the list of rooms.
 * In addition, this allows an empty string to pass, so that that validation can be caught better.
 */
const roomSchema = z.custom<keyof typeof rooms | "">(
  (val) => roomSchemaHelper.safeParse(val).success,
  (val) => ({ message: `${val} is not a room` }),
);

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

/**
 * Represents the schema for a level of the school.
 */
const lvlSchema = z.union([z.literal(1), z.literal(2), z.literal(0)]);

/**
 * Represents the schema for coordinates.
 */
const coordsSchema = z.tuple([z.number(), z.number()]).readonly();

/**
 * Represents the schema for the stairs.
 */
const stairListSchema = z.record(
  z.string().refine((val) => {
    try {
      Number.parseInt(val);
    } catch {
      return false;
    }
    return true;
  }),
  coordsSchema,
);

export {
  profilesListSchema,
  roomSchema,
  type Level,
  type Lvl,
  type ProfilesList,
  type Room,
  type StairList,
};
