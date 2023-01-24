var grid;
var canvas;
var ctx;
var coursesAmt;
var courses;
var gridLvl1;
var gridLvl2;
var stairs;
var rooms;

var profiles = [];

function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";
  document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
  document.body.style.backgroundColor = "white";
}

function clearAll() {
  localStorage.setItem("profiles", null, -1);
  localStorage.setItem("shade", null, -1);
}

function profloop() {
  for (
    let i = 1;
    i < parseInt(document.getElementById("numofprof").value) + 1;
    i++
  ) {
    createProfile(i);
  }
}

function createProfile(profnum) {
  prof = String(profnum);
  console.log("prf" + prof);
  var tempElementId = "tempProf".concat("", String(prof));
  var tempElementIdNext = "tempProf" + String(profnum + 1);
  console.log("tmpprfnxt: " + tempElementIdNext);
  // var tempElementIdAlsoNext = "temp".concat("", String(num + 2));
  //creates html elements in the courses class
  console.log("prf" + prof);
  document.getElementById(tempElementId).innerHTML =
    '\
	<div class="prof txtbox w3-animate-right" id="profBox' +
    prof +
    '">\
		<div style="">\
			<button class=" containerinpt red " style="" id="add" onclick="remProf(' +
    profnum +
    ')">&#10006;</button>\
		<input onkeyup="locateCourses(' +
    profnum +
    ')" class="pink containerinpt" style="border-radius: 4px;border-color:#000000;" type="text" id="nameProf' +
    prof +
    '" placeholder="Schedule Name">\
		</div>\
	<p></p>\
	<input class="pink containerinpt" style="" id="num' +
    prof +
    '" type="number" placeholder="Num of classes in schedule">\
	<button class="pink containerinpt" onclick="courseLoop(' +
    String(profnum) +
    ')">Submit</button>\
	<div class=" selectionbox  w3-animate-right" id="temp' +
    prof +
    '1"><p></p></div>\
	<p></p>\
	</div>\
	<p></p>\
	<div class="margin" id="profspacer1"></div>\
	<div class="container" id="' +
    tempElementIdNext +
    '">';
}

