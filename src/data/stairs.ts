import type { StairList } from "./data-types.ts";

const stairsInternal = {
  "0": [23, 13],
  "1": [63, 16],
  "2": [103, 16],
  "3": [65, 61],
  "4": [96, 61],
  "5": [129, 119],
  "6": [68, 121],
  "7": [92, 121],
} as const satisfies StairList;

type Stairs = typeof stairsInternal & StairList;

const btmStairsInternal = {
  "0": [90, 154],
  "1": [71, 154],
} as const satisfies StairList;

type BtmStairs = typeof btmStairsInternal & StairList;

const stairs: Stairs = stairsInternal;
const btmStairs: BtmStairs = btmStairsInternal;

export { btmStairs, stairs, type BtmStairs, type Stairs };
