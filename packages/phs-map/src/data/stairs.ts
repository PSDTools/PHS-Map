import type { StairList } from "./data-types.ts";

const stairs = [
  [23, 13],
  [63, 16],
  [103, 16],
  [65, 61],
  [96, 61],
  [129, 119],
  [68, 121],
  [92, 121],
] as const satisfies StairList;

const btmStairs = [
  [90, 154],
  [71, 154],
] as const satisfies StairList;

export { btmStairs, stairs };
