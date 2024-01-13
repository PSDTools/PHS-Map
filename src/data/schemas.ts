import { z } from "zod";
import { colorMap } from "./colors.ts";
import { rooms } from "./rooms.ts";
import { btmStairs, stairs } from "./stairs.ts";

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
  z.tuple([z.undefined()]).rest(z.union([z.string(), z.string().array()])),
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

const asyncProfilesListSchema = z.promise(profilesListSchema.nullish());

function createKeySchema<T extends object>(obj: T) {
  return z
    .custom<keyof T>()
    .refine((val): val is keyof T => Object.hasOwn(obj, val));
}

const btmStairsSchema = createKeySchema(btmStairs);
const stairsSchema = createKeySchema(stairs);
const colorSchema = createKeySchema(colorMap);

export {
  btmStairsSchema,
  colorSchema,
  profilesListSchema,
  roomSchema,
  asyncProfilesListSchema,
  stairsSchema,
  type ProfilesList,
  type Room,
};
