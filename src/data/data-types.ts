export type Staircase = Record<number, readonly [number, number]>;
export type ProfilesList = [
  [null?, string?]?,
  ...[(string | [string?, string?])?, string?][],
];
export type Level = number[][];
export type Building = Record<string, readonly [number, number, number]>;
