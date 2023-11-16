import type { Staircase } from "./data-types.ts";

export const stairs: Staircase = {
  0: [23, 13],
  1: [63, 16],
  2: [103, 16],
  3: [65, 61],
  4: [96, 61],
  5: [129, 119],
  6: [68, 121],
  7: [92, 121],
} as const;

export const btmStairs: Staircase = {
  0: [90, 154],
  1: [71, 154],
};
