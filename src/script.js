import "./style.css";
import "@fortawesome/fontawesome-free/js/fontawesome.js";
import "@fortawesome/fontawesome-free/js/solid.js";
import jQuery from "jquery";
import gridLvl0 from "./data/level0.json";
import gridLvl1 from "./data/level1.json";
import gridLvl2 from "./data/level2.json";
import rooms from "./data/rooms.json";
import stairs from "./data/stairs.json";
import * as PF from "pathfinding";

// declare global {
//   interface Window {
//     start: () => void;
//     darkMode: () => void;
//     clearAll: () => void;
//     closeNav: () => void;
//     openNav: () => void;
//     lvl0: () => void;
//     lvl1: () => void;
//     lvl2: () => void;
//     addProf: () => void;
//     w3_close: () => void;
//     locateCourses: () => void;
//     courseLoop: () => void;
//   }
// }

let grid;
let canvas;
let ctx;
let coursesAmt;
let viewLvl;
let profiles = [];
let source;
let size;
let profNum;
let prof;
let numNext;
let end;
let stinv1;
let stinv2;
let x1;
let y1;
let flr1;
let x2;
let y2;
let flr2;
let btmStairs;
let tempdist;
let tempdist1;
let tempdist2;
let min;
let indexmin;
let sx1;
let sy1;

function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
  // document.getElementById("main").style.marginLeft = "250px"; // doesn't do anything
  document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}
window.openNav = openNav;

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
  document.body.style.backgroundColor = "white";
}
window.closeNav = closeNav;

function clearAll() {
  localStorage.setItem("profiles", null, -1);
  localStorage.setItem("shade", null, -1);
}
window.clearAll = clearAll;

