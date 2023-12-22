import { z } from "zod";
import { rooms } from "./rooms";

type Lvl = z.infer<typeof lvlSchema>;
type StairList = z.infer<typeof stairListSchema>;
type Level = z.infer<typeof levelSchema>;
type ProfilesList = z.infer<typeof profilesListSchema>;
type Rooms = typeof rooms;
type Room = keyof Rooms;

const levelSchema = z.array(z.array(z.number()));

function normalizeRoomString(room: string): string {
  return room
    .normalize()
    .replaceAll("-", "")
    .replaceAll("_", "")
    .replaceAll("#", "")
    .replaceAll("/", "");
}

const roomSchema = z
  .string()
  .toUpperCase()
  .trim()
  .transform(normalizeRoomString)
  .refine(
    (val) => Object.hasOwn(rooms, val) || val === "",
    (val) => ({
      message: `${val} is not a room`,
    }),
  )
  .transform((val) => val as Room | "");

const profilesSchema = z.union([
  z.tuple([z.null()]).rest(z.union([z.string(), z.string().array()])),
  z.tuple([]),
]);

const profileSchema = z.array(z.tuple([roomSchema, z.string()]));

const profilesListSchema = z.union([
  z.tuple([profilesSchema]).rest(profileSchema),
  z.tuple([]),
]);

const lvlSchema = z.union([z.literal(1), z.literal(2), z.literal(0)]);

const coordsSchema = z.tuple([z.number(), z.number()]).readonly();

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
