import { z } from "zod";
import type { NumberIndex } from "./data-types.ts";
import { rooms } from "./rooms.ts";

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

function isKey<T extends object>(obj: T, val: PropertyKey): val is keyof T {
  return Object.hasOwn(obj, val);
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
      .refine((val2: string): val2 is keyof typeof rooms => isKey(rooms, val2))
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
// TODO(ParkerH27): Make this a Map.
const profilesListSchema = z.union([
  z.tuple([profilesSchema]).rest(profileSchema),
  z.tuple([]),
]);

const asyncProfilesListSchema = z.promise(profilesListSchema.nullish());

const numberIndexSchema = z.custom<NumberIndex>((val) =>
  z
    .string()
    .refine((val2) => !isNaN(Number(val2)))
    .safeParse(val),
);

export {
  asyncProfilesListSchema,
  isKey,
  numberIndexSchema,
  profilesListSchema,
  roomSchema,
  type ProfilesList,
  type Room,
};
