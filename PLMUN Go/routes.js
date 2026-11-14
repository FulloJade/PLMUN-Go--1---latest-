/* ==========================================================================
   PLMUN GO: CAMPUS LAYOUT + ROUTE ENGINE  (routes.js)
   One shared brain used by BOTH the AR Guide (ar.html) and the Directions
   panel on the home page (directions.js).

   Built from the complete PLMUN layout (campus map + every floor plan).
   - Rows are listed LEFT -> RIGHT exactly as drawn on the floor plans,
     as you stand at the building's main entrance looking in.
   - '#stairs' '#elevator' '#doors' '#gap' are markers, everything else is a room.
   - To fix a room name or position, edit BUILDINGS below. Everything
     (routes, "where is it", AR guide) updates by itself.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------- 1. THE LAYOUT ---------------- */
  var BUILDINGS = {
 "campus": {
  "name": "Campus grounds",
  "alias": "Outdoor spots",
  "no": "",
  "node": null,
  "outdoor": true,
  "rowNames": {},
  "fromGate": "",
  "doors": "",
  "vertical": "",
  "floors": {
   "1": {
    "list": [
     "Main Gate",
     "Covered Court / Gym"
    ]
   }
  }
 },
 "mabini": {
  "name": "Mabini Building",
  "alias": "Student Center",
  "no": "Building 1",
  "rowNames": {
   "main": "floor"
  },
  "fromGate": "",
  "doors": "The entrance is in the middle of the front of the building, between the Registrar and the Treasury.",
  "vertical": "The stairs are at the far left end and the far right end of every floor. Use whichever is closer.",
  "floors": {
   "1": {
    "main": [
     "#stairs",
     "Office of the University Registrar",
     "#doors",
     "Treasury Office",
     "#stairs"
    ]
   },
   "2": {
    "main": [
     "#stairs",
     "Office of the OSA Directors",
     "Center for Guidance & Counseling",
     "Office of Student Affairs",
     "Prefect of Discipline",
     "CIPAA",
     "Command Center",
     "#stairs"
    ]
   },
   "3": {
    "main": [
     "#stairs",
     "The Warden Publication",
     "OSA Cultural Hall",
     "PLMun Chorale Room",
     "Design Center for Nation Building",
     "Reserve Officers' Training Corps (ROTC) Office",
     "#stairs"
    ]
   }
  }
 },
 "bonifacio": {
  "name": "Bonifacio Building",
  "alias": "Main Building",
  "no": "Building 2",
  "rowNames": {
   "back": "back row (the north side, with the Student CR at the far left)",
   "front": "front row (the south side, the same side as the main doors)"
  },
  "fromGate": "",
  "doors": "The main doors are in the middle of the front row, between the Business Center and the Records Office. There is also a side entrance/exit at each end of the hallway.",
  "vertical": "The stairs are in the middle of the back row, and at the far left and far right ends of the front row. Bonifacio has no elevator of its own; the elevator is at the far left end of Del Pilar, where the two buildings meet.",
  "floors": {
   "1": {
    "back": [
     "Student CR",
     "CCJ Temporary Faculty (1)",
     "CCJ Temporary Faculty (2)",
     "PLMun HRDMO",
     "#stairs",
     "Assessment Office",
     "Supply Office",
     "University Clinic",
     "Admin CR"
    ],
    "front": [
     "#stairs",
     "CBA & CTE Temporary Faculty",
     "CAS & GAD Temporary Faculty",
     "Business Center",
     "#doors",
     "Records Office",
     "Soroptimist International of Alabang (SIA) Hall",
     "#stairs"
    ]
   },
   "2": {
    "back": [
     "Student CR",
     "Room 201",
     "Computer Laboratory 4",
     "CITCS Faculty and Dean's Office",
     "#stairs",
     "Computer Laboratory 2",
     "ICT Help Desk",
     "Information Communication Technology (ICT) Office",
     "Admin CR"
    ],
    "front": [
     "#stairs",
     "Room 202",
     "Room 203",
     "BAPOL & BAPAD Temporary Faculty",
     "Multimedia & Laboratory Management Office",
     "Computer Laboratory 3",
     "Speech Laboratory",
     "Computer Laboratory 1",
     "#stairs"
    ]
   },
   "3": {
    "back": [
     "Student CR",
     "Room 301",
     "Room 303",
     "Room 304",
     "#stairs",
     "CAS Dean's Office",
     "Room 306",
     "Room 308",
     "Admin CR"
    ],
    "front": [
     "#stairs",
     "Psychology Laboratory",
     "Room 302",
     "Radio Room",
     "Psychology Clinic",
     "CAS Faculty",
     "Room 305",
     "Room 307",
     "#stairs"
    ]
   },
   "4": {
    "back": [
     "Student CR",
     "Room 402",
     "Room 404",
     "Room 405",
     "#stairs",
     "PLMun Audio Visual Room",
     "Admin CR"
    ],
    "front": [
     "#stairs",
     "Room 401",
     "Room 403",
     "CTE Faculty",
     "Satellite Library",
     "#stairs"
    ]
   }
  }
 },
 "delpilar": {
  "name": "Del Pilar Building",
  "alias": "Admin Building",
  "no": "Building 3",
  "rowNames": {
   "back": "back row (the north side, the side with the elevator)",
   "front": "front row (the south side, the same side as the main doors)"
  },
  "fromGate": "",
  "doors": "The main doors are in the middle of the front row, between the Vice President for REQALIA and the cafeteria. There is also a side entrance/exit at the far right end of the hallway.",
  "vertical": "The elevator is at the far left end of the back row (floors 1 to 4). The stairs are in the middle of the back row, and at the far left and far right ends of the front row. The 5th floor can only be reached by the stairs.",
  "floors": {
   "1": {
    "back": [
     "#elevator",
     "Vice President for Academic Affairs",
     "Vice President for Finance and Resource Generation",
     "Office of the University President",
     "Presidential Staff",
     "Planning Room",
     "Prayer Room",
     "#stairs",
     "University Cafeteria (Emerald Hall)",
     "Student CR"
    ],
    "front": [
     "#stairs",
     "University Board Room",
     "Quality Assurance Office",
     "Vice President for Students' Life and Development",
     "Executive Vice President",
     "Vice President for REQALIA",
     "#doors",
     "University Cafeteria (Emerald Hall)",
     "#stairs"
    ]
   },
   "2": {
    "back": [
     "#elevator",
     "Computer Laboratory 5",
     "Computer Laboratory 6",
     "Room 218",
     "#stairs",
     "Room 222",
     "Room 224",
     "Student CR"
    ],
    "front": [
     "#stairs",
     "Stock Room",
     "Room 217",
     "Room 219",
     "Room 220",
     "Room 221",
     "Room 223",
     "#stairs"
    ]
   },
   "3": {
    "back": [
     "#elevator",
     "Room 309",
     "Room 310",
     "Room 312",
     "#stairs",
     "Room 314",
     "Room 316",
     "Student CR"
    ],
    "front": [
     "#stairs",
     "COA Faculty",
     "Office 6",
     "Room 311",
     "CBA Faculty",
     "Room 313",
     "Room 315",
     "#stairs"
    ]
   },
   "4": {
    "back": [
     "#elevator",
     "Biology Laboratory",
     "Physics Laboratory",
     "Chemistry Laboratory",
     "#stairs",
     "Room 410",
     "CCJ Faculty",
     "Student CR"
    ],
    "front": [
     "#stairs",
     "Office 12",
     "Room 406",
     "Room 407",
     "Room 408",
     "Room 409",
     "Room 411",
     "#stairs"
    ]
   },
   "5": {
    "back": [
     "#gap",
     "Room 510",
     "Room 508",
     "Room 506",
     "Room 504",
     "Room 502",
     "#gap",
     "Student CR"
    ],
    "front": [
     "#gap",
     "Room 509",
     "Room 507",
     "Room 505",
     "Room 503",
     "Room 501",
     "#gap",
     "#stairs"
    ]
   }
  }
 },
 "rizal": {
  "name": "Rizal Building",
  "alias": "RLRC",
  "no": "Building 4",
  "rowNames": {
   "main": "floor"
  },
  "fromGate": "",
  "doors": "The main entrance is in the middle of the north side (the side facing the walkway).",
  "vertical": "Go UP using the stairs on the RIGHT side. The stairs on the LEFT side are for going DOWN only. Stand at the entrance facing the rooms: left is down, right is up. The RLRC has 4 floors.",
  "floors": {
   "1": {
    "main": [
     "#stairs",
     "Faculty Innovation Hub",
     "Research & Learning Resource Center",
     "University Learning Resource Center",
     "General Services Office",
     "Maintenance & Housekeeping",
     "CR",
     "#stairs"
    ]
   },
   "2": {
    "main": [
     "#stairs",
     "Library Reservation Area",
     "RLRC 201",
     "RLRC 202",
     "Research & Creative Work Office",
     "Educ Hub",
     "Counseling Simulation Center",
     "College of Graduate Studies",
     "Office of the Director, CCPD",
     "CR",
     "#stairs"
    ]
   },
   "3": {
    "main": [
     "#stairs",
     "Melchora Aquino Hall (301)",
     "Gabriela Silang Hall (302)",
     "Josefa Llanes Escoda Hall (303)",
     "Sultan Kudarat Hall (304)",
     "Gregorio Del Pilar Hall (305)",
     "Heroes' Hall TBA (1)",
     "Heroes' Hall TBA (2)",
     "Heroes' Hall TBA (3)",
     "CR",
     "#stairs"
    ]
   },
   "4": {
    "main": [
     "#stairs",
     "Anatomy Lab",
     "Biophysics Lab",
     "Observation Room",
     "Operating Room, Nursing Arts Lab, Emergency Room & ICU",
     "Room 405: Nursing Arts Lab, Labor & Delivery Room, Outpatient Clinic",
     "Room 404: Classroom Year 1",
     "Room 403",
     "Office of the Dean",
     "Faculty Office",
     "Classroom Year 2",
     "CR",
     "#stairs"
    ]
   }
  }
 }
};

  /* ---------------- 2. WALKING OUTSIDE (from the university map) ----------
     Orientation: the main gate is at the bottom-left of the map. The road runs up the
     LEFT side of the campus. Student Center (top-left) and Covered Court/Gym are on that
     road. A walkway runs EAST along the front (south side) of Bonifacio then Del Pilar.
     Between those two buildings (the elevator/entrance strip) a walkway runs SOUTH to
     the RLRC, whose entrance is in the middle of its north side.
     EDIT any sentence below if the real walk is different.                      */
  var OUT = {
    'gate>mabini':     ['From the main gate, walk straight up the road on the LEFT side of the campus. The Covered Court/Gym will be on your right.', 'The Student Center is the building at the top-left, and its entrance faces the road.'],
    'gate>court':      ['From the main gate, walk up the road on the LEFT side of the campus. The Covered Court/Gym is on your right, just before the Student Center.'],
    'gate>mainadmin':  ['From the main gate, follow the road up the LEFT side of the campus, past the Covered Court/Gym and the Student Center.', 'Where the road turns to the RIGHT (east), follow the walkway. Bonifacio (the Main Building) is the first building, and Del Pilar (the Admin Building) comes right after it. Both main doors face the walkway.'],
    'gate>rizal':      ['From the main gate, walk up the road on the LEFT side of the campus until you reach the Covered Court/Gym.', 'Take the walkway on your RIGHT (east) past the Gazebo. The RLRC is the long building at the end, with its entrance in the middle of its north side.'],
    'court>gate':      ['Leave the Covered Court/Gym and walk down the road on the left side of the campus to the main gate.'],
    'court>mabini':    ['Leave the Covered Court/Gym toward the road. The Student Center is right across the road, and its entrance faces you.'],
    'court>mainadmin': ['Leave the Covered Court/Gym and turn RIGHT (east) onto the walkway.', 'Bonifacio (the Main Building) is the first building, and Del Pilar (the Admin Building) comes right after it.'],
    'court>rizal':     ['Leave the Covered Court/Gym and take the walkway to the RIGHT (east) past the Gazebo.', 'The RLRC is the long building at the end, with its entrance in the middle of its north side.'],
    'mabini>gate':     ['Leave the Student Center and turn RIGHT toward the road, then follow the road down the left side of the campus to the main gate. The Covered Court/Gym will be on your left.'],
    'mabini>court':    ['Leave the Student Center. The Covered Court/Gym is just across the road, on the south side.'],
    'mabini>mainadmin':['Leave the Student Center and turn LEFT (east) onto the walkway, away from the gate.', 'Bonifacio (the Main Building) is the first building along the walkway, and Del Pilar (the Admin Building) comes right after it.'],
    'mabini>rizal':    ['Leave the Student Center and turn LEFT (east) onto the walkway, then take the path on your right that passes the Gazebo.', 'The RLRC is the long building ahead, with its entrance in the middle of its north side.'],
    'mainadmin>gate':  ['Leave through the main doors and turn RIGHT (west) along the walkway, past the Student Center, then follow the road down the left side of the campus to the main gate.'],
    'mainadmin>court': ['Leave through the main doors and turn RIGHT (west) along the walkway. The Covered Court/Gym is beside the Student Center, on the south side of the road.'],
    'mainadmin>mabini':['Leave through the main doors and turn RIGHT (west) along the walkway, away from Del Pilar. The Student Center is at the end, on your right.'],
    'mainadmin>rizal': ['Leave through the main doors and walk to the open gap between Bonifacio and Del Pilar (the elevator/entrance strip).', 'Face SOUTH and follow the walkway straight down. The RLRC is ahead, with its entrance in the middle of its north side.'],
    'rizal>gate':      ['Leave the RLRC through its main entrance and turn LEFT (west) onto the walkway. Walk past the Gazebo and the Covered Court/Gym, then follow the road down the left side of the campus to the main gate.'],
    'rizal>court':     ['Leave the RLRC through its main entrance and turn LEFT (west) onto the walkway. Walk past the Gazebo to the Covered Court/Gym.'],
    'rizal>mabini':    ['Leave the RLRC through its main entrance and turn LEFT (west) onto the walkway, past the Gazebo and the Covered Court/Gym, up to the Student Center.'],
    'rizal>mainadmin': ['Leave the RLRC through its main entrance and walk straight NORTH along the walkway to the open gap between Bonifacio and Del Pilar.', 'Bonifacio (the Main Building) is on your LEFT and Del Pilar (the Admin Building) is on your RIGHT.']
  };

  /* ---------------- helpers ---------------- */
  var ORD = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th' };
  function ordinal(n) { return n + (n % 100 > 10 && n % 100 < 14 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th')); }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
  var NODE = { mabini: 'mabini', bonifacio: 'mainadmin', delpilar: 'mainadmin', rizal: 'rizal' };
  function nodeOf(r) { return r.bk === 'campus' ? (r.name === 'Main Gate' ? 'gate' : 'court') : NODE[r.bk]; }
  function maxFloor(bk) { return Math.max.apply(null, Object.keys(BUILDINGS[bk].floors).map(Number)); }

  /* ---------------- every room, in one list ---------------- */
  var ROOMS = [], BY_KEY = {};
  Object.keys(BUILDINGS).forEach(function (bk) {
    var b = BUILDINGS[bk];
    Object.keys(b.floors).forEach(function (f) {
      var fl = b.floors[f], floor = Number(f);
      function add(name, row, idx) {
        var key = bk + '|' + floor + '|' + name;
        if (BY_KEY[key]) return;
        var r = { key: key, name: name, bk: bk, floor: floor, row: row, idx: idx,
          where: bk === 'campus' ? 'Campus grounds' : b.name + ' · ' + ORD[floor] + ' floor' };
        BY_KEY[key] = r; ROOMS.push(r);
      }
      if (fl.list) { fl.list.forEach(function (n) { add(n, null, -1); }); return; }
      Object.keys(fl).forEach(function (row) {
        fl[row].forEach(function (n, i) { if (n.charAt(0) !== '#') add(n, row, i); });
      });
    });
  });

  function find(name, bk, floor) {
    if (bk && floor && BY_KEY[bk + '|' + Number(floor) + '|' + name]) return BY_KEY[bk + '|' + Number(floor) + '|' + name];
    if (BY_KEY[name]) return BY_KEY[name];
    var n = String(name).toLowerCase();
    return ROOMS.filter(function (r) { return r.name.toLowerCase() === n; })[0] ||
           ROOMS.filter(function (r) { return r.name.toLowerCase().indexOf(n) !== -1; })[0] || null;
  }

  /* ---------------- reading a floor ---------------- */
  function rowOf(r) { return BUILDINGS[r.bk].floors[r.floor][r.row]; }
  function shortRow(r) { return r.row === 'main' ? 'floor' : r.row + ' row'; }
  function frac(row, idx) { return row.length > 1 ? idx / (row.length - 1) : 0.5; }
  function posOf(r) { return r.row ? frac(rowOf(r), r.idx) : 0.5; }
  function markerName(m) { return { '#stairs': 'the stairs', '#elevator': 'the elevator', '#doors': 'the main doors', '#gap': 'the side opening' }[m] || m; }
  function dirBetween(a, b) { var d = b - a; return Math.abs(d) < 0.08 ? 'up' : (d < 0 ? 'left' : 'right'); }
  function endWord(p) { return p < 0.2 ? 'far left end' : (p > 0.8 ? 'far right end' : 'middle'); }

  // description of a room's spot: "the 7th room from the left on the back row, between X and Y"
  function whereText(r) {
    if (!r.row) return r.name + ' is on this floor. Check the signs for its exact spot.';
    var row = rowOf(r), skipStairs = r.bk === 'rizal' || r.bk === 'mabini';
    var rooms = row.filter(function (x) { return x.charAt(0) !== '#'; });
    var pos = rooms.indexOf(r.name) + 1;
    var on = r.row === 'main' ? 'on this floor' : 'on the ' + shortRow(r);
    function neighbour(i, step) {
      var j = i + step;
      while (j >= 0 && j < row.length && (row[j] === '#gap' || (skipStairs && row[j] === '#stairs'))) j += step;
      return j >= 0 && j < row.length ? markerName(row[j]) : null;
    }
    var left = neighbour(r.idx, -1), right = neighbour(r.idx, 1);
    var t = r.name + ' is the ' + ordinal(pos) + ' room from the left ' + on;
    if (left && right) t += ', between ' + left + ' and ' + right + '.';
    else if (right) t += ', at the far left end, next to ' + right + '.';
    else if (left) t += ', at the far right end, next to ' + left + '.';
    else t += '.';
    return t;
  }

  /* ---------------- stairs and elevators ---------------- */
  function stairsOn(bk, floor) {
    var fl = BUILDINGS[bk].floors[floor], out = [];
    if (!fl || fl.list) return out;
    Object.keys(fl).forEach(function (row) {
      fl[row].forEach(function (x, i) { if (x === '#stairs') out.push({ pos: frac(fl[row], i), row: row }); });
    });
    return out;
  }
  function hasElevator(bk, floor) {
    var fl = BUILDINGS[bk].floors[floor];
    return !!fl && !fl.list && Object.keys(fl).some(function (k) { return fl[k].indexOf('#elevator') > -1; });
  }
  // choose the stairs to use between two floors (they must exist on both floors)
  function stairsBetween(bk, from, to, nearPos) {
    var s = stairsOn(bk, from), up = to > from;
    if (!s.length) return null;
    if (bk === 'rizal') {                     // RLRC: UP on the RIGHT, DOWN on the LEFT
      s.sort(function (a, b) { return a.pos - b.pos; });
      return up ? s[s.length - 1] : s[0];
    }
    var other = stairsOn(bk, to);
    var both = s.filter(function (c) { return other.some(function (o) { return Math.abs(o.pos - c.pos) < 0.2; }); });
    if (!both.length) both = s;
    both.sort(function (a, b) { return Math.abs(a.pos - nearPos) - Math.abs(b.pos - nearPos); });
    return both[0];
  }
  function stairsText(bk, st, up, elev) {
    if (bk === 'rizal') return up ? 'the RIGHT stairs (the stairs for going up)' : 'the LEFT stairs (the stairs for going down)';
    var t = 'the stairs at the ' + endWord(st.pos) + (st.row === 'main' ? '' : ' of the ' + st.row + ' row');
    if (elev) t += ' (or take the elevator at the far left end of the back row)';
    return t;
  }

  // go from floor `from` to floor `to` inside one building; returns steps + where you end up
  function changeFloor(bk, from, pos, to, canWalk) {
    var steps = [];
    if (from === to) return { steps: steps, pos: pos };
    var up = to > from, st = stairsBetween(bk, from, to, pos), n = Math.abs(to - from);
    var elev = hasElevator(bk, from) && hasElevator(bk, to);
    if (st && canWalk) steps.push({ dir: dirBetween(pos, st.pos), text: 'Walk to ' + stairsText(bk, st, up, elev) + '.' });
    steps.push({ dir: up ? 'up' : 'down', text: (up ? 'Go UP ' : 'Go DOWN ') + plural(n, 'floor') + ' to the ' + ORD[to] + ' floor' +
      (bk === 'rizal' ? (up ? ' using the RIGHT stairs.' : ' using the LEFT stairs.') : '.') });
    return { steps: steps, pos: st ? st.pos : 0.5 };
  }

  function doorsPos(bk) {
    var fl = BUILDINGS[bk].floors[1];
    if (!fl || fl.list) return 0.5;
    var rows = Object.keys(fl);
    for (var i = 0; i < rows.length; i++) { var k = fl[rows[i]].indexOf('#doors'); if (k > -1) return frac(fl[rows[i]], k); }
    return 0.5;
  }

  // walk from position p (0..1) to a room on its floor
  function walkTo(r, p) {
    if (!r.row) return [{ dir: 'up', text: whereText(r) }];
    var q = posOf(r), d = dirBetween(p, q);
    var head = d === 'up' ? 'Walk straight along the hallway. ' : 'Walk toward the ' + (d === 'left' ? 'LEFT' : 'RIGHT') + ' end of the hallway. ';
    return [{ dir: d, text: head + whereText(r) }];
  }

  /* ---------------- the route builder ---------------- */
  function sameBuilding(a, b) {
    var pos = posOf(a);
    if (a.floor === b.floor) {
      var d = dirBetween(pos, posOf(b));
      var cross = a.row !== b.row && b.row !== 'main' ? ' (it is across the hallway, on the ' + shortRow(b) + ')' : '';
      var head = d === 'up' ? 'Walk straight along the hallway' : 'Walk toward the ' + (d === 'left' ? 'LEFT' : 'RIGHT') + ' end of the hallway';
      return [{ dir: d, text: head + cross + '. ' + whereText(b) }];
    }
    var cf = changeFloor(a.bk, a.floor, pos, b.floor, true);
    return cf.steps.concat(walkTo(b, cf.pos));
  }

  function mainAdmin(a, b) {            // Bonifacio (left) and Del Pilar (right) are ONE connected building
    var out = [], fromAdmin = a.bk === 'delpilar';
    var crossF = b.floor <= maxFloor(a.bk) ? b.floor : maxFloor(a.bk);
    var cf = changeFloor(a.bk, a.floor, posOf(a), crossF, true);
    out = out.concat(cf.steps);
    var endPos = fromAdmin ? 0 : 1;
    out.push({ dir: dirBetween(cf.pos, endPos), text: 'Walk to the far ' + (fromAdmin ? 'LEFT' : 'RIGHT') + ' end of the hallway. This is where ' +
      (fromAdmin ? 'Del Pilar joins Bonifacio' : 'Bonifacio joins Del Pilar') + ' (the elevator/entrance strip).' });
    out.push({ dir: 'up', text: 'Keep walking straight. You are now inside the ' + BUILDINGS[b.bk].name + ' (' + BUILDINGS[b.bk].alias + '), still on the ' + ORD[crossF] + ' floor. You do not need to go outside.' });
    var cf2 = changeFloor(b.bk, crossF, fromAdmin ? 1 : 0, b.floor, true);
    out = out.concat(cf2.steps);
    return out.concat(walkTo(b, cf2.steps.length ? cf2.pos : (fromAdmin ? 1 : 0)));
  }

  function leaveBuilding(a) {
    var out = [], A = BUILDINGS[a.bk], pos = posOf(a);
    if (a.floor > 1) {
      var cf = changeFloor(a.bk, a.floor, pos, 1, !!a.row);
      out = out.concat(cf.steps); pos = cf.pos;
      out.push({ dir: dirBetween(pos, doorsPos(a.bk)), text: 'You are on the ground floor now. Walk to the main doors of the ' + A.name + ' and go out.' });
    } else {
      out.push({ dir: a.row ? dirBetween(pos, doorsPos(a.bk)) : 'up', text: 'Walk to the main doors of the ' + A.name + ' and go out.' });
    }
    return out;
  }

  function enterBuilding(b) {
    var out = [], B = BUILDINGS[b.bk], ePos = doorsPos(b.bk);
    out.push({ dir: 'up', text: 'Enter the ' + B.name + ' (' + B.alias + '). ' + B.doors });
    var cf = changeFloor(b.bk, 1, ePos, b.floor, true);
    out = out.concat(cf.steps);
    return out.concat(walkTo(b, b.floor > 1 ? cf.pos : ePos));
  }

  // arrow for an outside step: turn left/right when the sentence says so, otherwise straight ahead
  function outDir(t) {
    if (/\b(turn|Turn) LEFT|path on your left|on your LEFT\b(?! and)/.test(t) && !/RIGHT/.test(t.split('LEFT')[0])) return 'left';
    if (/\b(turn|Turn) RIGHT|on your RIGHT \(east\)|to the RIGHT \(east\)|to your RIGHT|path on your right/.test(t)) return 'right';
    return 'up';
  }

  function autoRoute(a, b) {
    if (!a || !b || a.key === b.key) return [];
    var na = nodeOf(a), nb = nodeOf(b);
    if (a.bk === b.bk && a.bk !== 'campus') return sameBuilding(a, b);
    if (na === 'mainadmin' && nb === 'mainadmin') return mainAdmin(a, b);
    var out = [];
    if (a.bk !== 'campus') out = out.concat(leaveBuilding(a));
    (OUT[na + '>' + nb] || ['Walk across the campus to the ' + (b.bk === 'campus' ? b.name : BUILDINGS[b.bk].name) + '.']).forEach(function (t) { out.push({ dir: outDir(t), text: t }); });
    if (b.bk !== 'campus') out = out.concat(enterBuilding(b));
    else out.push({ dir: 'arrive', text: 'You have reached ' + b.name + '.' });
    return out;
  }

  window.PLMunLayout = {
    BUILDINGS: BUILDINGS, ROOMS: ROOMS, BY_KEY: BY_KEY, ORD: ORD, OUT: OUT,
    find: find, route: autoRoute, where: whereText, nodeOf: nodeOf
  };
})();