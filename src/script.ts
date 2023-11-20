/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-shadow */

import "./styles/bounce.css";
import "./styles/style.css";

import { dom, library } from "@fortawesome/fontawesome-svg-core";
import {
  faXmark,
  faBars,
  faCircleChevronDown,
  faCircleChevronUp,
  faPlus,
  faDownLong,
} from "@fortawesome/free-solid-svg-icons";
import jQuery from "jquery";
import * as PF from "pathfinding";
import { createStorage } from "unstorage";
import localStorageDriver from "unstorage/drivers/localstorage";
import gridLvl0 from "./data/level0.ts";
import gridLvl1 from "./data/level1.ts";
import gridLvl2 from "./data/level2.ts";
import { rooms } from "./data/rooms.ts";
import { stairs, btmStairs } from "./data/stairs.ts";
import {
  type Level,
  type Lvl,
  type ProfilesList,
  type Room,
  roomSchema,
  profilesListSchema,
} from "./data/data-types.ts";

const storage = createStorage({ driver: localStorageDriver({}) });

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
let tempdist: number[];
let tempdist1: number[];
let tempdist2: number[];
let min: number;
let indexmin: number;
let sx1: number;
let sy1: number;

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
function toggleNav(isOpen: boolean) {
  const sidenav = document.getElementById("my-sidenav")!;
  const open = "open-nav";
  const close = "close-nav";
  const remove = isOpen ? close : open;
  const add = isOpen ? open : close;

  sidenav.classList.remove(remove);
  document.body.classList.remove(`${remove}-body`);

  sidenav.classList.add(add);
  document.body.classList.add(`${add}-body`);
}
window.toggleNav = toggleNav;

async function clearAll() {
  await storage.clear();
  window.location.reload();
}
window.clearAll = clearAll;

