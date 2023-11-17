type Lvl = 1 | 2 | 0;
const Levels = { one: 1, two: 2, zero: 0 } as const;
type Room = readonly [...Coords, Lvl];
type StairList = Record<number, Coords>;
type Level = number[][];
type Coords = readonly [number, number];
type Building = Record<string, Room>;
type Profile = [...[string, string]];
type Profiles = [null?, ...(string | string[])[]];
type ProfilesList = [Profiles?, ...Profile[]];

export type { Lvl, Room, StairList, Level, ProfilesList };
export { Levels, type Building };
