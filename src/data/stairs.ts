import type { StairList } from "./data-types";

const stairs: StairList = {
  0: [23, 13],
  1: [63, 16],
  2: [103, 16],
  3: [65, 61],
  4: [96, 61],
  5: [129, 119],
  6: [68, 121],
  7: [92, 121],
} as const;

const btmStairs: StairList = {
  0: [90, 154],
  1: [71, 154],
};

export { btmStairs, stairs };