function createProfile(profNum) {
  prof = String(profNum);
  console.log(`prf${prof}`);
  var tempElementId = `tempProf${String(prof)}`;
  var tempElementIdNext = `tempProf${String(profNum + 1)}`;
  console.log(`tmpprfnxt: ${tempElementIdNext}`);
  // var tempElementIdAlsoNext = "temp".concat("", String(num + 2));
  //creates html elements in the courses class
  console.log("prf" + prof);
  document.getElementById(tempElementId).innerHTML = ` <div
      class="prof txtbox w3-animate-right"
      id="profBox${prof}"
    >
      <div style="">
        <button
          class="containerinpt red"
          id="add"
          onclick="remProf(${profNum})"
        >
          &#10006;
        </button>
        <input
          onkeyup="locateCourses(${profNum})"
          class="pink containerinpt"
          style="border-radius: 4px;border-color:#000000;"
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

function createCourse(num, profNum) {
  prof = String(profNum);
  num = String(num);
  numNext = parseInt(num) + 1;
  console.log(num);
  console.log(prof);
  console.log(`profNum: ${profNum}`);
  var tempElementId = `temp${prof}${num}`;
  var tempElementIdNext = `temp${prof}${numNext}`;
  console.log(`tmpid: ${tempElementId}`);
  console.log(`tmpidnxt: ${tempElementIdNext}`);
  // var tempElementIdAlsoNext = "temp".concat("", String(num + 2));
  //creates html elements in the courses class
  console.log(`inv${num}${prof}`);
  document.getElementById(tempElementId).innerHTML = ` <div
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
        class="containerinpt"
        id="passing${num}${prof}"
        style="display: block"
      >
        <button
          class="purple btninpt showpth"
          onclick="passingTime(${String(parseInt(num) - 1)}, ${String(
    profNum
  )})"
        >
          Show Path
          <span style="font-size:120%;"> ⇩ </span>
        </button>
      </span>
    </div>
    <div class=" selectionbox" id="${tempElementIdNext}"></div>`;
}

function otuPath() {
  clearGrid();

  start = document.getElementById("course1").value;
  end = document.getElementById("course2").value;

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
  console.log(start);
  console.log(end);
  if (rooms[start] == null) {
    document.getElementById("course1").innerHTML = "Invalid Room Number";
    stinv1 = 1;
  } else {
    document.getElementById("course1").innerHTML = "";
    stinv1 = 0;
  }
  if (rooms[end] == null) {
    document.getElementById("course2").innerHTML = "Invalid Room Number";
    stinv2 = 1;
  } else {
    document.getElementById("course2").innerHTML = "";
    stinv2 = 0;
  }
  if (stinv1 == 0 && stinv2 == 0) {
    x1 = rooms[start][0];
    y1 = rooms[start][1];
    flr1 = rooms[start][2];
    x2 = rooms[end][0];
    y2 = rooms[end][1];
    flr2 = rooms[end][2];
    console.log(flr1);
    console.log(flr2);

    if (flr1 == 1 && flr2 == 1) {
      grid = gridLvl1;
      path(grid, x1, y1, x2, y2);
    } else if (flr1 == 2 && flr2 == 2) {
      grid = gridLvl2;
      path(grid, x1, y1, x2, y2);
    } else if (flr1 != 0 && flr2 != 0) {
      stairPath(x1, y1, x2, y2, flr1);
    } else {
      btmPath(x1, y1, x2, y2, flr1, flr2);
    }
    if (flr1 == 1) {
      lvl1();
    } else if (flr1 == 2) {
      lvl2();
    } else {
      lvl0();
    }
  }
}

function addProf() {
  profNum = document.querySelectorAll(".prof").length;
  if (profNum == 0) {
    createProfile(profNum + 1);
  } else {
    locateCourses(profNum);
    createProfile(profNum + 1);
  }
}
window.addProf = addProf;

function remProf(profNum) {
  console.log("___SPLICING___");
  console.log("profNum = " + profNum);

  console.log(JSON.stringify(profiles));

  profiles.splice(profNum, 1);
  profiles[0].splice(profNum, 1);

  document.getElementById("profiles").innerHTML = `<div
    class=""
    id="tempProf1"
  ></div>`;

  localStorage.setItem("profiles", JSON.stringify(profiles));

  applyCookieProfiles();
  console.log("___END___");
}
window.remProf = remProf;

function courseLoop(profNum) {
  prof = String(profNum);
  coursesAmt = parseInt(document.getElementById("num" + profNum).value) + 1;
  console.log(prof);
  if (coursesAmt != NaN) {
    for (let i = 1; i < coursesAmt; i++) {
      createCourse(i, profNum, 0);
    }
    console.log("passing" + String(coursesAmt - 1) + String(prof));
    document.getElementById(
      "passing" + String(coursesAmt - 1) + String(prof)
    ).innerHTML = null;
    // document.getElementById("loccourses" + profNum).style.display = "block"; // doesn't do anything
  }
}
window.courseLoop = courseLoop;

function locateCourses(profNum) {
  console.log("profNum = " + profNum);
  prof = String(profNum);
  profiles[profNum] = [];
  if (profiles[0] == null) {
    profiles[0] = [];
  }
  for (
    let i = 1;
    i < document.querySelectorAll(".prof" + profNum + "").length + 1;
    i++
  ) {
    profiles[0][profNum] = document.getElementById("nameProf" + profNum).value;
    profiles[profNum][i - 1] = [];
    console.log("rmnum" + String(parseInt(i) + 1) + prof + "txt");
    profiles[profNum][i - 1][0] = document.getElementById(
      "rmnum" + i + prof + "txt"
    ).value;
    profiles[profNum][i - 1][1] = document.getElementById(
      "cl" + i + prof + "txt"
    ).value;
  }
  localStorage.setItem("profiles", JSON.stringify(profiles));
  console.log(localStorage.getItem("profiles"));
}
window.locateCourses = locateCourses;

function applyCookieProfiles() {
  profiles = JSON.parse(localStorage.getItem("profiles"));
  if (profiles == undefined) {
    profiles = [];
  } else {
    for (let i = 1; i < profiles.length; i++) {
      createProfile(i);
      document.getElementById("nameProf" + i).value = profiles[0][i];
      for (let f = 1; f < parseInt(profiles[i].length) + 1; f++) {
        createCourse(f, i);
        console.log(profiles[i][f - 1][0]);
        console.log(profiles[i][f - 1][1]);
        document.getElementById("rmnum" + f + String(i) + "txt").value =
          profiles[i][f - 1][0];
        document.getElementById("cl" + f + String(i) + "txt").value =
          profiles[i][f - 1][1];
        if (f == 1) {
        } else {
          document.getElementById("passing" + String(f - 1) + i).style =
            "display:block";
        }
        document.getElementById("passing" + String(f) + i).style =
          "display:none";
      }
    }
  }
}

function passingTime(num, profNum) {
  clearGrid();
  num = parseInt(num);
  // console.log(profNum)
  // console.log(num)
  // console.log(profiles[profNum])
  // console.log(profiles[profNum][num])
  // console.log(profiles[profNum][num][0])
  start = profiles[profNum][num][0];
  end = profiles[profNum][num + 1][0];

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
  console.log("inv" + String(num) + String(profNum));
  console.log(rooms[start]);
  console.log(String(num + 1) + String(profNum));
  console.log(rooms[end]);
  console.log(String(num + 2) + String(profNum));

  if (rooms[start] == null) {
    document.getElementById(
      "inv" + String(num + 1) + String(profNum)
    ).innerHTML = "Invalid Room Number";
    stinv1 = 1;
  } else {
    document.getElementById(
      "inv" + String(num + 1) + String(profNum)
    ).innerHTML = "";
    stinv1 = 0;
  }
  if (rooms[end] == null) {
    console.log(rooms[end]);
    console.log(String(num + 2) + String(profNum));
    document.getElementById(
      "inv" + String(num + 2) + String(profNum)
    ).innerHTML = "Invalid Room Number";
    stinv2 = 1;
  } else {
    document.getElementById(
      "inv" + String(num + 2) + String(profNum)
    ).innerHTML = "";
    stinv2 = 0;
  }

  console.log(stinv1);
  console.log(stinv2);
  if (stinv1 == 0 && stinv2 == 0) {
    x1 = rooms[start][0];
    y1 = rooms[start][1];
    flr1 = rooms[start][2];
    x2 = rooms[end][0];
    y2 = rooms[end][1];
    flr2 = rooms[end][2];
    console.log(flr1);
    console.log(flr2);

    if (flr1 == 1 && flr2 == 1) {
      console.log("pth");
      grid = gridLvl1;
      path(grid, x1, y1, x2, y2);
    } else if (flr1 == 2 && flr2 == 2) {
      grid = gridLvl2;
      path(grid, x1, y1, x2, y2);
      console.log("pth");
    } else if (flr1 != 0 && flr2 != 0) {
      stairPath(x1, y1, x2, y2, flr1);
      console.log("strpth");
    } else {
      btmPath(x1, y1, x2, y2, flr1, flr2);
      console.log("btmpth");
    }
    if (flr1 == 1) {
      lvl1();
    } else if (flr1 == 2) {
      lvl2();
    } else {
      lvl0();
    }
    btmStairs = {
      0: [90, 154],
      1: [71, 154],
    };
  } else {
  }
}
window.passingTime = passingTime;

function btmPath(x1, y1, x2, y2, flr1, flr2) {
  if (flr1 != 0) {
    tempdist = [];
    tempdist1 = [];
    for (let i = 0; i < 2; i++) {
      tempdist1.push(
        Math.abs(x1 - btmStairs[i][0]) + Math.abs(y1 - btmStairs[i][1])
      );
    }
    tempdist2 = [];
    for (let i = 0; i < 2; i++) {
      tempdist2.push(
        Math.abs(x2 - btmStairs[i][0]) + Math.abs(y2 - btmStairs[i][1])
      );
    }
    console.log(tempdist1);
    console.log(tempdist2);
    for (let i = 0; i < tempdist1.length; i++) {
      tempdist.push(tempdist1[i] + tempdist2[i]);
    }
    console.log(tempdist);
    min = Math.min(...tempdist);
    indexmin = tempdist.indexOf(min);
    console.log(indexmin);
    sx1 = btmStairs[indexmin][0];
    sy1 = btmStairs[indexmin][1];
    if (flr1 == 2) {
      path(gridLvl2, x1, y1, sx1, sy1);
    } else if (flr1 == 1) {
      path(gridLvl1, x1, y1, sx1, sy1);
    }
  } else if (flr2 != 0) {
    tempdist = [];
    tempdist1 = [];
    for (let i = 0; i < 1; i++) {
      tempdist1.push(
        Math.abs(x1 - btmStairs[i][0]) + Math.abs(y1 - btmStairs[i][1])
      );
    }
    tempdist2 = [];
    for (let i = 0; i < 1; i++) {
      tempdist2.push(
        Math.abs(x2 - btmStairs[i][0]) + Math.abs(y2 - btmStairs[i][1])
      );
    }
    console.log(tempdist1);
    console.log(tempdist2);
    for (let i = 0; i < tempdist1.length; i++) {
      tempdist.push(tempdist1[i] + tempdist2[i]);
    }
    console.log(tempdist);
    min = Math.min(...tempdist);
    indexmin = tempdist.indexOf(min);
    console.log(indexmin);
    sx1 = btmStairs[indexmin][0];
    sy1 = btmStairs[indexmin][1];
    if (flr2 == 2) {
      path(gridLvl2, x2, y2, sx1, sy1);
    } else if (flr2 == 1) {
      path(gridLvl1, x2, y2, sx1, sy1);
    }
  }

  if (flr1 == 0) {
    path(gridLvl0, x1, y1, sx1, sy1 - 8);
    console.log(sx1);
    console.log(sy1 - 8);
  } else if (flr2 == 0) {
    path(gridLvl0, x2, y2, sx1, sy1 - 8);
    console.log("flr2");
  }
  if (flr1 == 1 || flr2 == 1) mainToBtm(x1, y1, sx1, sy1, flr1, flr2);
  console.log("done!");
}

function mainToBtm(x1, y1, sx1, sy1, flr1, flr2) {
  if (flr1 == 1) {
    stairPath(x1, y1, sx1, sy1, flr1);
  }
  if (flr2 == 1) {
    stairPath(x2, y2, sx1, sy1, flr1);
  }
}

function path(grid, x1, y1, x2, y2) {
  var matrix = new PF.Grid(grid);
  var finder = new PF.AStarFinder();
  var directions = finder.findPath(x1, y1, x2, y2, matrix);
  for (let i = 0; i < directions.length; i++) {
    grid[directions[i][1]][directions[i][0]] = -4;
  }
  console.log(JSON.stringify(grid));
  if (viewLvl == 1) {
    printGrid1();
  } else if (viewLvl == 2) {
    printGrid2();
  } else if (viewLvl == 0) {
    printGrid0();
  }
}

function stairPath(x1, y1, x2, y2, fl) {
  tempdist = [];
  tempdist1 = [];
  for (let i = 0; i < 8; i++) {
    tempdist1.push(Math.abs(x1 - stairs[i][0]) + Math.abs(y1 - stairs[i][1]));
  }
  tempdist2 = [];
  for (let i = 0; i < 8; i++) {
    tempdist2.push(Math.abs(x2 - stairs[i][0]) + Math.abs(y2 - stairs[i][1]));
  }
  console.log(tempdist1);
  console.log(tempdist2);
  for (let i = 0; i < tempdist1.length; i++) {
    tempdist.push(tempdist1[i] + tempdist2[i]);
  }
  console.log(tempdist);
  min = Math.min(...tempdist);
  indexmin = tempdist.indexOf(min);
  console.log(indexmin);
  sx1 = stairs[indexmin][0];
  sy1 = stairs[indexmin][1];
  if (fl == 2) {
    path(gridLvl2, x1, y1, sx1, sy1);
    path(gridLvl1, sx1, sy1, x2, y2);
  } else if (fl == 1) {
    path(gridLvl1, x1, y1, sx1, sy1);
    path(gridLvl2, sx1, sy1, x2, y2);
  } else {
    path(gridLvl1, x1, y1, sx1, sy1);
    path(gridLvl2, sx1, sy1, x2, y2);
  }
}

function start() {
  lvl1();
  applyCookieProfiles();

  if (localStorage.getItem("shade") == "dark") {
    darkMode();
  }
}
window.start = start;

function createCanvas() {
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");
  size = document.getElementById("c").offsetWidth - 48;
  ctx.canvas.width = size;
  ctx.canvas.height = size;
  // ctx.imageSmoothingEnabled = false;
  if (viewLvl == 1) {
    printGrid1();
  } else if (viewLvl == 2) {
    printGrid2();
  } else if (viewLvl == 0) {
    printGrid0();
  }
}

function printGrid0() {
  // ctx.globalAlpha = 0.5;
  let img = source;
  ctx.drawImage(img, 0, 0, size, size);
  for (let y = 0; y < gridLvl0.length; y++) {
    for (let x = 0; x < gridLvl0[y].length; x++) {
      if (gridLvl0[x][y] == "1") {
        // ctx.fillStyle = "#000000";
        // ctx.fillRect(size / gridLvl0.length * y, size / gridLvl0.length * x, size / gridLvl0.length, size / gridLvl0.length);
      } else if (gridLvl0[x][y] == "-2") {
        ctx.fillStyle = "#00FFFF";
        ctx.fillRect(
          (size / gridLvl0.length) * y,
          (size / gridLvl0.length) * x,
          size / gridLvl0.length,
          size / gridLvl0.length
        );
      } else if (gridLvl0[x][y] == "-3") {
        ctx.fillStyle = "#FF00FF";
        ctx.fillRect(
          (size / gridLvl0.length) * y,
          (size / gridLvl0.length) * x,
          size / gridLvl0.length,
          size / gridLvl0.length
        );
      } else if (gridLvl0[x][y] == "-4") {
        ctx.fillStyle = "#F00FFF";
        ctx.fillRect(
          (size / gridLvl0.length) * y,
          (size / gridLvl0.length) * x,
          size / gridLvl0.length,
          size / gridLvl0.length
        );
      } else if (gridLvl0[x][y] == "-5") {
        ctx.fillStyle = "#F00F0F";
        ctx.fillRect(
          (size / gridLvl0.length) * y,
          (size / gridLvl0.length) * x,
          size / gridLvl0.length,
          size / gridLvl0.length
        );
      }
    }
  }
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect((size / 8) * 7, size, size / 8, (size / 17) * -1);
  ctx.fillStyle = "#000000";
  ctx.font = size / 35 + "px Arial";
  ctx.fillText("Level 0", (size / 8) * 7 + size / 100, (size / 50) * 49);
}

function printGrid1() {
  // ctx.globalAlpha = 0.5;
  let img = source;
  ctx.drawImage(img, 0, 0, size, size);
  for (let y = 0; y < gridLvl1.length; y++) {
    for (let x = 0; x < gridLvl1[y].length; x++) {
      if (gridLvl1[x][y] == "1") {
        // ctx.fillStyle = "#000000";
        // ctx.fillRect(size / gridLvl1.length * y, size / gridLvl1.length * x, size / gridLvl1.length, size / gridLvl1.length);
      } else if (gridLvl1[x][y] == "-2") {
        ctx.fillStyle = "#00FFFF";
        ctx.fillRect(
          (size / gridLvl1.length) * y,
          (size / gridLvl1.length) * x,
          size / gridLvl1.length,
          size / gridLvl1.length
        );
      } else if (gridLvl1[x][y] == "-3") {
        ctx.fillStyle = "#FF00FF";
        ctx.fillRect(
          (size / gridLvl1.length) * y,
          (size / gridLvl1.length) * x,
          size / gridLvl1.length,
          size / gridLvl1.length
        );
      } else if (gridLvl1[x][y] == "-4") {
        ctx.fillStyle = "#F00FFF";
        ctx.fillRect(
          (size / gridLvl1.length) * y,
          (size / gridLvl1.length) * x,
          size / gridLvl1.length,
          size / gridLvl1.length
        );
      } else if (gridLvl1[x][y] == "-5") {
        ctx.fillStyle = "#F00F0F";
        ctx.fillRect(
          (size / gridLvl1.length) * y,
          (size / gridLvl1.length) * x,
          size / gridLvl1.length,
          size / gridLvl1.length
        );
      }
    }
  }
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect((size / 8) * 7, size, size / 8, (size / 17) * -1);
  ctx.fillStyle = "#000000";
  ctx.font = size / 35 + "px Arial";
  ctx.fillText("Level 1", (size / 8) * 7 + size / 100, (size / 50) * 49);
}

function printGrid2() {
  // ctx.globalAlpha = 0.5;
  let img = source;
  ctx.drawImage(img, 0, 0, size, size);
  for (let y = 0; y < gridLvl2.length; y++) {
    for (let x = 0; x < gridLvl2[y].length; x++) {
      if (gridLvl2[x][y] == "1") {
        // ctx.fillStyle = "#000000";
        // ctx.fillRect(size / gridLvl2.length * y, size / gridLvl2.length * x, size / gridLvl2.length, size / gridLvl2.length);
      } else if (gridLvl2[x][y] == "-2") {
        ctx.fillStyle = "#00FFFF";
        ctx.fillRect(
          (size / gridLvl2.length) * y,
          (size / gridLvl2.length) * x,
          size / gridLvl2.length,
          size / gridLvl2.length
        );
      } else if (gridLvl2[x][y] == "-3") {
        ctx.fillStyle = "#FF00FF";
        ctx.fillRect(
          (size / gridLvl2.length) * y,
          (size / gridLvl2.length) * x,
          size / gridLvl2.length,
          size / gridLvl2.length
        );
      } else if (gridLvl2[x][y] == "-4") {
        ctx.fillStyle = "#F00FFF";
        ctx.fillRect(
          (size / gridLvl2.length) * y,
          (size / gridLvl2.length) * x,
          size / gridLvl2.length,
          size / gridLvl2.length
        );
      } else if (gridLvl2[x][y] == "-5") {
        ctx.fillStyle = "#F00F0F";
        ctx.fillRect(
          (size / gridLvl2.length) * y,
          (size / gridLvl2.length) * x,
          size / gridLvl2.length,
          size / gridLvl2.length
        );
      }
    }
  }
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect((size / 8) * 7, size, size / 8, (size / 17) * -1);
  ctx.fillStyle = "#000000";
  ctx.font = size / 35 + "px Arial";
  ctx.fillText("Level 2", (size / 8) * 7 + size / 100, (size / 50) * 49);
}

var px = 1;
var py = 1;
var old;
function onKeyDown(f) {
  if (viewLvl == 1) {
    grid = gridLvl1;
  } else if (viewLvl == 2) {
    grid = gridLvl2;
  } else if (viewLvl == 0) {
    grid = gridLvl0;
  }
  grid[py][px] = old;
  var code = f.keyCode ? f.keyCode : f.which;
  if (code === 38) {
    //up key
    py--;
  } else if (code === 40) {
    //down key
    py++;
  } else if (code === 37) {
    //left key
    px--;
  } else if (code === 39) {
    //right key
    px++;
  } else if (code === 32) {
    //space
    console.log(px + "," + py);
  }
  old = grid[py][px];
  grid[py][px] = -5;

  if (viewLvl == 1) {
    printGrid1();
  } else if (viewLvl == 2) {
    printGrid2();
  } else if (viewLvl == 0) {
    printGrid0();
  }
}
window.onkeydown = onKeyDown;

function lvl0() {
  viewLvl = 0;
  source = document.getElementById("LVL0");
  createCanvas();
}
window.lvl0 = lvl0;

function lvl1() {
  viewLvl = 1;
  source = document.getElementById("LVL1");
  createCanvas();
}
window.lvl1 = lvl1;

function lvl2() {
  viewLvl = 2;
  source = document.getElementById("LVL2");
  createCanvas();
}
window.lvl2 = lvl2;

function clearGrid() {
  // ctx.globalAlpha = 0.5;
  console.log(gridLvl1);
  console.log(gridLvl2);
  let img = source;
  ctx.drawImage(img, 0, 0, size, size);
  for (let y = 0; y < gridLvl0.length; y++) {
    for (let x = 0; x < gridLvl0[y].length; x++) {
      if (gridLvl0[x][y] == "-4") {
        gridLvl0[x][y] = 0;
      }
    }
  }
  for (let y = 0; y < gridLvl1.length; y++) {
    for (let x = 0; x < gridLvl1[y].length; x++) {
      if (gridLvl1[x][y] == "-4") {
        gridLvl1[x][y] = 0;
      }
    }
  }
  for (let y = 0; y < gridLvl2.length; y++) {
    for (let x = 0; x < gridLvl2[y].length; x++) {
      if (gridLvl2[x][y] == "-4") {
        gridLvl2[x][y] = 0;
      }
    }
  }
}

function download_img(el) {
  var image = canvas.toDataURL("image/jpg");
  el.href = image;
}

/**
 * Dark Mode
 */
function darkMode() {
  var element = document.body;
  element.classList.toggle("darkModebg");
  element.classList.toggle("lightModebg");

  var c = document.getElementById("c");
  c.classList.toggle("darkMode");
  c.classList.toggle("lightMode");

  var c2 = document.getElementById("c2");
  c2.classList.toggle("darkMode");
  c2.classList.toggle("lightMode");

  for (let i = 0; i < profiles.length; i++) {
    document.getElementById("profBox" + i);
    c2.classList.toggle("textboxdark");
    c2.classList.toggle("textbox");
  }

  if (c.classList.contains("darkMode") == true) {
    document.getElementById("darkModeButton").innerHTML = "Light Mode";
    localStorage.setItem("shade", "dark", 365);
  } else if (element.classList.contains("lightMode") == false) {
    document.getElementById("darkModeButton").innerHTML = "Dark Mode";
    localStorage.setItem("shade", "light", 365);
  }
}
window.darkMode = darkMode;

function w3_open() {
  var x = document.getElementById("mySidebar");
  x.style.width = "30%";
  x.style.fontSize = "40px";
  x.style.paddingTop = "10%";
  x.style.display = "block";
}
function w3_close() {
  document.getElementById("mySidebar").style.display = "none";
}
window.w3_close = w3_close;

/** Smooth Scroll Buttons */
jQuery(function ($) {
  // Add smooth scrolling to all links
  $("a").on("click", function (event) {
    // Make sure this.hash has a value before overriding default behavior
    if (this.hash !== "") {
      // Prevent default anchor click behavior
      event.preventDefault();

      // Store hash
      var hash = this.hash;

      // Using jQuery's animate() method to add smooth page scroll
      // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
      $("html, body").animate(
        {
          scrollTop: $(hash).offset().top,
        },
        1000,
        function () {
          // Add hash (#) to URL when done scrolling (default click behavior)
          window.location.hash = hash;
        }
      );
    } // End if
  });
});

export {};
