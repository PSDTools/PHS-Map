/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-shadow */

import "./styles/bounce.css";
import "./styles/style.css";

import { dom, library } from "@fortawesome/fontawesome-svg-core";
import {
  faBars,
  faCircleChevronDown,
  faCircleChevronUp,
  faDownLong,
  faPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import * as PF from "pathfinding";
import { createStorage, type Storage } from "unstorage";
import indexedDbDriver from "unstorage/drivers/indexedb";
import { registerSW } from "virtual:pwa-register";
import { fromZodError } from "zod-validation-error";
import { colorMap } from "./data/colors.ts";
import type { Coords2D, Level, Lvl, StairList } from "./data/data-types.ts";
import { level0, level1, level2 } from "./data/levels.ts";
import { rooms } from "./data/rooms.ts";
import {
  isKey,
  numberIndexSchema,
  profilesListSchema,
  roomSchema,
  type ProfilesList,
  type Room,
} from "./data/schemas.ts";
import { btmStairs, stairs } from "./data/stairs.ts";

const storage: Storage = createStorage({
  driver: indexedDbDriver({ base: "app:" }),
});

declare global {
  interface Window {
    startApp: () => Promise<void>;
    toggleDarkMode: () => Promise<void>;
    clearAll: () => Promise<void>;
    toggleNav: (open: boolean) => void;
    lvl: (level: Lvl) => void;
    addProf: () => Promise<void>;
    locateCourses: (profNum: number) => Promise<void>;
    courseLoop: (profNum: number) => void;
    remProf: (profNum: number) => Promise<void>;
    passingTime: (num: number, profNum: number) => void;
    downloadImg: (el: HTMLAnchorElement) => void;
  }
}

let grid: Level;
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let coursesAmt: number;
let viewLvl: Lvl;
let profiles: ProfilesList = [];
let source: HTMLImageElement;
let size: number;
let profNum: number;
let prof: number;
let numNext: number;
let start: Room;
let end: Room;
let stinv1: number;
let stinv2: number;
let x1: number;
let y1: number;
let flr1: Lvl;
let x2: number;
let y2: number;
let flr2: Lvl;
let sx1: number;
let sy1: number;
let px = 1;
let py = 1;
let old: number;

library.add(
  faXmark,
  faBars,
  faCircleChevronDown,
  faCircleChevronUp,
  faPlus,
  faDownLong,
);
dom.watch();

/**
 * Despite the name, this function is purely functional and has no state, though it does perform a side effect.
 *
 * @param isOpen - True if the nav should be open, false if it should be closed.
 */
function toggleNav(isOpen: boolean): void {
  const sidenav = document.getElementById("my-sidenav");
  const open = "open-nav";
  const close = "close-nav";

  sidenav?.classList.add(isOpen ? close : open);
  document.body.classList.add(`${isOpen ? close : open}-body`);
  sidenav?.classList.replace(isOpen ? close : open, isOpen ? open : close);
  document.body.classList.replace(
    `${isOpen ? close : open}-body`,
    `${isOpen ? open : close}-body`,
  );
}
window.toggleNav = toggleNav;

async function clearAll(): Promise<void> {
  await storage.clear();
  window.location.reload();
}
window.clearAll = clearAll;

function createProfile(profNum: number): void {
  prof = profNum;
  const tempElementId = `tempProf${prof}`;
  const tempElementIdNext = `tempProf${profNum + 1}`;

  // Creates html elements in the courses class.
  document.getElementById(tempElementId)!.innerHTML = `<div
      class="prof txtbox w3-animate-right"
      id="profBox${prof}"
    >
      <div>
        <button class="containerinpt red add" onclick="remProf(${profNum})">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <input
          onkeyup="locateCourses(${profNum})"
          class="pink containerinpt bordered"
          type="text"
          id="nameProf${prof}"
          placeholder="Schedule Name"
        />
      </div>
      <input
        class="pink containerinpt"
        id="num${prof}"
        type="number"
        placeholder="Num of classes in schedule"
      />
      <button class="pink containerinpt" onclick="courseLoop(${profNum})">
        Submit
      </button>
      <div class="selectionbox w3-animate-right" id="temp${prof}1"></div>
    </div>
    <div class="margin" id="profspacer1"></div>
    <div class="container" id="${tempElementIdNext}"></div>`;
}

function createCourse(num: number, profNum: number): void {
  numNext = num + 1;
  const tempElementId = `temp${prof}${num}`;
  const tempElementIdNext = `temp${prof}${numNext}`;

  // Creates html elements in the courses class.
  document.getElementById(tempElementId)!.innerHTML = `<div
      id="input-con-div"
      class=" input-container lightModeInput"
    >
      <p>Class ${num}</p>
      <input
        onkeyup="locateCourses(${profNum})"
        class="purple containerinpt"
        id="cl${num}${prof}txt"
        type="text"
        placeholder="Name:"
      />
    </div>
    <div id="input-con-div" class="purple input-container lightModeInput">
      <input
        onkeyup="locateCourses(${profNum})"
        class="purple containerinpt prof${profNum}"
        id="rmnum${num}${prof}txt"
        type="text"
        placeholder="Room Number:(ex: H100)"
      />
    </div>
    <p class="inv" id="inv${num}${prof}"></p>
    <div>
      <span class="containerinpt display-block" id="passing${num}${prof}">
        <button
          class="purple btninpt showpth"
          onclick="passingTime(${num - 1}, ${profNum})"
        >
          Show Path
          <span class="big-text"><i class="fa-solid fa-down-long"></i></span>
        </button>
      </span>
    </div>
    <div class=" selectionbox" id="${tempElementIdNext}"></div>`;
}

// TODO(lishaduck): Make errors render next to the erroring input.
const zodErrorElement = document.getElementById("zod-error");

async function applySavedProfiles(): Promise<void> {
  const unparsedProfiles = await storage.getItem("profiles");
  const parsedProfiles = profilesListSchema.safeParse(unparsedProfiles ?? []);

  if (parsedProfiles.success) {
    profiles = parsedProfiles.data;

    // We can't use `for-of` here to reduce the number of DOM queries because `createProfile()` mutates the DOM.
    for (let i = 1; i < profiles.length; i++) {
      createProfile(i);
      (document.getElementById(`nameProf${i}`) as HTMLInputElement).value =
        (profiles[0]?.[i] ?? "") as string;
      for (let f = 1; f < (profiles[i]?.length ?? 0) + 1; f++) {
        createCourse(f, i);
        const roomInput = document.getElementById(`rmnum${f}${i}txt`);
        const nameInput = document.getElementById(`cl${f}${i}txt`);

        if (
          roomInput instanceof HTMLInputElement &&
          nameInput instanceof HTMLInputElement
        ) {
          const parsedRoom = roomSchema.safeParse(profiles[i]?.[f - 1]?.[0]);

          if (parsedRoom.success) {
            roomInput.value = parsedRoom.data;
          } else {
            document.getElementById("zod-error")!.innerHTML = fromZodError(
              parsedRoom.error,
            ).toString();
            stinv1 = 1;
          }
          nameInput.value = profiles[i]?.[f - 1]?.[1] ?? "";
        }
      }

      const lastCourseIndex = profiles[i]?.length;
      const lastCourse = document.getElementById(
        `passing${lastCourseIndex}${i}`,
      );

      lastCourse?.classList.replace("display-block", "display-none");
    }
  } else {
    const error = fromZodError(parsedProfiles.error);

    zodErrorElement!.innerHTML = error.message;
    console.error(error.details);
    profiles = [];
  }
}

async function remProf(profNum: number): Promise<void> {
  profiles.splice(profNum, 1);
  profiles[0]?.splice(profNum, 1);

  window.document.getElementById("profiles")!.innerHTML = `<div
    class=""
    id="tempProf1"
  ></div>`;

  await storage.setItem("profiles", profiles);
  await applySavedProfiles();
}
window.remProf = remProf;

function printGrid(level: Lvl): void {
  let currentGrid: number[][];

  switch (level) {
    case 1: {
      currentGrid = level1;

      break;
    }
    case 2: {
      currentGrid = level2;

      break;
    }
    case 0: {
      currentGrid = level0;

      break;
    }
  }

  const img = source;

  ctx.drawImage(img, 0, 0, size, size);

  const gridSize = currentGrid.length;
  const cellSize = size / gridSize;

  for (const [x, row] of currentGrid.entries()) {
    for (const [y, cell] of row.entries()) {
      const key = cell.toString();

      if (isKey(colorMap, key)) {
        ctx.fillStyle = colorMap[key];
        ctx.fillRect(cellSize * y, cellSize * x, cellSize, cellSize);
      }
    }
  }
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect((size / 8) * 7, size, size / 8, (size / 17) * -1);
  ctx.fillStyle = "#000000";
  ctx.font = `${size / 35}px Arial`;
  ctx.fillText(`Level ${level}`, (size / 8) * 7 + size / 100, (size / 50) * 49);
}

function createCanvas(): void {
  canvas = document.getElementById("my-canvas") as HTMLCanvasElement;
  ctx = canvas.getContext("2d")!;
  size = (document.getElementById("c")?.offsetWidth ?? 0) - 48;
  ctx.canvas.width = size;
  ctx.canvas.height = size;
  printGrid(viewLvl);
}

function courseLoop(profNum: number): void {
  prof = profNum;
  coursesAmt =
    parseInt(
      (document.getElementById(`num${profNum}`) as HTMLInputElement).value,
    ) + 1;
  if (!Number.isNaN(coursesAmt)) {
    const array = Array.from(
      { length: coursesAmt - 1 },
      (_: number, i: number): number => i + 1,
    );

    for (const i of array) {
      createCourse(i, prof);
    }
    document.getElementById(`passing${coursesAmt - 1}${prof}`)!.innerHTML = "";
  }
}
window.courseLoop = courseLoop;

async function locateCourses(profNum: number): Promise<void> {
  prof = profNum;
  profiles[profNum] = [];
  profiles[0] = profiles[0] ?? [undefined, ""];

  profiles[0]![profNum] = (
    document.getElementById(`nameProf${profNum}`) as HTMLInputElement
  ).value;
  for (const [i] of document.querySelectorAll(`.prof${profNum}`).entries()) {
    profiles[profNum]![i] = [];
    (profiles[profNum]![i] as string[])![0] = (
      document.getElementById(`rmnum${i + 1}${prof}txt`) as HTMLInputElement
    ).value;
    (profiles[profNum]![i] as string[])![1] = (
      document.getElementById(`cl${i + 1}${prof}txt`) as HTMLInputElement
    ).value;
  }

  await storage.setItem("profiles", profiles);
}
window.locateCourses = locateCourses;

async function addProf(): Promise<void> {
  profNum = document.querySelectorAll(".prof").length;
  if (profNum !== 0) {
    await locateCourses(profNum);
  }
  createProfile(profNum + 1);
}
window.addProf = addProf;

function lvl(level: Lvl): void {
  viewLvl = level;
  source = document.getElementById(`LVL${level}`) as HTMLImageElement;
  createCanvas();
}
window.lvl = lvl;

function path(
  grid: number[][],
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): void {
  const matrix = new PF.Grid(grid);
  const finder = new PF.AStarFinder();

  for (const direction of finder.findPath(x1, y1, x2, y2, matrix)) {
    grid[direction[1]!]![direction[0]!] = -4;
  }

  printGrid(viewLvl);
}

function pathCalculationInternals(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  stairs: StairList,
): Coords2D | undefined {
  let minData = { min: Infinity, minIndex: -1 };

  for (const [index, [first, second]] of Object.values(stairs).entries()) {
    const distance =
      Math.abs(x1 - first) +
      Math.abs(y1 - second) +
      Math.abs(x2 - first) +
      Math.abs(y2 - second);

    if (distance < minData.min) {
      minData = { min: distance, minIndex: index };
    }
  }

  return stairs[numberIndexSchema.parse(minData.minIndex.toString())];
}

function stairPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  floor: number,
): void {
  [sx1, sy1] = pathCalculationInternals(x1, y1, x2, y2, stairs) ?? [sx1, sy1];

  path(floor === 2 ? level2 : level1, x1, y1, sx1, sy1);
  path(floor === 2 ? level1 : level2, sx1, sy1, x2, y2);
}