function createProfile(profNum: number) {
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
      <p></p>
      <input
        class="pink containerinpt"
        id="num${prof}"
        type="number"
        placeholder="Num of classes in schedule"
      />
      <button
        class="pink containerinpt"
        onclick="courseLoop(${profNum})"
      >
        Submit
      </button>
      <div class="selectionbox w3-animate-right" id="temp${prof}1">
        <p></p>
      </div>
      <p></p>
    </div>
    <p></p>
    <div class="margin" id="profspacer1"></div>
    <div class="container" id="${tempElementIdNext}"></div>`;
}

function createCourse(num: number, profNum: number) {
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
    <p></p>
    <div>
      <span class="containerinpt" id="passing${num}${prof}">
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

async function applySavedProfiles() {
  const parsedProfiles = profilesListSchema.safeParse(
    (await storage.getItem("profiles")) as unknown,
  );

  if (parsedProfiles.success) {
    profiles = parsedProfiles.data;
    for (let i = 1; i < profiles.length; i++) {
      createProfile(i);
      (document.getElementById(`nameProf${i}`) as HTMLInputElement).value =
        profiles[0]![i]! as string;
      for (let f = 1; f < profiles[i]!.length + 1; f++) {
        createCourse(f, i);
        (
          document.getElementById(`rmnum${f}${i}txt`) as HTMLInputElement
        ).value = profiles[i]![f - 1]![0]!;
        (document.getElementById(`cl${f}${i}txt`) as HTMLInputElement).value =
          profiles[i]![f - 1]![1]!;
        if (f === 1) {
          break;
        } else {
          const lastPass = document.getElementById(`passing${f - 1}${i}`)!;
          lastPass.classList.remove("display-none");
          lastPass.classList.add("display-block");
        }
        const lastPass = document.getElementById(`passing${f}${i}`)!;
        lastPass.classList.remove("display-block");
        lastPass.classList.add("display-none");
      }
    }
  } else {
    profiles = [];
  }
}

async function remProf(profNum: number) {
  profiles.splice(profNum, 1);
  profiles[0]!.splice(profNum, 1);

  window.document.getElementById("profiles")!.innerHTML = `<div
    class=""
    id="tempProf1"
  ></div>`;

  await storage.setItem("profiles", profiles);

  await applySavedProfiles();
}
window.remProf = remProf;

function printGrid(level: Lvl) {
  let currentGrid: number[][];

  switch (level) {
    case 1: {
      currentGrid = gridLvl1;

      break;
    }
    case 2: {
      currentGrid = gridLvl2;

      break;
    }
    case 0: {
      currentGrid = gridLvl0;

      break;
    }
  }

  const img = source;
  ctx.drawImage(img, 0, 0, size, size);
  for (let y = 0; y < currentGrid.length; y++) {
    for (let x = 0; x < currentGrid[y]!.length; x++) {
      switch (currentGrid[x]![y]) {
        case -2: {
          ctx.fillStyle = "#00FFFF";
          ctx.fillRect(
            (size / currentGrid.length) * y,
            (size / currentGrid.length) * x,
            size / currentGrid.length,
            size / currentGrid.length,
          );

          break;
        }
        case -3: {
          ctx.fillStyle = "#FF00FF";
          ctx.fillRect(
            (size / currentGrid.length) * y,
            (size / currentGrid.length) * x,
            size / currentGrid.length,
            size / currentGrid.length,
          );

          break;
        }
        case -4: {
          ctx.fillStyle = "#F00FFF";
          ctx.fillRect(
            (size / currentGrid.length) * y,
            (size / currentGrid.length) * x,
            size / currentGrid.length,
            size / currentGrid.length,
          );

          break;
        }
        case -5: {
          ctx.fillStyle = "#F00F0F";
          ctx.fillRect(
            (size / currentGrid.length) * y,
            (size / currentGrid.length) * x,
            size / currentGrid.length,
            size / currentGrid.length,
          );

          break;
        }
        default: // no-op
      }
    }
  }
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect((size / 8) * 7, size, size / 8, (size / 17) * -1);
  ctx.fillStyle = "#000000";
  ctx.font = `${size / 35}px Arial`;
  ctx.fillText(`Level ${level}`, (size / 8) * 7 + size / 100, (size / 50) * 49);
}

function createCanvas() {
  canvas = document.getElementById("my-canvas") as HTMLCanvasElement;
  ctx = canvas.getContext("2d")!;
  size = document.getElementById("c")!.offsetWidth - 48;
  ctx.canvas.width = size;
  ctx.canvas.height = size;
  printGrid(viewLvl);
}

function courseLoop(profNum: number) {
  prof = profNum;
  coursesAmt =
    parseInt(
      (document.getElementById(`num${profNum}`) as HTMLInputElement).value,
    ) + 1;
  if (!Number.isNaN(coursesAmt)) {
    for (let i = 1; i < coursesAmt; i++) {
      createCourse(i, prof);
    }
    document.getElementById(`passing${coursesAmt - 1}${prof}`)!.innerHTML = "";
  }
}
window.courseLoop = courseLoop;

async function locateCourses(profNum: number) {
  prof = profNum;
  profiles[profNum] = [];
  if (profiles[0] === undefined) {
    profiles[0] = [null, ""];
  }
  for (
    let i = 1;
    i < document.querySelectorAll(`.prof${profNum}`).length + 1;
    i++
  ) {
    profiles[0]![profNum] = (
      document.getElementById(`nameProf${profNum}`) as HTMLInputElement
    ).value;
    profiles[profNum]![i - 1] = [];
    (profiles[profNum]![i - 1] as string[])[0] = (
      document.getElementById(`rmnum${i}${prof}txt`) as HTMLInputElement
    ).value;
    (profiles[profNum]![i - 1] as string[])[1] = (
      document.getElementById(`cl${i}${prof}txt`) as HTMLInputElement
    ).value;
  }
  await storage.setItem("profiles", profiles);
}
window.locateCourses = locateCourses;

async function addProf() {
  profNum = document.querySelectorAll(".prof").length;
  if (profNum === 0) {
    createProfile(profNum + 1);
  } else {
    await locateCourses(profNum);
    createProfile(profNum + 1);
  }
}
window.addProf = addProf;

function lvl(level: Lvl) {
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
) {
  const matrix = new PF.Grid(grid);
  const finder = new PF.AStarFinder();
  const directions = finder.findPath(x1, y1, x2, y2, matrix);
  for (const direction of directions) {
    grid[direction[1]!]![direction[0]!] = -4;
  }
  printGrid(viewLvl);
}

function stairPath(x1: number, y1: number, x2: number, y2: number, fl: number) {
  tempdist = [];
  tempdist1 = [];
  for (let i = 0; i < 8; i++) {
    tempdist1.push(Math.abs(x1 - stairs[i]![0]) + Math.abs(y1 - stairs[i]![1]));
  }
  tempdist2 = [];
  for (let i = 0; i < 8; i++) {
    tempdist2.push(Math.abs(x2 - stairs[i]![0]) + Math.abs(y2 - stairs[i]![1]));
  }
  for (const [i, element] of tempdist1.entries()) {
    tempdist.push(element + tempdist2[i]!);
  }
  min = Math.min(...tempdist);
  indexmin = tempdist.indexOf(min);
  sx1 = stairs[indexmin]![0];
  sy1 = stairs[indexmin]![1];
  if (fl === 2) {
    path(gridLvl2, x1, y1, sx1, sy1);
    path(gridLvl1, sx1, sy1, x2, y2);
  } else {
    path(gridLvl1, x1, y1, sx1, sy1);
    path(gridLvl2, sx1, sy1, x2, y2);
  }
}

function mainToBtm(
  x1: number,
  y1: number,
  sx1: number,
  sy1: number,
  flr1: Lvl,
  flr2: Lvl,
) {
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
) {
  if (flr1 !== 0) {
    tempdist = [];
    tempdist1 = [];
    for (let i = 0; i < 2; i++) {
      tempdist1.push(
        Math.abs(x1 - btmStairs[i]![0]!) + Math.abs(y1 - btmStairs[i]![1]!),
      );
    }
    tempdist2 = [];
    for (let i = 0; i < 2; i++) {
      tempdist2.push(
        Math.abs(x2 - btmStairs[i]![0]!) + Math.abs(y2 - btmStairs[i]![1]!),
      );
    }
    for (const [i, element] of tempdist1.entries()) {
      tempdist.push(element + tempdist2[i]!);
    }
    min = Math.min(...tempdist);
    indexmin = tempdist.indexOf(min);
    sx1 = btmStairs[indexmin]![0]!;
    sy1 = btmStairs[indexmin]![1]!;

    if (flr1 === 2) {
      path(gridLvl2, x1, y1, sx1, sy1);
    } else {
      path(gridLvl1, x1, y1, sx1, sy1);
    }
  } else if (flr2 !== 0) {
    tempdist = [];
    tempdist1 = [];
    for (let i = 0; i < 1; i++) {
      const newLocal = btmStairs[i];
      tempdist1.push(
        Math.abs(x1 - newLocal![0]!) + Math.abs(y1 - btmStairs[i]![1]!),
      );
    }
    tempdist2 = [];
    for (let i = 0; i < 1; i++) {
      tempdist2.push(
        Math.abs(x2 - btmStairs[i]![0]!) + Math.abs(y2 - btmStairs[i]![1]!),
      );
    }
    for (const [i, element] of tempdist1.entries()) {
      tempdist.push(element + tempdist2[i]!);
    }
    min = Math.min(...tempdist);
    indexmin = tempdist.indexOf(min);
    sx1 = btmStairs[indexmin]![0]!;
    sy1 = btmStairs[indexmin]![1]!;
    if (flr2 === 2) {
      path(gridLvl2, x2, y2, sx1, sy1);
    } else {
      path(gridLvl1, x2, y2, sx1, sy1);
    }
  }

  if (flr1 === 0) {
    path(gridLvl0, x1, y1, sx1, sy1 - 8);
  } else if (flr2 === 0) {
    path(gridLvl0, x2, y2, sx1, sy1 - 8);
  }
  if (flr1 === 1 || flr2 === 1) {
    mainToBtm(x1, y1, sx1, sy1, flr1, flr2);
  }
}

function clearGrid() {
  const img = source;
  ctx.drawImage(img, 0, 0, size, size);
  for (let y = 0; y < gridLvl0.length; y++) {
    for (let x = 0; x < gridLvl0[y]!.length; x++) {
      if (gridLvl0[x]![y] === -4) {
        gridLvl0[x]![y] = 0;
      }
    }
  }
  for (let y = 0; y < gridLvl1.length; y++) {
    for (let x = 0; x < gridLvl1[y]!.length; x++) {
      if (gridLvl1[x]![y] === -4) {
        gridLvl1[x]![y] = 0;
      }
    }
  }
  for (let y = 0; y < gridLvl2.length; y++) {
    for (let x = 0; x < gridLvl2[y]!.length; x++) {
      if (gridLvl2[x]![y] === -4) {
        gridLvl2[x]![y] = 0;
      }
    }
  }
}

function passingTime(num: number, profNum: number) {
  const startString = roomSchema.safeParse(profiles[profNum]![num]![0]!);
  const endString = roomSchema.safeParse(profiles[profNum]![num + 1]![0]!);

  clearGrid();

  if (startString.success) {
    start = startString.data;
    document.getElementById(`inv${num + 1}${profNum}`)!.innerHTML = "";
    stinv1 = 0;
  } else {
    document.getElementById(`inv${num + 1}${profNum}`)!.innerHTML =
      "Invalid Room Number";
    stinv1 = 1;
  }
  if (endString.success) {
    end = endString.data;
    document.getElementById(`inv${num + 2}${profNum}`)!.innerHTML = "";
    stinv2 = 0;
  } else {
    document.getElementById(`inv${num + 2}${profNum}`)!.innerHTML =
      "Invalid Room Number";
    stinv2 = 1;
  }

  if (stinv1 === 0 && stinv2 === 0) {
    x1 = rooms[start]![0];
    y1 = rooms[start]![1];
    flr1 = rooms[start]![2];
    x2 = rooms[end]![0];
    y2 = rooms[end]![1];
    flr2 = rooms[end]![2];

    if (flr1 === 1 && flr2 === 1) {
      grid = gridLvl1;
      path(grid, x1, y1, x2, y2);
    } else if (flr1 === 2 && flr2 === 2) {
      grid = gridLvl2;
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
async function toggleDarkMode() {
  const element = document.body;
  element.classList.toggle("darkModebg");
  element.classList.toggle("lightModebg");

  const c = document.getElementById("c");
  c!.classList.toggle("darkMode");
  c!.classList.toggle("lightMode");

  const c2 = document.getElementById("c2");
  c2!.classList.toggle("darkMode");
  c2!.classList.toggle("lightMode");

  for (let i = 0; i < profiles.length; i++) {
    document.getElementById(`profBox${i}`);
    c2!.classList.toggle("textboxdark");
    c2!.classList.toggle("textbox");
  }

  if (c!.classList.contains("darkMode")) {
    document.getElementById("darkModeButton")!.innerHTML = "Light Mode";
    await storage.setItem("shade", "dark");
  } else if (!element.classList.contains("lightMode")) {
    document.getElementById("darkModeButton")!.innerHTML = "Dark Mode";
    await storage.setItem("shade", "light");
  }
}
window.toggleDarkMode = toggleDarkMode;

async function startApp() {
  lvl(1);
  await applySavedProfiles();

  if (((await storage.getItem("shade")) as unknown) === "dark") {
    await toggleDarkMode();
  }
}
window.startApp = startApp;

let px = 1;
let py = 1;
let old: number;

function onKeyDown(event: KeyboardEvent) {
  switch (viewLvl) {
    case 1: {
      grid = gridLvl1;

      break;
    }
    case 2: {
      grid = gridLvl2;

      break;
    }
    case 0: {
      grid = gridLvl0;

      break;
    }
    default: // no-op
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
    default: // no-op
  }
  old = grid[py]![px]!;
  grid[py]![px] = -5;

  printGrid(viewLvl);
}
window.addEventListener("keydown", onKeyDown);

function downloadImg(element: HTMLAnchorElement) {
  const image = canvas.toDataURL("image/jpg");
  element.href = image;
}
window.downloadImg = downloadImg;

/**
 * Make "Smooth Scroll" Buttons?
 */
jQuery(($: JQueryStatic) => {
  // Add smooth scrolling to all links
  $<HTMLAnchorElement>("a").on("click", function (event) {
    // Make sure this.hash has a value before overriding default behavior.
    if (this.hash === "") {
      return;
    }

    // Store hash
    const hash = this.hash;
    // Prevent default anchor click behavior
    event.preventDefault();

    // Use jQuery's animate() method to add smooth page scroll.
    // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area.
    $<HTMLHtmlElement | HTMLBodyElement>("html, body").animate(
      { scrollTop: $(hash).offset()!.top },
      1000,
      () => {
        // Add hash (#) to URL when done scrolling (default click behavior)
        window.location.hash = this.hash;
      },
    );
  });
});
