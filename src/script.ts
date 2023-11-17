/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-shadow */

import "./styles/style.css";
import "./styles/bounce.css";
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
import gridLvl0 from "./data/level0.ts";
import gridLvl1 from "./data/level1.ts";
import gridLvl2 from "./data/level2.ts";
import { rooms } from "./data/rooms.ts";
import { stairs, btmStairs } from "./data/stairs.ts";

declare global {
  interface Window {
    startApp: () => void;
    darkMode: () => void;
    clearAll: () => void;
    closeNav: () => void;
    openNav: () => void;
    lvl0: () => void;
    lvl1: () => void;
    lvl2: () => void;
    addProf: () => void;
    w3_close: () => void;
    locateCourses: (profNum: number) => void;
    courseLoop: (profNum: number) => void;
    remProf: (profNum: number) => void;
    passingTime: (num: number, profNum: number) => void;
    downloadImg: (el: HTMLAnchorElement) => void;
  }
}

let grid: number[][];
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let coursesAmt: number;
let viewLvl: number;
type Profile = [...[string?, string?]];
type Profiles = [null?, ...(string | string[])[]];
type ProfilesList = [Profiles?, ...Profile[]];
let profiles: ProfilesList = [];
let source: HTMLImageElement;
let size: number;
let profNum: number;
let prof: string;
let numNext: number;
let start: string;
let end: string;
let stinv1: number;
let stinv2: number;
let x1: number;
let y1: number;
let flr1: number;
let x2: number;
let y2: number;
let flr2: number;
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

function openNav() {
  document.getElementById("my-sidenav")!.style.width = "250px";
  document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}
window.openNav = openNav;

function closeNav() {
  document.getElementById("my-sidenav")!.style.width = "0";
  document.body.style.backgroundColor = "white";
}
window.closeNav = closeNav;

function clearAll() {
  localStorage.removeItem("profiles");
  localStorage.removeItem("shade");
}
window.clearAll = clearAll;