function calculatePath(
  floor: number,
  x: number,
  y: number,
  sliceEnd: number,
): void {
  [sx1, sy1] = pathCalculationInternals(
    x,
    y,
    x2,
    y2,
    Object.values(btmStairs).slice(0, sliceEnd),
  ) ?? [sx1, sy1];

  path(floor === 2 ? level2 : level1, x, y, sx1, sy1);
}

function mainToBtm(
  x1: number,
  y1: number,
  sx1: number,
  sy1: number,
  flr1: Lvl,
  flr2: Lvl,
): void {
  if (flr1 === 1) {
    stairPath(x1, y1, sx1, sy1, flr1);
  }
  if (flr2 === 1) {
    stairPath(x2, y2, sx1, sy1, flr1);
  }
}

function btmPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  flr1: Lvl,
  flr2: Lvl,
): void {
  if (flr1 !== 0) {
    calculatePath(flr1, x1, y1, 2);
  } else if (flr2 !== 0) {
    calculatePath(flr2, x2, y2, 1);
  }

  if (flr1 === 0) {
    path(level0, x1, y1, sx1, sy1 - 8);
  } else if (flr2 === 0) {
    path(level0, x2, y2, sx1, sy1 - 8);
  }
  if (flr1 === 1 || flr2 === 1) {
    mainToBtm(x1, y1, sx1, sy1, flr1, flr2);
  }
}

