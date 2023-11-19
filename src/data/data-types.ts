import type { rooms } from "./rooms";

type Lvl = 1 | 2 | 0;
const Levels = { one: 1, two: 2, zero: 0 } as const;
type StairList = Record<number, Coords>;
type Level = number[][];
type Coords = readonly [number, number];
type Profile = [...[Room, string]];
type Profiles = [null?, ...(string | string[])[]];
type ProfilesList = [Profiles?, ...Profile[]];
type Rooms = typeof rooms;
type Room = keyof Rooms;

export {
  Levels,
  type Level,
  type Lvl,
  type ProfilesList,
  type Room,
  type StairList,
};