function createProfile(profNum: number) {
  prof = String(profNum);
  const tempElementId = `tempProf${String(prof)}`;
  const tempElementIdNext = `tempProf${String(profNum + 1)}`;
  // Creates html elements in the courses class.
  document.getElementById(tempElementId)!.innerHTML = ` <div
      class="prof txtbox w3-animate-right"
      id="profBox${prof}"
    >
      <div>
        <button
          class="containerinpt red add"
          onclick="remProf(${profNum})"
        >
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
        onclick="courseLoop(${String(profNum)})"
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

function createCourse(num: string, profNum: string) {
  numNext = parseInt(num) + 1;
  const tempElementId = `temp${prof}${num}`;
  const tempElementIdNext = `temp${prof}${numNext}`;
  // Creates html elements in the courses class.
  document.getElementById(tempElementId)!.innerHTML = ` <div
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
      <span
        class="containerinpt display-none"
        id="passing${num}${prof}"
      >
        <button
          class="purple btninpt showpth"
          onclick="passingTime(${String(parseInt(num) - 1)}, ${String(
            profNum,
          )})"
        >
          Show Path
          <span class="big-text"><i class="fa-solid fa-down-long"></i></span>
        </button>
      </span>
    </div>
    <div class=" selectionbox" id="${tempElementIdNext}"></div>`;
}

function applySavedProfiles() {
  const jsonProfiles = JSON.parse(localStorage.getItem("profiles")!) as unknown;

  if (Array.isArray(jsonProfiles)) {
    profiles = jsonProfiles;

    for (let i = 1; i < profiles.length; i++) {
      createProfile(i);
      (document.getElementById(`nameProf${i}`) as HTMLInputElement).value =
        profiles[0]![i]! as string;
      for (let f = 1; f < profiles[i]!.length + 1; f++) {
        createCourse(String(f), String(i));
        (
          document.getElementById(
            `rmnum${f}${String(i)}txt`,
          ) as HTMLInputElement
        ).value = profiles[i]![f - 1]![0]!;
        (
          document.getElementById(`cl${f}${String(i)}txt`) as HTMLInputElement
        ).value = profiles[i]![f - 1]![1]!;
        if (f === 1) {
          break;
        } else {
          document.getElementById(
            `passing${String(f - 1)}${i}`,
          )!.style.display = "block";
        }
        document.getElementById(`passing${String(f)}${i}`)!.style.display =
          "none";
      }
    }
  } else {
    profiles = [];
  }
}

function remProf(profNum: number) {
  profiles.splice(profNum, 1);
  profiles[0]!.splice(profNum, 1);

  document.getElementById("profiles")!.innerHTML = `<div
    class=""
    id="tempProf1"
  ></div>`;

  localStorage.setItem("profiles", JSON.stringify(profiles));

  applySavedProfiles();
}
window.remProf = remProf;

function printGrid0() {
  const img = source;
  ctx.drawImage(img, 0, 0, size, size);
  for (let y = 0; y < gridLvl0.length; y++) {
    for (let x = 0; x < gridLvl0[y]!.length; x++) {
      switch (gridLvl0[x]![y]) {
        case -2: {
          ctx.fillStyle = "#00FFFF";
          ctx.fillRect(
            (size / gridLvl0.length) * y,
            (size / gridLvl0.length) * x,
            size / gridLvl0.length,
            size / gridLvl0.length,
          );

          break;
        }
        case -3: {
          ctx.fillStyle = "#FF00FF";
          ctx.fillRect(
            (size / gridLvl0.length) * y,
            (size / gridLvl0.length) * x,
            size / gridLvl0.length,
            size / gridLvl0.length,
          );

          break;
        }
        case -4: {
          ctx.fillStyle = "#F00FFF";
          ctx.fillRect(
            (size / gridLvl0.length) * y,
            (size / gridLvl0.length) * x,
            size / gridLvl0.length,
            size / gridLvl0.length,
          );

          break;
        }
        case -5: {
          ctx.fillStyle = "#F00F0F";
          ctx.fillRect(
            (size / gridLvl0.length) * y,
            (size / gridLvl0.length) * x,
            size / gridLvl0.length,
            size / gridLvl0.length,
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
  ctx.fillText("Level 0", (size / 8) * 7 + size / 100, (size / 50) * 49);
}

function printGrid1() {
  const img = source;
  ctx.drawImage(img, 0, 0, size, size);
  for (let y = 0; y < gridLvl1.length; y++) {
    for (let x = 0; x < gridLvl1[y]!.length; x++) {
      switch (gridLvl1[x]![y]) {
        case -2: {
          ctx.fillStyle = "#00FFFF";
          ctx.fillRect(
            (size / gridLvl1.length) * y,
            (size / gridLvl1.length) * x,
            size / gridLvl1.length,
            size / gridLvl1.length,
          );

          break;
        }
        case -3: {
          ctx.fillStyle = "#FF00FF";
          ctx.fillRect(
            (size / gridLvl1.length) * y,
            (size / gridLvl1.length) * x,
            size / gridLvl1.length,
            size / gridLvl1.length,
          );

          break;
        }
        case -4: {
          ctx.fillStyle = "#F00FFF";
          ctx.fillRect(
            (size / gridLvl1.length) * y,
            (size / gridLvl1.length) * x,
            size / gridLvl1.length,
            size / gridLvl1.length,
          );

          break;
        }
        case -5: {
          ctx.fillStyle = "#F00F0F";
          ctx.fillRect(
            (size / gridLvl1.length) * y,
            (size / gridLvl1.length) * x,
            size / gridLvl1.length,
            size / gridLvl1.length,
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
  ctx.fillText("Level 1", (size / 8) * 7 + size / 100, (size / 50) * 49);
}

function printGrid2() {
  const img = source;
  ctx.drawImage(img, 0, 0, size, size);
  for (let y = 0; y < gridLvl2.length; y++) {
    for (let x = 0; x < gridLvl2[y]!.length; x++) {
      switch (gridLvl2[x]![y]) {
        case -2: {
          ctx.fillStyle = "#00FFFF";
          ctx.fillRect(
            (size / gridLvl2.length) * y,
            (size / gridLvl2.length) * x,
            size / gridLvl2.length,
            size / gridLvl2.length,
          );

          break;
        }
        case -3: {
          ctx.fillStyle = "#FF00FF";
          ctx.fillRect(
            (size / gridLvl2.length) * y,
            (size / gridLvl2.length) * x,
            size / gridLvl2.length,
            size / gridLvl2.length,
          );

          break;
        }
        case -4: {
          ctx.fillStyle = "#F00FFF";
          ctx.fillRect(
            (size / gridLvl2.length) * y,
            (size / gridLvl2.length) * x,
            size / gridLvl2.length,
            size / gridLvl2.length,
          );

          break;
        }
        case -5: {
          ctx.fillStyle = "#F00F0F";
          ctx.fillRect(
            (size / gridLvl2.length) * y,
            (size / gridLvl2.length) * x,
            size / gridLvl2.length,
            size / gridLvl2.length,
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
  ctx.fillText("Level 2", (size / 8) * 7 + size / 100, (size / 50) * 49);
}

function createCanvas() {
  canvas = document.getElementById("my-canvas") as HTMLCanvasElement;
  ctx = canvas.getContext("2d")!;
  size = document.getElementById("c")!.offsetWidth - 48;
  ctx.canvas.width = size;
  ctx.canvas.height = size;
  switch (viewLvl) {
    case 1: {
      printGrid1();

      break;
    }
    case 2: {
      printGrid2();

      break;
    }
    case 0: {
      printGrid0();

      break;
    }
    default: // no-op
  }
}

function courseLoop(profNum: number) {
  prof = String(profNum);
  coursesAmt =
    parseInt(
      (document.getElementById(`num${profNum}`) as HTMLInputElement).value,
    ) + 1;
  if (!Number.isNaN(coursesAmt)) {
    for (let i = 1; i < coursesAmt; i++) {
      createCourse(String(i), String(profNum));
    }
    document.getElementById(
      `passing${String(coursesAmt - 1)}${String(prof)}`,
    )!.innerHTML = "";
  }
}
window.courseLoop = courseLoop;

function locateCourses(profNum: number) {
  prof = String(profNum);
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
  localStorage.setItem("profiles", JSON.stringify(profiles));
}
window.locateCourses = locateCourses;

function addProf() {
  profNum = document.querySelectorAll(".prof").length;
  if (profNum === 0) {
    createProfile(profNum + 1);
  } else {
    locateCourses(profNum);
    createProfile(profNum + 1);
  }
}
window.addProf = addProf;

function lvl0() {
  viewLvl = 0;
  source = document.getElementById("LVL0") as HTMLImageElement;
  createCanvas();
}
window.lvl0 = lvl0;

function lvl1() {
  viewLvl = 1;
  source = document.getElementById("LVL1") as HTMLImageElement;
  createCanvas();
}
window.lvl1 = lvl1;

function lvl2() {
  viewLvl = 2;
  source = document.getElementById("LVL2") as HTMLImageElement;
  createCanvas();
}
window.lvl2 = lvl2;

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
  switch (viewLvl) {
    case 1: {
      printGrid1();

      break;
    }
    case 2: {
      printGrid2();

      break;
    }
    case 0: {
      printGrid0();

      break;
    }
    default: // no-op
  }
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
  flr1: number,
  flr2: number,
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
  flr1: number,
  flr2: number,
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
    } else if (flr1 === 1) {
      path(gridLvl1, x1, y1, sx1, sy1);
    }
  } else if (flr2 !== 0) {
    tempdist = [];
    tempdist1 = [];
    for (let i = 0; i < 1; i++) {
      tempdist1.push(
        Math.abs(x1 - btmStairs[i]![0]!) + Math.abs(y1 - btmStairs[i]![1]!),
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
    } else if (flr2 === 1) {
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
  clearGrid();
  start = profiles[profNum]![num]![0]!;
  end = profiles[profNum]![num + 1]![0]!;

  start = start.toUpperCase();
  start = start.replace("-", "");
  start = start.replace("_", "");
  start = start.replace("#", "");
  start = start.replace("/", "");

  end = end.toUpperCase();
  end = end.replace("-", "");
  end = end.replace("_", "");
  end = end.replace("#", "");
  end = end.replace("/", "");
  if (rooms[start] === undefined) {
    document.getElementById(
      `inv${String(num + 1)}${String(profNum)}`,
    )!.innerHTML = "Invalid Room Number";
    stinv1 = 1;
  } else {
    document.getElementById(
      `inv${String(num + 1)}${String(profNum)}`,
    )!.innerHTML = "";
    stinv1 = 0;
  }
  if (rooms[end] === undefined) {
    document.getElementById(
      `inv${String(num + 2)}${String(profNum)}`,
    )!.innerHTML = "Invalid Room Number";
    stinv2 = 1;
  } else {
    document.getElementById(
      `inv${String(num + 2)}${String(profNum)}`,
    )!.innerHTML = "";
    stinv2 = 0;
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
        lvl1();
        break;
      }
      case 2: {
        lvl2();
        break;
      }
      default: {
        lvl0();
      }
    }
  }
}
window.passingTime = passingTime;

/**
 * Dark Mode!
 */
function darkMode() {
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
    localStorage.setItem("shade", "dark");
  } else if (!element.classList.contains("lightMode")) {
    document.getElementById("darkModeButton")!.innerHTML = "Dark Mode";
    localStorage.setItem("shade", "light");
  }
}
window.darkMode = darkMode;

function startApp() {
  lvl1();
  applySavedProfiles();

  if (localStorage.getItem("shade") === "dark") {
    darkMode();
  }
}
window.startApp = startApp;

let px = 1;
let py = 1;
let old: number;
function onKeyDown(f: KeyboardEvent) {
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
  switch (f.key) {
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

  switch (viewLvl) {
    case 1: {
      printGrid1();

      break;
    }
    case 2: {
      printGrid2();

      break;
    }
    case 0: {
      printGrid0();

      break;
    }
    default: // no-op
  }
}
window.onkeydown = onKeyDown;

function downloadImg(el: HTMLAnchorElement) {
  const image = canvas.toDataURL("image/jpg");
  el.href = image;
}
window.downloadImg = downloadImg;

function w3_close() {
  document.getElementById("mySidebar")!.style.display = "none";
}
window.w3_close = w3_close;

/**
 * Make "Smooth Scroll" Buttons?
 */
jQuery(($) => {
  // Add smooth scrolling to all links
  $("a").on("click", function (event) {
    // Store hash
    const hash = (this as HTMLAnchorElement).hash;

    // Make sure this.hash has a value before overriding default behavior.
    if (hash !== "") {
      // Prevent default anchor click behavior
      event.preventDefault();

      // Use jQuery's animate() method to add smooth page scroll.
      // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area.
      $("html, body").animate(
        { scrollTop: $(hash).offset()!.top },
        1000,
        () => {
          // Add hash (#) to URL when done scrolling (default click behavior)
          window.location.hash = hash;
        },
      );
    }
  });
});