function clearGrid(): void {
  const img = source;

  ctx.drawImage(img, 0, 0, size, size);
  for (const [x, row] of level0.entries()) {
    for (const [y, cell] of row.entries()) {
      if (cell === -4) {
        level0[x]![y] = 0;
      }
    }
  }
  for (const [x, row] of level1.entries()) {
    for (const [y, cell] of row.entries()) {
      if (cell === -4) {
        level1[x]![y] = 0;
      }
    }
  }
  for (const [x, row] of level2.entries()) {
    for (const [y, cell] of row.entries()) {
      if (cell === -4) {
        level2[x]![y] = 0;
      }
    }
  }
}

function passingTime(num: number, profNum: number): void {
  const startString = roomSchema.safeParse(profiles[profNum]?.[num]?.[0]);
  const endString = roomSchema.safeParse(profiles[profNum]?.[num + 1]?.[0]);

  clearGrid();

  if (startString.success && startString.data !== "") {
    start = startString.data;
    zodErrorElement!.innerHTML = "";
    stinv1 = 0;
  } else if (!startString.success) {
    zodErrorElement!.innerHTML = fromZodError(startString.error).toString();
    stinv1 = 1;
  }
  if (endString.success && endString.data !== "") {
    end = endString.data;
    zodErrorElement!.innerHTML = "";
    stinv2 = 0;
  } else if (!endString.success) {
    zodErrorElement!.innerHTML = fromZodError(endString.error).toString();
    stinv2 = 1;
  }

  if (stinv1 === 0 && stinv2 === 0) {
    [x1, y1, flr1] = rooms[start];
    [x2, y2, flr2] = rooms[end];

    if (flr1 === 1 && flr2 === 1) {
      grid = level1;
      path(grid, x1, y1, x2, y2);
    } else if (flr1 === 2 && flr2 === 2) {
      grid = level2;
      path(grid, x1, y1, x2, y2);
    } else if (flr1 !== 0 && flr2 !== 0) {
      stairPath(x1, y1, x2, y2, flr1);
    } else {
      btmPath(x1, y1, x2, y2, flr1, flr2);
    }
    switch (flr1) {
      case 1: {
        lvl(1);
        break;
      }
      case 2: {
        lvl(2);
        break;
      }
      default: {
        lvl(0);
      }
    }
  }
}
window.passingTime = passingTime;