function createCourse(num, profnum) {
  prof = String(profnum);
  num = String(num);
  numnxt = parseInt(num) + 1;
  console.log(num);
  console.log(prof);
  console.log("profnum: " + profnum);
  var tempElementId = "temp" + prof + num;
  var tempElementIdNext = "temp" + prof + numnxt;
  console.log("tmpid: " + tempElementId);
  console.log("tmpidnxt: " + tempElementIdNext);
  // var tempElementIdAlsoNext = "temp".concat("", String(num + 2));
  //creates html elements in the courses class
  console.log("inv" + num + prof);
  document.getElementById(tempElementId).innerHTML =
    '\
	<div id="input-con-div" class=" input-container lightModeInput">\
	<p>Class ' +
    num +
    '</p>\
	<input onkeyup="locateCourses(' +
    profnum +
    ')" class="purple containerinpt" id="cl' +
    num +
    prof +
    'txt" type="text" required="" placeholder="Name:"/>\
	</div>\
	<div id="input-con-div" class="purple input-container lightModeInput">\
	<input onkeyup="locateCourses(' +
    profnum +
    ')" class="purple containerinpt prof' +
    profnum +
    '" id="rmnum' +
    num +
    prof +
    'txt" type="text" required="" placeholder="Room Number:(ex: H100)"/>\
	</div>\
		<p class="inv" id="inv' +
    num +
    prof +
    '"></p>\
		<p> </p>\
		<div class="">\
		<span class="containerinpt" id="passing' +
    num +
    prof +
    '"style="display:block"><button style="" class="purple btninpt showpth" onclick="passingTime(' +
    String(parseInt(num) - 1) +
    "," +
    String(profnum) +
    ')">Show Path <span style="font-size:120%;">⇩</span></button></span>\
		</div>\
	<div class=" selectionbox" id="' +
    tempElementIdNext +
    '">';
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

// function createCourse(num, profnum) {
// 	prof = String(profnum)
// 	num = String(num)
// 	numnxt = parseInt(num) + 1
// 	console.log(num)
// 	console.log(prof)
// 	console.log("profnum: "+profnum)
// 	var tempElementId = "temp"+prof+num;
// 	var tempElementIdNext = "temp"+prof+numnxt;
// 	console.log("tmpid: " + tempElementId)
// 	console.log("tmpidnxt: " + tempElementIdNext)
// 	// var tempElementIdAlsoNext = "temp".concat("", String(num + 2));
// 	//creates html elements in the courses class
// 	document.getElementById(tempElementId).innerHTML = '\
// 	<div id="input-con-div" class="input-container lightModeInput">\
// 	<input id="cl' + num + prof +'txt" type="text" required=""/>\
// 	<label id="cl' + num + prof + 'label">Class ' + num +'</label>\
// 	</div>\
// <span id="typeId' + num + prof + '">\
// 	<div id="input-con-div" class="input-container lightModeInput">\
// 	<input class="prof'+ profnum +'" id="rmnum' + num + prof + 'txt" type="text" required=""/>\
// 	<label id="rmnum' + num + prof + 'label">Room Number</label>\
// 	</div>\
// <span id="typeId' + num + prof + '">\
// 		<p> </p>\
// 		<button onclick="passingTime('+ String(parseInt(num) - 1) + "," + String(profnum) + ')">Show Path</button>\
// 	<div class="selectionbox" id="' + tempElementIdNext + '">';

// }

function addProf() {
  profnum = document.querySelectorAll(".prof").length;
  if (profnum == 0) {
    createProfile(profnum + 1);
  } else {
    locateCourses(profnum);
    createProfile(profnum + 1);
  }
}

function remProf(profnum) {
  console.log("___SPLICING___");
  console.log("profnum = " + profnum);

  console.log(JSON.stringify(profiles));

  profiles.splice(profnum, 1);
  profiles[0].splice(profnum, 1);

  document.getElementById("profiles").innerHTML =
    '<div class="" id="tempProf1"></div>';

  localStorage.setItem("profiles", JSON.stringify(profiles));

  applyCookieProfiles();
  console.log("___END___");
}

function courseLoop(profnum) {
  prof = String(profnum);
  coursesAmt = parseInt(document.getElementById("num" + profnum).value) + 1;
  console.log(prof);
  if (coursesAmt != NaN) {
    for (let i = 1; i < coursesAmt; i++) {
      createCourse(i, profnum, 0);
    }
    console.log("passing" + String(coursesAmt - 1) + String(prof));
    document.getElementById(
      "passing" + String(coursesAmt - 1) + String(prof)
    ).innerHTML = null;
    document.getElementById("loccourses" + profnum).style.display = "block";
  }
}

function locateCourses(profnum) {
  console.log("profnum = " + profnum);
  prof = String(profnum);
  profiles[profnum] = [];
  if (profiles[0] == null) {
    profiles[0] = [];
  }
  for (
    let i = 1;
    i < document.querySelectorAll(".prof" + profnum + "").length + 1;
    i++
  ) {
    profiles[0][profnum] = document.getElementById("nameProf" + profnum).value;
    profiles[profnum][i - 1] = [];
    console.log("rmnum" + String(parseInt(i) + 1) + prof + "txt");
    profiles[profnum][i - 1][0] = document.getElementById(
      "rmnum" + i + prof + "txt"
    ).value;
    profiles[profnum][i - 1][1] = document.getElementById(
      "cl" + i + prof + "txt"
    ).value;
  }
  localStorage.setItem("profiles", JSON.stringify(profiles));
  console.log(localStorage.getItem("profiles"));
}

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

function passingTime(num, profnum) {
  clearGrid();
  num = parseInt(num);
  // console.log(profnum)
  // console.log(num)
  // console.log(profiles[profnum])
  // console.log(profiles[profnum][num])
  // console.log(profiles[profnum][num][0])
  start = profiles[profnum][num][0];
  end = profiles[profnum][num + 1][0];

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
  console.log("inv" + String(num) + String(profnum));
  console.log(rooms[start]);
  console.log(String(num + 1) + String(profnum));
  console.log(rooms[end]);
  console.log(String(num + 2) + String(profnum));

  if (rooms[start] == null) {
    document.getElementById(
      "inv" + String(num + 1) + String(profnum)
    ).innerHTML = "Invalid Room Number";
    stinv1 = 1;
  } else {
    document.getElementById(
      "inv" + String(num + 1) + String(profnum)
    ).innerHTML = "";
    stinv1 = 0;
  }
  if (rooms[end] == null) {
    console.log(rooms[end]);
    console.log(String(num + 2) + String(profnum));
    document.getElementById(
      "inv" + String(num + 2) + String(profnum)
    ).innerHTML = "Invalid Room Number";
    stinv2 = 1;
  } else {
    document.getElementById(
      "inv" + String(num + 2) + String(profnum)
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
  if (veiwlvl == 1) {
    printGrid1();
  } else if (veiwlvl == 2) {
    printGrid2();
  } else if (veiwlvl == 0) {
    printGrid0();
  }
}
stairs = {
  0: [23, 13],
  1: [63, 16],
  2: [103, 16],
  3: [65, 61],
  4: [96, 61],
  5: [129, 119],
  6: [68, 121],
  7: [92, 121],
};
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
rooms = {
  H100: [68, 12, 1],
  H102: [58, 8, 1],
  H103: [58, 19, 1],
  H104: [58, 6, 1],
  H106: [56, 12, 1],
  H107: [53, 15, 1],
  H108: [48, 12, 1],
  H109: [46, 20, 1],
  H110: [46, 6, 1],
  H111: [40, 15, 1],
  H112: [39, 12, 1],
  H113: [38, 15, 1],
  H115: [33, 20, 1],
  H116: [33, 6, 1],
  H117: [33, 15, 1],
  H118: [30, 12, 1],
  F100: [77, 12, 1],
  F101: [80, 75, 1],
  F102: [81, 12, 1],
  F103: [81, 54, 1],
  F104: [91, 12, 1],
  F105: [81, 23, 1],
  F106: [95, 12, 1],
  F108: [103, 12, 1],
  F110: [97, 20, 1],
  F112: [99, 32, 1],
  H114: [99, 41, 1],
  H116: [97, 49, 1],
  H118: [97, 54, 1],
  E101: [108, 79, 1],
  E102: [98, 76, 1],
  E103: [122, 73, 1],
  G101: [60, 77, 1],
  G102: [64, 74, 1],
  G104: [62, 73, 1],
  G105: [55, 77, 1],
  G106: [60, 73, 1],
  G107: [49, 77, 1],
  G108: [51, 73, 1],
  G110: [49, 73, 1],
  G112: [40, 73, 1],
  G113: [41, 77, 1],
  G114: [37, 73, 1],
  D100: [65, 113, 1],
  D101: [64, 125, 1],
  D102: [64, 111, 1],
  D103: [59, 121, 1],
  D104: [62, 116, 1],
  D105: [57, 121, 1],
  D106: [54, 116, 1],
  D107: [52, 126, 1],
  D108: [52, 111, 1],
  D109: [46, 121, 1],
  D110: [48, 113, 1],
  D111: [44, 121, 1],
  D112: [41, 116, 1],
  D113: [39, 126, 1],
  D114: [39, 111, 1],
  D115: [34, 121, 1],
  D116: [37, 116, 1],
  B100: [87, 114, 1],
  B101: [96, 125, 1],
  B102: [96, 112, 1],
  B103: [101, 120, 1],
  B104: [102, 118, 1],
  B105: [103, 120, 1],
  B106: [106, 118, 1],
  B107: [108, 125, 1],
  B108: [108, 112, 1],
  B109: [113, 120, 1],
  B110: [110, 118, 1],
  B111: [115, 120, 1],
  B112: [118, 118, 1],
  B113: [120, 125, 1],
  B114: [120, 112, 1],
  B115: [122, 118, 1],
  B116: [126, 120, 1],
  E100: [100, 102, 1],
  H200: [68, 13, 2],
  H202: [59, 8, 2],
  H203: [58, 20, 2],
  H204: [58, 6, 2],
  H205: [52, 15, 2],
  H206: [55, 11, 2],
  H207: [50, 15, 2],
  H208: [48, 11, 2],
  H209: [45, 20, 2],
  H210: [45, 6, 2],
  H211: [40, 15, 2],
  H212: [40, 11, 2],
  H213: [38, 15, 2],
  H214: [36, 11, 2],
  H215: [33, 20, 2],
  H216: [33, 6, 2],
  H217: [28, 15, 2],
  H218: [28, 11, 2],
  F200: [76, 12, 2],
  F201: [81, 60, 2],
  F202: [80, 12, 2],
  F203: [81, 54, 2],
  F204: [89, 12, 2],
  F206: [94, 12, 2],
  F208: [103, 12, 2],
  F209: [0, 0, 0],
  F210: [96, 18, 2],
  F211: [0, 0, 0],
  F212: [98, 33, 2],
  F216: [99, 44, 2],
  F218: [96, 56, 2],
  E200: [91, 88, 2],
  E201: [96, 80, 2],
  E202: [98, 74, 2],
  E203: [104, 77, 2],
  E204: [105, 74, 2],
  E205: [117, 77, 2],
  E206: [114, 74, 2],
  E207: [119, 77, 2],
  E209: [119, 77, 2],
  E210: [121, 74, 2],
  E212: [122, 73, 2],
  G201: [66, 84, 2],
  G202: [66, 72, 2],
  G204: [66, 66, 2],
  G205: [57, 81, 2],
  G206: [55, 72, 2],
  G207: [52, 79, 2],
  G209: [41, 77, 2],
  G210: [45, 71, 2],
  G211: [40, 81, 2],
  G212: [43, 71, 2],
  G213: [38, 81, 2],
  G214: [35, 73, 2],
  G215: [37, 77, 2],
  D200: [66, 118, 2],
  D201: [65, 125, 2],
  D202: [65, 112, 2],
  D203: [60, 120, 2],
  D204: [61, 117, 2],
  D205: [58, 120, 2],
  D206: [57, 117, 2],
  D207: [53, 125, 2],
  D208: [53, 112, 2],
  D209: [47, 120, 2],
  D210: [49, 117, 2],
  D211: [45, 120, 2],
  D212: [43, 117, 2],
  D213: [40, 125, 2],
  D214: [40, 112, 2],
  D215: [35, 120, 2],
  D216: [38, 117, 2],
  B200: [88, 113, 2],
  B201: [96, 125, 2],
  B202: [96, 112, 2],
  B203: [101, 120, 2],
  B205: [103, 120, 2],
  B206: [105, 117, 2],
  B208: [109, 114, 2],
  B209: [115, 120, 2],
  B212: [113, 117, 2],
  B213: [122, 125, 2],
  B214: [122, 114, 2],
  B215: [124, 120, 2],
  B216: [124, 117, 2],
  C200: [85, 120, 2],
  C202: [80, 120, 2],
  C203: [76, 87, 2],
  C204: [89, 88, 2],
  C205: [80, 113, 2],
  C206: [80, 113, 2],
  C207: [80, 113, 2],
  C208: [80, 113, 2],
  C209: [80, 113, 2],
  C210: [80, 113, 2],
  C211: [80, 113, 2],
  C212: [80, 113, 2],
  C213: [80, 113, 2],
  C214: [80, 113, 2],
  C215: [80, 113, 2],
  C216: [80, 113, 2],
  C217: [80, 113, 2],
  C218: [80, 113, 2],
  C219: [80, 113, 2],
  C220: [80, 113, 2],
  C221: [80, 113, 2],
  C222: [80, 113, 2],
  C223: [80, 113, 2],
  C224: [80, 113, 2],
  C225: [80, 113, 2],
  C226: [80, 113, 2],
  A214: [80, 130, 2],
  A213: [80, 137, 2],
  A212: [80, 113, 2],
  A211: [80, 143, 2],
  A001: [85, 156, 0],
  A002: [77, 160, 0],
  A004: [74, 149, 0],
};

function start() {
  url = window.location.href;
  if (url.includes("one-time-use") != true) {
    console.log(url);
    url = url.replace("/#myHeader");
    url = url.replace("#myHeader");
    console.log(url);
    if (
      url == "https://phs-map.parkerhasenkamp.repl.co" ||
      url == "https://phs-map.parkerhasenkamp.repl.co/"
    ) {
      document.getElementById("OTULink").href = "/one-time-use.html";
    } else if (
      url == "https://parkerh27.github.io/PHS-Map/" ||
      url == "https://parkerh27.github.io/PHS-Map"
    ) {
      document.getElementById("OTULink").href =
        "https://parkerh27.github.io/PHS-Map/one-time-use.html";
    } else if (
      url == "https://parkerh27.github.io/PHS-Map/" ||
      url == "https://parkerh27.github.io/PHS-Map"
    ) {
      document.getElementById("OTULink").href =
        "https://parkerh27.github.io/PHS-Map/one-time-use.html";
    } else {
      document.getElementById("OTULink").href =
        "https://psdtools.github.io/PHS-Map/one-time-use.html";
    }
    console.log("!includes");
  } else {
    console.log(url);
    url = url.replace("/#myHeader");
    url = url.replace("#myHeader");
    url = url.replace("/one-time-use.html", "");
    console.log(url);
    if (
      url == "https://phs-map.parkerhasenkamp.repl.co" ||
      url == "https://phs-map.parkerhasenkamp.repl.co/"
    ) {
      document.getElementById("OTULink").href =
        "https://phs-map.parkerhasenkamp.repl.co";
    } else if (
      url == "https://parkerh27.github.io/PHS-Map/" ||
      url == "https://parkerh27.github.io/PHS-Map"
    ) {
      document.getElementById("OTULink").href =
        "https://parkerh27.github.io/PHS-Map";
    } else if (
      url == "https://parkerh27.github.io/PHS-Map/" ||
      url == "https://parkerh27.github.io/PHS-Map"
    ) {
      document.getElementById("OTULink").href =
        "https://parkerh27.github.io/PHS-Map";
    } else {
      document.getElementById("OTULink").href =
        "https://psdtools.github.io/PHS-Map";
    }
    console.log("includes");
  }

  lvl1();
  applyCookieProfiles();
  if (window.location.href.includes("?")) {
    if (window.location.href.includes("one-time-use.html")) {
      urlstr = window.location.href;
      attrib = urlstr.split("?").pop();
      attriblst = attrib.split(":");
      console.log(attriblst);
      if (attriblst[0] == "rms") {
        classes = attriblst[1].split("&");
        document.getElementById("course1").value = classes[0];
        classes[1] = classes[1].split("#")[0];
        document.getElementById("course2").value = classes[1];
        otuPath();
      }
    }
  }
  if (localStorage.getItem("shade") == "dark") {
    darkMode();
  }
}

function createCanvas() {
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");
  size = document.getElementById("c").offsetWidth - 48;
  ctx.canvas.width = size;
  ctx.canvas.height = size;
  // ctx.imageSmoothingEnabled = false;
  if (veiwlvl == 1) {
    printGrid1();
  } else if (veiwlvl == 2) {
    printGrid2();
  } else if (veiwlvl == 0) {
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
window.onkeydown = function (f) {
  if (veiwlvl == 1) {
    grid = gridLvl1;
  } else if (veiwlvl == 2) {
    grid = gridLvl2;
  } else if (veiwlvl == 0) {
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

  if (veiwlvl == 1) {
    printGrid1();
  } else if (veiwlvl == 2) {
    printGrid2();
  } else if (veiwlvl == 0) {
    printGrid0();
  }
};
function lvl0() {
  veiwlvl = 0;
  source = document.getElementById("LVL0");
  createCanvas();
}
function lvl1() {
  veiwlvl = 1;
  source = document.getElementById("LVL1");
  createCanvas();
}
function lvl2() {
  veiwlvl = 2;
  source = document.getElementById("LVL2");
  createCanvas();
}
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

download_img = function (el) {
  var image = canvas.toDataURL("image/jpg");
  el.href = image;
};

//Dark Mode
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

// window.onkeyup = function (e) {
//     var code = e.keyCode ? e.keyCode : e.which;
//     // if (code === 38) { //up key
//     //     keys += "1"
//     // }
// };