/**
 * Dark Mode!
 */
async function toggleDarkMode(): Promise<void> {
  // Query for every element that has the class "darkMode" or "lightMode" and toggle them.
  for (const element of document.querySelectorAll(".darkMode, .lightMode")) {
    element.classList.toggle("darkMode");
    element.classList.toggle("lightMode");
  }

  for (const element of document.querySelectorAll(
    Array.from(
      { length: profiles.length },
      (_: number, i: number): string => `#profBox${i}`,
    ).join(", "),
  )) {
    element.classList.toggle("textboxdark");
    element.classList.toggle("textbox");
  }

  const isDarkMode = document.body.classList.contains("darkModeBg");

  document.body.classList.toggle("darkModeBg");
  document.body.classList.toggle("lightModeBg");
  const darkModeButton = document.getElementById("darkModeButton")!;

  darkModeButton.innerHTML = isDarkMode ? "Light Mode" : "Dark Mode";
  await storage.setItem("shade", isDarkMode ? "dark" : "light");
}
window.toggleDarkMode = toggleDarkMode;

async function updateSw(): Promise<void> {
  await registerSW({
    onRegisteredSW(swUrl, r) {
      const intervalMS = 60 * 60 * 1000;

      r &&
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        setInterval(async (): Promise<void> => {
          if (r.installing !== null) {
            return;
          }

          if (Object.hasOwn(navigator, "connection") && !navigator.onLine) {
            return;
          }

          const resp = await fetch(swUrl, {
            cache: "no-store",
            headers: {
              cache: "no-store",
              "cache-control": "no-cache",
            },
          });

          if (resp.status === 200) {
            await r.update();
          }
        }, intervalMS);
    },
  })(true);
}

async function startApp(): Promise<void> {
  await updateSw();

  lvl(1);
  await applySavedProfiles();

  if ((await storage.getItem("shade")) === "dark") {
    await toggleDarkMode();
  }
}
window.startApp = startApp;

function onKeyDown(event: KeyboardEvent): void {
  switch (viewLvl) {
    case 1: {
      grid = level1;

      break;
    }
    case 2: {
      grid = level2;

      break;
    }
    case 0: {
      grid = level0;

      break;
    }
    default: {
      break; // no-op
    }
  }
  grid[py]![px] = old;
  switch (event.key) {
    case "ArrowUp": {
      py -= 1;

      break;
    }
    case "ArrowDown": {
      py += 1;

      break;
    }
    case "ArrowLeft": {
      px -= 1;

      break;
    }
    case "ArrowRight": {
      px += 1;

      break;
    }
    default: {
      break; // no-op
    }
  }
  old = grid[py]?.[px] ?? 0;
  grid[py]![px] = -5;

  printGrid(viewLvl);
}
window.addEventListener("keydown", onKeyDown);

function downloadImg(element: HTMLAnchorElement): void {
  const image = canvas.toDataURL("image/jpg");

  element.href = image;
}
window.downloadImg = downloadImg;

/**
 * Make links scroll smoothly.
 */
for (const anchor of document.querySelectorAll("a")) {
  anchor.addEventListener(
    "click",

    ((document, window) =>
      function (event: MouseEvent): void {
        // Make sure this.hash has a value before overriding default behavior
        if (anchor.hash === "") {
          return;
        }

        // Store hash
        const hash = anchor.hash;

        // Prevent default anchor click behavior
        event.preventDefault();

        // Use window.scrollTo with behavior: 'smooth' to add smooth page scroll
        // The scrollIntoView method scrolls the specified element into the visible area of the document
        const target = document.querySelector(hash);

        if (target !== null) {
          target.scrollIntoView({ behavior: "smooth" });
        }

        // Add hash (#) to URL when done scrolling (default click behavior)
        window.location.hash = this.hash;
      })(document, window),
  );
}
