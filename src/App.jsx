import { useState, useEffect } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const PHASES = [
  { id: 1, name: "Foundation & Fat Loss", short: "Foundation", weeks: [1,16],  color: "#3b82f6", dim: "#1e3a5f", range: "Jun–Sep 2026" },
  { id: 2, name: "Build & Specificity",   short: "Build",      weeks: [17,36], color: "#10b981", dim: "#064e3b", range: "Oct 2026–Feb 2027" },
  { id: 3, name: "Race Volume",           short: "Volume",     weeks: [37,56], color: "#f59e0b", dim: "#451a03", range: "Mar–Jul 2027" },
  { id: 4, name: "Taper & Peak",          short: "Taper",      weeks: [57,63], color: "#8b5cf6", dim: "#2e1065", range: "Aug–Sep 2027" },
];

const WEEK_SCHEDULES = {
  "1-8": [
    { id:"mon-str", day:"Mon", time:"Evening", type:"strength", icon:"🏋️", title:"Strength A — Full Body",
      sets:[
        {label:"Back Squat",          reps:"4×8",  note:"~120kg, controlled tempo"},
        {label:"Romanian Deadlift",   reps:"4×8",  note:"~100kg"},
        {label:"Bench Press",         reps:"4×8",  note:"~90kg (dial back from 110)"},
        {label:"Pull-ups",            reps:"4×8",  note:"Bodyweight or assisted"},
        {label:"Farmer Carry",        reps:"3×40m",note:"Heavy DBs"},
        {label:"Plank",               reps:"3×45s",note:""},
      ], cardio:null },
    { id:"tue-swm", day:"Tue", time:"Morning", type:"swim", icon:"🏊", title:"Swim — Technique",
      sets:[
        {label:"Warm-up",       reps:"200m",  note:"Easy freestyle"},
        {label:"Catch-up drill",reps:"6×50m", note:"30s rest between each"},
        {label:"Easy sets",     reps:"4×100m",note:"30s rest, focus on stroke"},
        {label:"Cool-down",     reps:"200m",  note:""},
      ], cardio:{label:"Total distance", unit:"m",  placeholder:"1200"} },
    { id:"wed-bik", day:"Wed", time:"Evening", type:"bike", icon:"🚴", title:"Zone 2 Bike + Core",
      sets:[
        {label:"Dead bug",  reps:"3×12", note:"Slow, controlled"},
        {label:"Bird dog",  reps:"3×12", note:"Each side"},
        {label:"Side plank",reps:"2×30s",note:"Each side"},
        {label:"Hip bridge",reps:"3×15", note:""},
      ], cardio:{label:"Ride duration", unit:"min",placeholder:"70"} },
    { id:"thu-str", day:"Thu", time:"Evening", type:"strength", icon:"🏋️", title:"Strength B — Lower & Posterior",
      sets:[
        {label:"Deadlift",              reps:"4×6",  note:"~140kg, not max effort"},
        {label:"Bulgarian Split Squat", reps:"3×10", note:"Each leg"},
        {label:"Hip Thrust",            reps:"4×10", note:"~100kg"},
        {label:"Cable Row",             reps:"3×12", note:"Heavy"},
        {label:"Lat Pulldown",          reps:"3×12", note:""},
      ], cardio:null },
    { id:"fri-run", day:"Fri", time:"Morning", type:"run", icon:"🏃", title:"Run/Walk Intervals",
      sets:[], cardio:{label:"Total duration", unit:"min",placeholder:"40", note:"2min run / 1min walk × 13 rounds"} },
    { id:"sat-bik", day:"Sat", time:"Morning", type:"bike", icon:"🚴", title:"Long Ride — Zone 2",
      sets:[], cardio:{label:"Ride duration", unit:"min",placeholder:"90"} },
    { id:"sun-rst", day:"Sun", time:"—", type:"rest", icon:"😴", title:"Rest / Active Recovery",
      sets:[], cardio:null },
  ],
  "9-16": [
    { id:"mon-str", day:"Mon", time:"Evening", type:"strength", icon:"🏋️", title:"Strength A — Full Body",
      sets:[
        {label:"Back Squat",          reps:"4×8",  note:"~130kg"},
        {label:"Romanian Deadlift",   reps:"4×8",  note:"~110kg"},
        {label:"Bench Press",         reps:"4×8",  note:"~95kg"},
        {label:"Weighted Pull-ups",   reps:"4×6",  note:"+10kg"},
        {label:"Farmer Carry",        reps:"3×50m",note:""},
        {label:"Plank",               reps:"3×60s",note:""},
      ], cardio:null },
    { id:"tue-swm", day:"Tue", time:"Morning", type:"swim", icon:"🏊", title:"Swim — Building Sets",
      sets:[
        {label:"Warm-up",   reps:"300m",  note:"Easy"},
        {label:"Main sets", reps:"8×100m",note:"20s rest, moderate effort"},
        {label:"Fast 50s",  reps:"4×50m", note:"Hard effort"},
        {label:"Cool-down", reps:"200m",  note:""},
      ], cardio:{label:"Total distance", unit:"m",  placeholder:"1500"} },
    { id:"wed-cmb", day:"Wed", time:"Evening", type:"bike", icon:"🚴", title:"Bike + StairMaster",
      sets:[], cardio:{label:"Bike + Stair total", unit:"min",placeholder:"65", note:"45min bike then 20min StairMaster"} },
    { id:"thu-str", day:"Thu", time:"Evening", type:"strength", icon:"🏋️", title:"Strength B — Lower & Posterior",
      sets:[
        {label:"Deadlift",              reps:"4×5",  note:"~150kg"},
        {label:"Bulgarian Split Squat", reps:"3×10", note:"Each leg"},
        {label:"Hip Thrust",            reps:"4×12", note:""},
        {label:"Weighted Row",          reps:"3×10", note:"Heavy"},
        {label:"Face Pull",             reps:"3×15", note:""},
        {label:"Pallof Press",          reps:"3×12", note:"Each side"},
      ], cardio:null },
    { id:"fri-run", day:"Fri", time:"Morning", type:"run", icon:"🏃", title:"Run Intervals — Building",
      sets:[], cardio:{label:"Total duration", unit:"min",placeholder:"45", note:"3min run / 1min walk, building to 5/1"} },
    { id:"sat-bik", day:"Sat", time:"Morning", type:"bike", icon:"🚴", title:"Long Ride — 2hrs",
      sets:[], cardio:{label:"Ride duration", unit:"min",placeholder:"120", note:"Practice eating on bike every 45min"} },
    { id:"sun-swm", day:"Sun", time:"Morning", type:"swim", icon:"🏊", title:"Easy OW Swim or Rest",
      sets:[], cardio:{label:"OW swim duration", unit:"min",placeholder:"25"} },
  ],
  "17-28": [
    { id:"mon-str", day:"Mon", time:"Evening", type:"strength", icon:"🏋️", title:"Strength — Upper / Pull Focus",
      sets:[
        {label:"Weighted Pull-ups",reps:"4×5",  note:"+15kg"},
        {label:"Bench Press",      reps:"4×5",  note:"~100kg, strength focus"},
        {label:"Cable Row",        reps:"3×8",  note:"Heavy"},
        {label:"OHP",              reps:"3×8",  note:""},
        {label:"Face Pull",        reps:"3×15", note:""},
      ], cardio:null },
    { id:"tue-swm", day:"Tue", time:"Morning", type:"swim", icon:"🏊", title:"Swim — Threshold Sets",
      sets:[
        {label:"Warm-up",   reps:"400m",  note:""},
        {label:"Main sets", reps:"5×200m",note:"30s rest, moderate-hard"},
        {label:"Fast 100s", reps:"4×100m",note:"Hard effort"},
        {label:"Cool-down", reps:"200m",  note:""},
      ], cardio:{label:"Total distance", unit:"m",  placeholder:"2000"} },
    { id:"wed-brk", day:"Wed", time:"Evening", type:"brick", icon:"⚡", title:"Brick: Bike → Run",
      sets:[], cardio:{label:"Bike + Run total", unit:"min",placeholder:"115", note:"90min bike then 25min run, no break"} },
    { id:"thu-str", day:"Thu", time:"Evening", type:"strength", icon:"🏋️", title:"Strength — Lower Body",
      sets:[
        {label:"Deadlift",              reps:"3×5",  note:"~155–160kg"},
        {label:"Bulgarian Split Squat", reps:"3×8",  note:"Each leg"},
        {label:"Leg Press",             reps:"3×10", note:"Heavy"},
        {label:"Nordic Curl",           reps:"3×6",  note:"Assisted if needed"},
        {label:"Hip Thrust",            reps:"3×10", note:""},
      ], cardio:null },
    { id:"fri-run", day:"Fri", time:"Morning", type:"run", icon:"🏃", title:"Run — Building to 10K",
      sets:[], cardio:{label:"Duration", unit:"min",placeholder:"60", note:"Continuous easy Zone 2 run"} },
    { id:"sat-bik", day:"Sat", time:"Morning", type:"bike", icon:"🚴", title:"Long Ride — 2.5–3hrs",
      sets:[], cardio:{label:"Distance", unit:"km", placeholder:"85",  note:"Nutrition every 40min"} },
    { id:"sun-swm", day:"Sun", time:"Morning", type:"swim", icon:"🏊", title:"OW Swim / Easy Pool",
      sets:[], cardio:{label:"Duration", unit:"min",placeholder:"40",  note:"Easy recovery swim"} },
  ],
  "29-36": [
    { id:"mon-str", day:"Mon", time:"Evening", type:"strength", icon:"🏋️", title:"Strength — Full Body Maintenance",
      sets:[
        {label:"Deadlift",         reps:"3×5",note:"~160kg"},
        {label:"Bench Press",      reps:"3×5",note:"~105kg"},
        {label:"Weighted Pull-up", reps:"3×5",note:""},
        {label:"Split Squat",      reps:"3×8",note:"Each leg"},
      ], cardio:null },
    { id:"tue-swm", day:"Tue", time:"Morning", type:"swim", icon:"🏊", title:"Swim — Race Pace",
      sets:[
        {label:"Warm-up",   reps:"500m",  note:""},
        {label:"Race pace", reps:"3×400m",note:"45s rest, goal effort"},
        {label:"Cool-down", reps:"200m",  note:""},
      ], cardio:{label:"Total distance", unit:"m",  placeholder:"2100"} },
    { id:"wed-brk", day:"Wed", time:"Evening", type:"brick", icon:"⚡", title:"Big Brick: Bike → Run",
      sets:[], cardio:{label:"Bike + Run total", unit:"min",placeholder:"155", note:"2hr bike + 35min run"} },
    { id:"thu-run", day:"Thu", time:"Morning", type:"run", icon:"🏃", title:"Midweek Run",
      sets:[], cardio:{label:"Duration", unit:"min",placeholder:"65",  note:"Full Zone 2, building half marathon"} },
    { id:"fri-rst", day:"Fri", time:"—", type:"rest", icon:"😴", title:"Rest / Light Swim",
      sets:[], cardio:null },
    { id:"sat-bik", day:"Sat", time:"Morning", type:"bike", icon:"🚴", title:"Long Ride — 3–3.5hrs",
      sets:[], cardio:{label:"Distance", unit:"km", placeholder:"105", note:"Target 100–110km"} },
    { id:"sun-run", day:"Sun", time:"Morning", type:"run", icon:"🏃", title:"Long Run",
      sets:[], cardio:{label:"Duration", unit:"min",placeholder:"85",  note:"Easy pace — heavy legs from Saturday"} },
  ],
  "37-56": [
    { id:"mon-str", day:"Mon", time:"Evening", type:"strength", icon:"🏋️", title:"Strength — 1× Weekly Only",
      sets:[
        {label:"Deadlift",         reps:"3×5",note:"~160kg, maintenance"},
        {label:"Bench Press",      reps:"3×5",note:""},
        {label:"Weighted Pull-up", reps:"3×5",note:""},
        {label:"Split Squat",      reps:"2×8",note:""},
      ], cardio:null },
    { id:"tue-swm", day:"Tue", time:"Morning", type:"swim", icon:"🏊", title:"Swim — Long Sets",
      sets:[
        {label:"Warm-up",   reps:"600m",  note:""},
        {label:"Main sets", reps:"4×500m",note:"45s rest, steady effort"},
        {label:"Cool-down", reps:"200m",  note:""},
      ], cardio:{label:"Total distance", unit:"m",  placeholder:"3000"} },
    { id:"wed-brk", day:"Wed", time:"Evening", type:"brick", icon:"⚡", title:"Big Brick Simulation",
      sets:[], cardio:{label:"Bike + Run total", unit:"min",placeholder:"205", note:"2.5–3hr bike then 40–45min run"} },
    { id:"thu-run", day:"Thu", time:"Morning", type:"run", icon:"🏃", title:"Threshold Run",
      sets:[], cardio:{label:"Duration", unit:"min",placeholder:"65",  note:"20min at Zone 3 in the middle"} },
    { id:"fri-swm", day:"Fri", time:"Morning", type:"swim", icon:"🏊", title:"OW Swim — Navigation",
      sets:[], cardio:{label:"Duration", unit:"min",placeholder:"50",  note:"Practice sighting every 10 strokes"} },
    { id:"sat-bik", day:"Sat", time:"Morning", type:"bike", icon:"🚴", title:"Long Ride — Race Distance Build",
      sets:[], cardio:{label:"Distance", unit:"km", placeholder:"140", note:"Target 130–160km by peak weeks"} },
    { id:"sun-run", day:"Sun", time:"Morning", type:"run", icon:"🏃", title:"Long Run — Race Build",
      sets:[], cardio:{label:"Duration", unit:"min",placeholder:"105", note:"Easy pace — half marathon by week 50"} },
  ],
  "57-63": [
    { id:"mon-rst", day:"Mon", time:"—",      type:"rest",     icon:"😴", title:"Full Rest — Taper Starts",   sets:[], cardio:null },
    { id:"tue-swm", day:"Tue", time:"Morning",type:"swim",     icon:"🏊", title:"Swim — Short & Sharp",
      sets:[], cardio:{label:"Total distance", unit:"m",  placeholder:"1800", note:"Feel fast, not grinding"} },
    { id:"wed-bik", day:"Wed", time:"Evening",type:"bike",     icon:"🚴", title:"Bike — Springy Legs",
      sets:[], cardio:{label:"Duration", unit:"min",placeholder:"70", note:"2–3 race pace efforts inside easy ride"} },
    { id:"thu-run", day:"Thu", time:"Morning",type:"run",      icon:"🏃", title:"Easy Run — Stay Loose",
      sets:[], cardio:{label:"Duration", unit:"min",placeholder:"40", note:"Nothing more. The hay is in the barn."} },
    { id:"fri-swm", day:"Fri", time:"Morning",type:"swim",     icon:"🏊", title:"OW Shake-Out",
      sets:[], cardio:{label:"Duration", unit:"min",placeholder:"30", note:"Visualise the race."} },
    { id:"sat-brk", day:"Sat", time:"Morning",type:"brick",    icon:"⚡", title:"Race Simulation Brick",
      sets:[], cardio:{label:"Bike + Run total", unit:"min",placeholder:"80", note:"60min bike + 20min run. Full kit."} },
    { id:"sun-rst", day:"Sun", time:"—",      type:"rest",     icon:"😴", title:"Rest — One Week to Race",    sets:[], cardio:null },
  ],
};

const TYPE_STYLE = {
  strength:{ bg:"#1e3a5f", border:"#2563eb", text:"#93c5fd" },
  swim:    { bg:"#164e63", border:"#0891b2", text:"#67e8f9" },
  bike:    { bg:"#14532d", border:"#16a34a", text:"#86efac" },
  run:     { bg:"#431407", border:"#ea580c", text:"#fb923c" },
  brick:   { bg:"#1a1a2e", border:"#7c3aed", text:"#c084fc" },
  rest:    { bg:"#1c1917", border:"#57534e", text:"#a8a29e" },
};

const MILESTONES = [
  {week:4,  label:"Swim 800m continuous",           phase:1},
  {week:8,  label:"Run 20 min no walk breaks",       phase:1},
  {week:12, label:"Ride 60km",                       phase:1},
  {week:16, label:"Lost 8–12kg · Phase 1 complete",  phase:1},
  {week:20, label:"Run 10K non-stop",                phase:2},
  {week:24, label:"Swim 1500m",                      phase:2},
  {week:28, label:"Ride 90km",                       phase:2},
  {week:36, label:"Half marathon · Phase 2 done",    phase:2},
  {week:44, label:"Swim 3km open water",             phase:3},
  {week:52, label:"Ride 160km",                      phase:3},
  {week:56, label:"Run 2 hours · Phase 3 done",      phase:3},
  {week:63, label:"🏁 RACE DAY — Ironman Emilia-Romagna", phase:4},
];

const GEAR = [
  {
    icon:"⌚", urgent:true, color:"#3b82f6",
    when:"Week 10–12 · August 2026",
    item:"Garmin Forerunner 955 or Fenix 7",
    cost:"€450–700",
    why:"Get it during Phase 1 so you train with real HR zones from day one. Zone 2 training without accurate HR is guesswork. The Forerunner 955 has swim/bike/run triathlon mode, open water GPS and race prediction built in.",
    note:"Don't wait until Phase 2. The data from the first 3 months shapes all your training zones.",
  },
  {
    icon:"🚴", urgent:false, color:"#10b981",
    when:"Week 17–20 · October–November 2026",
    item:"Gravel Bike (recommended over road)",
    cost:"€800–2500",
    why:"Use the mountain bike all through Phase 1 — it's fine for Zone 2 base building and you're still losing weight (fit changes as you drop 10kg). Go gravel over road: more comfortable for 4–5hr rides, handles coastal roads and mixed terrain. Ironman Emilia-Romagna is relatively flat so you won't be disadvantaged.",
    note:"Get a professional bike fit at the shop. At Ironman distances a bad position destroys your back and wrecks the run. Canyon Gravel AL or Trek Checkpoint AL for value; Specialized Crux or Cannondale Topstone Carbon if budget allows.",
  },
];

// ─── STORAGE (localStorage) ──────────────────────────────────────────────────

const LS = {
  get: (key) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
};

function sessionKey(week, id) { return `im_w${week}_${id}`; }

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function getPhase(w) { return PHASES.find(p => w >= p.weeks[0] && w <= p.weeks[1]) || PHASES[0]; }
function getSchedKey(w) {
  if(w<=8)  return "1-8";
  if(w<=16) return "9-16";
  if(w<=28) return "17-28";
  if(w<=36) return "29-36";
  if(w<=56) return "37-56";
  return "57-63";
}

// ─── TRAVEL DATA ─────────────────────────────────────────────────────────────

const DRIVER_STRETCHES = [
  { name:"Neck rolls", duration:"2 min", desc:"Slowly roll head in full circles, 5 each direction. Releases the tension from fixed driving position.", icon:"🔄" },
  { name:"Thoracic rotation", duration:"2 min", desc:"Seated or standing: hands behind head, rotate upper body left and right as far as comfortable. 10 each side.", icon:"🌀" },
  { name:"Hip flexor stretch", duration:"3 min", desc:"Lunge position, push hips forward gently. Hold 45s each side × 2. Critical after hours of sitting — hip flexors shorten fast.", icon:"🦵" },
  { name:"Pigeon pose", duration:"3 min", desc:"On floor or back seat: cross one ankle over opposite knee, pull toward chest. 60s each side. Best glute/hip stretch you can do without equipment.", icon:"🧘" },
  { name:"Doorframe chest stretch", duration:"2 min", desc:"Find a doorframe or corner wall: arms at 90°, lean forward gently. Counteracts the hunched driving posture. 3 × 30s.", icon:"🚪" },
  { name:"World's greatest stretch", duration:"3 min", desc:"Step into lunge, place same-side hand on floor, rotate opposite arm to sky. Hold 5s, repeat 5 each side. Full body mobility in one move.", icon:"🌍" },
  { name:"Standing forward fold", duration:"2 min", desc:"Feet hip-width, fold forward, let head and arms hang heavy. Bend knees slightly. Decompresses the spine after long sitting. Hold 60s.", icon:"⬇️" },
  { name:"Calf raises", duration:"2 min", desc:"3 × 20 slow calf raises on a step or kerb. Activates the lower legs and improves circulation — important on long drive days (DVT prevention).", icon:"👟" },
];

const NO_EQUIPMENT_WORKOUTS = {
  strength: {
    label:"Bodyweight Strength",
    icon:"💪",
    color:"#2563eb",
    duration:"35–45 min",
    note:"Hotel room, car park, park — anywhere with floor space. Maintains your strength base without a gym.",
    sets:[
      {label:"Pike push-ups",        reps:"4×12",  note:"Shoulders — replaces OHP"},
      {label:"Bulgarian split squat",reps:"4×10",  note:"Each leg, use bed/chair for rear foot"},
      {label:"Decline push-ups",     reps:"3×15",  note:"Feet on bed — upper chest"},
      {label:"Single-leg deadlift",  reps:"3×12",  note:"Each leg, hinge at hip, feel the hamstring"},
      {label:"Pull-ups (find a bar)",reps:"4×max", note:"Playground, door frame bar — or inverted rows under table"},
      {label:"Glute bridge hold",    reps:"3×45s", note:"Weighted with backpack if available"},
      {label:"Plank to downward dog",reps:"3×12",  note:"Flows between plank and pike, full core"},
    ]
  },
  run: {
    label:"Easy Road Run",
    icon:"🏃",
    color:"#ea580c",
    duration:"30–50 min",
    note:"Any road, path or treadmill. Travelling is no excuse to skip running — it's the easiest session to do anywhere.",
    sets:[]
  },
  swim: {
    label:"Hotel Pool / Beach Swim",
    icon:"🏊",
    color:"#0891b2",
    duration:"30–40 min",
    note:"Most hotels have a pool. Even 20 laps in a small pool beats nothing. Open water if you're near the coast.",
    sets:[
      {label:"Easy laps",       reps:"10 min",  note:"Warm up, any stroke"},
      {label:"Catch-up drill",  reps:"6×1 lap", note:"Focus on reach and pull"},
      {label:"Continuous swim", reps:"20 min",  note:"Easy pace, count strokes per length"},
    ]
  },
  mobility: {
    label:"Full Mobility Flow",
    icon:"🧘",
    color:"#7c3aed",
    duration:"25–30 min",
    note:"Perfect after a long drive. Combines all the driver stretches into a full flow. Do this every travel day minimum.",
    sets:DRIVER_STRETCHES.map(s=>({label:s.name, reps:s.duration, note:s.desc}))
  }
};

// ─── TODAY ────────────────────────────────────────────────────────────────────

function TodayView({ currentWeek, setCurrentWeek, onPR }) {
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const todayName = dayNames[new Date().getDay()];
  const phase = getPhase(currentWeek);
  const schedule = WEEK_SCHEDULES[getSchedKey(currentWeek)];
  const ts = schedule.find(s => s.day === todayName);
  const skey = ts ? sessionKey(currentWeek, ts.id) : null;
  const travelKey = `im_travel_${currentWeek}_${todayName}`;

  const [cardioVal, setCardioVal] = useState("");
  const [setLogs, setSetLogs]     = useState({});
  const [done, setDone]           = useState(false);
  const [notes, setNotes]         = useState("");
  const [saved, setSaved]         = useState(false);

  // Travel mode state
  const [mode, setMode]                   = useState("normal"); // "normal"|"travel"
  const [travelMode, setTravelMode]       = useState(null);    // null|"postpone"|"alternative"|"custom"
  const [altType, setAltType]             = useState("mobility");
  const [altSetDone, setAltSetDone]       = useState({});
  const [altCardio, setAltCardio]         = useState("");
  const [customExercises, setCustomExercises] = useState([]);
  const [newExName, setNewExName]         = useState("");
  const [newExReps, setNewExReps]         = useState("");
  const [newExKg, setNewExKg]             = useState("");
  const [postponedTo, setPostponedTo]     = useState("");
  const [travelSaved, setTravelSaved]     = useState(false);

  useEffect(() => {
    if(skey) {
      const data = LS.get(skey);
      if(data) { setCardioVal(data.cardioVal||""); setSetLogs(data.setLogs||{}); setDone(data.done||false); setNotes(data.notes||""); }
      else { setCardioVal(""); setSetLogs({}); setDone(false); setNotes(""); }
    }
    const tv = LS.get(travelKey);
    if(tv) { setMode("travel"); setTravelMode(tv.travelMode||null); setPostponedTo(tv.postponedTo||""); setAltType(tv.altType||"mobility"); setCustomExercises(tv.customExercises||[]); }
    else { setMode("normal"); setTravelMode(null); }
  }, [skey, travelKey]);

  const save = () => {
    if(!skey) return;
    // PR detection — compare each logged kg against all previous logs for that exercise
    if(ts && ts.sets && onPR) {
      ts.sets.forEach((s,i) => {
        const kg = parseFloat(setLogs[`${i}_kg`]);
        if(!kg) return;
        // scan all other weeks for same exercise
        let prevMax = 0;
        for(let w=1; w<=63; w++) {
          if(w===currentWeek) continue;
          const sc = WEEK_SCHEDULES[w<=8?"1-8":w<=16?"9-16":w<=28?"17-28":w<=36?"29-36":w<=56?"37-56":"57-63"];
          sc.forEach(sess => {
            const d = LS.get(sessionKey(w,sess.id));
            if(!d||!d.setLogs) return;
            sess.sets.forEach((set,j) => {
              if(set.label===s.label) { const v=parseFloat(d.setLogs[`${j}_kg`]); if(v>prevMax) prevMax=v; }
            });
          });
        }
        if(kg > prevMax && prevMax > 0) onPR(s.label, kg);
      });
    }
    LS.set(skey, { cardioVal, setLogs, done:true, notes, savedAt: new Date().toISOString() });
    setDone(true); setSaved(true);
    setTimeout(()=>setSaved(false), 2000);
  };

  const saveTravelMode = (tm, extra={}) => {
    LS.set(travelKey, { travelMode:tm, altType, postponedTo, customExercises, ...extra, savedAt: new Date().toISOString() });
    setTravelSaved(true);
    setTimeout(()=>setTravelSaved(false), 2000);
  };

  const enterTravel = () => { setMode("travel"); setTravelMode(null); };
  const exitTravel  = () => { setMode("normal"); LS.set(travelKey, null); };

  const addCustomExercise = () => {
    if(!newExName) return;
    const ex = { name:newExName, reps:newExReps, kg:newExKg, id:Date.now() };
    const updated = [...customExercises, ex];
    setCustomExercises(updated);
    setNewExName(""); setNewExReps(""); setNewExKg("");
    saveTravelMode("custom", { customExercises: updated });
  };

  const removeCustomEx = (id) => {
    const updated = customExercises.filter(e=>e.id!==id);
    setCustomExercises(updated);
    saveTravelMode("custom", { customExercises: updated });
  };

  const style = ts ? (TYPE_STYLE[ts.type]||TYPE_STYLE.rest) : TYPE_STYLE.rest;
  const today = new Date();
  const altWorkout = NO_EQUIPMENT_WORKOUTS[altType];

  return (
    <div style={{paddingBottom:90}}>
      {/* Header */}
      <div style={{background:`linear-gradient(135deg,#0f172a,${phase.dim})`,padding:"20px 16px 14px",borderBottom:"1px solid #1e293b"}}>
        <div style={{fontSize:11,color:phase.color,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Week {currentWeek} of 63</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:22,fontWeight:800,letterSpacing:-0.5}}>
              {today.toLocaleDateString("en",{weekday:"long", day:"numeric", month:"short"})}
            </div>
            <div style={{fontSize:13,color:"#64748b",marginTop:2}}>{phase.name}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setCurrentWeek(w=>Math.max(1,w-1))} style={{background:"#1e293b",border:"none",color:"#94a3b8",borderRadius:8,width:34,height:34,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
              <button onClick={()=>setCurrentWeek(w=>Math.min(63,w+1))} style={{background:"#1e293b",border:"none",color:"#94a3b8",borderRadius:8,width:34,height:34,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
            </div>
            <span style={{fontSize:10,color:"#334155"}}>change week</span>
          </div>
        </div>
        {/* Phase bar */}
        <div style={{marginTop:12}}>
          <div style={{background:"#1e293b",borderRadius:4,height:5,overflow:"hidden"}}>
            <div style={{background:phase.color,height:"100%",borderRadius:4,width:`${Math.min(100,((currentWeek-phase.weeks[0])/(phase.weeks[1]-phase.weeks[0]))*100)}%`,transition:"width 0.4s"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#334155",marginTop:3}}>
            <span>Week {phase.weeks[0]}</span><span>{phase.range}</span><span>Week {phase.weeks[1]}</span>
          </div>
        </div>
      </div>

      <div style={{padding:"14px 16px"}}>

        {/* ── TRAVEL MODE BANNER / TOGGLE ── */}
        {mode === "normal" && ts && ts.type !== "rest" && (
          <button onClick={enterTravel} style={{width:"100%",background:"rgba(217,119,6,0.1)",border:"1px solid #92400e",borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10,cursor:"pointer",textAlign:"left"}}>
            <span style={{fontSize:20}}>🚗</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color:"#fcd34d"}}>Travelling today?</div>
              <div style={{fontSize:11,color:"#92400e",marginTop:1}}>Postpone, find an alternative, or log a custom workout</div>
            </div>
            <span style={{color:"#92400e",fontSize:12}}>→</span>
          </button>
        )}

        {mode === "travel" && (
          <div style={{background:"rgba(217,119,6,0.08)",border:"1px solid #92400e",borderRadius:14,padding:16,marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:22}}>🚗</span>
                <div>
                  <div style={{fontWeight:700,fontSize:15,color:"#fcd34d"}}>Travel Day</div>
                  <div style={{fontSize:11,color:"#92400e"}}>{ts ? `Scheduled: ${ts.title}` : "Rest day"}</div>
                </div>
              </div>
              <button onClick={exitTravel} style={{background:"none",border:"1px solid #44403c",borderRadius:8,padding:"4px 10px",color:"#78716c",fontSize:11,cursor:"pointer"}}>✕ Cancel</button>
            </div>

            {/* Three options */}
            {!travelMode && (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div style={{fontSize:11,color:"#78716c",marginBottom:2}}>What do you want to do?</div>
                {[
                  {id:"postpone",    icon:"📅", label:"Postpone workout",      sub:"Move it to another day this week"},
                  {id:"alternative", icon:"🏨", label:"No-equipment alternative", sub:"Bodyweight, run, swim, or full mobility"},
                  {id:"custom",      icon:"✏️",  label:"Log my own workout",    sub:"You made something up — record it"},
                ].map(opt => (
                  <button key={opt.id} onClick={()=>setTravelMode(opt.id)}
                    style={{background:"rgba(255,255,255,0.04)",border:"1px solid #292524",borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",textAlign:"left",width:"100%"}}>
                    <span style={{fontSize:22}}>{opt.icon}</span>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:"#e2e8f0"}}>{opt.label}</div>
                      <div style={{fontSize:11,color:"#64748b",marginTop:1}}>{opt.sub}</div>
                    </div>
                    <span style={{marginLeft:"auto",color:"#475569"}}>›</span>
                  </button>
                ))}
              </div>
            )}

            {/* ── POSTPONE ── */}
            {travelMode === "postpone" && (
              <div>
                <button onClick={()=>setTravelMode(null)} style={{background:"none",border:"none",color:"#64748b",fontSize:12,cursor:"pointer",padding:"0 0 10px",display:"flex",alignItems:"center",gap:4}}>‹ Back</button>
                <div style={{fontSize:14,fontWeight:700,color:"#e2e8f0",marginBottom:10}}>📅 Postpone to which day?</div>
                <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
                  {[
                    {short:"Mon",full:"Monday"},{short:"Tue",full:"Tuesday"},{short:"Wed",full:"Wednesday"},
                    {short:"Thu",full:"Thursday"},{short:"Fri",full:"Friday"},{short:"Sat",full:"Saturday"},{short:"Sun",full:"Sunday"}
                  ].filter(d=>d.short!==todayName).map(d=>(
                    <button key={d.short} onClick={()=>setPostponedTo(d.short)}
                      style={{background:postponedTo===d.short?"rgba(37,99,235,0.2)":"rgba(255,255,255,0.03)",border:`1px solid ${postponedTo===d.short?"#2563eb":"#1e293b"}`,borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
                      <span style={{fontSize:13,fontWeight:500,color:"#e2e8f0"}}>{d.full}</span>
                      {postponedTo===d.short && <span style={{color:"#3b82f6",fontSize:12,fontWeight:700}}>✓ Selected</span>}
                    </button>
                  ))}
                </div>
                {postponedTo && (
                  <button onClick={()=>saveTravelMode("postpone")}
                    style={{width:"100%",background:"#1d4ed8",border:"none",borderRadius:10,padding:"13px",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>
                    {travelSaved ? "✓ Saved!" : `Postpone to ${postponedTo}`}
                  </button>
                )}
                {postponedTo && <div style={{fontSize:11,color:"#475569",textAlign:"center",marginTop:8}}>The workout moves to {postponedTo} — remember to log it then in the Today tab.</div>}
              </div>
            )}

            {/* ── ALTERNATIVE ── */}
            {travelMode === "alternative" && (
              <div>
                <button onClick={()=>setTravelMode(null)} style={{background:"none",border:"none",color:"#64748b",fontSize:12,cursor:"pointer",padding:"0 0 10px",display:"flex",alignItems:"center",gap:4}}>‹ Back</button>
                <div style={{fontSize:14,fontWeight:700,color:"#e2e8f0",marginBottom:10}}>🏨 Choose alternative</div>

                {/* Type picker */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:14}}>
                  {[
                    {id:"mobility", icon:"🧘", label:"Driver stretches"},
                    {id:"strength", icon:"💪", label:"Bodyweight strength"},
                    {id:"run",      icon:"🏃", label:"Road run"},
                    {id:"swim",     icon:"🏊", label:"Hotel pool / sea"},
                  ].map(t=>(
                    <button key={t.id} onClick={()=>setAltType(t.id)}
                      style={{background:altType===t.id?NO_EQUIPMENT_WORKOUTS[t.id].color+"30":"rgba(255,255,255,0.03)",border:`1px solid ${altType===t.id?NO_EQUIPMENT_WORKOUTS[t.id].color:"#1e293b"}`,borderRadius:10,padding:"10px 10px",cursor:"pointer",textAlign:"left"}}>
                      <div style={{fontSize:18,marginBottom:4}}>{t.icon}</div>
                      <div style={{fontSize:12,fontWeight:600,color:"#e2e8f0"}}>{t.label}</div>
                    </button>
                  ))}
                </div>

                {/* Workout detail */}
                <div style={{background:"rgba(0,0,0,0.3)",borderRadius:12,padding:14,marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:14,color:"#e2e8f0"}}>{altWorkout.icon} {altWorkout.label}</div>
                      <div style={{fontSize:11,color:"#64748b",marginTop:2}}>⏱ {altWorkout.duration}</div>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:"#94a3b8",marginBottom:10,lineHeight:1.5}}>{altWorkout.note}</div>

                  {altWorkout.sets.length > 0 && (
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {altWorkout.sets.map((s,i)=>(
                        <div key={i} onClick={()=>setAltSetDone(p=>({...p,[i]:!p[i]}))}
                          style={{background:altSetDone[i]?"rgba(16,185,129,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${altSetDone[i]?"#059669":"#1e293b"}`,borderRadius:9,padding:"9px 12px",cursor:"pointer",display:"flex",alignItems:"flex-start",gap:10}}>
                          <div style={{width:20,height:20,borderRadius:"50%",background:altSetDone[i]?"#059669":"transparent",border:`2px solid ${altSetDone[i]?"#10b981":"#334155"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",flexShrink:0,marginTop:1}}>
                            {altSetDone[i]?"✓":""}
                          </div>
                          <div style={{flex:1}}>
                            <div style={{display:"flex",justifyContent:"space-between"}}>
                              <span style={{fontSize:13,fontWeight:600,color:altSetDone[i]?"#86efac":"#e2e8f0"}}>{s.label}</span>
                              <span style={{fontSize:12,color:"#64748b"}}>{s.reps}</span>
                            </div>
                            <div style={{fontSize:11,color:"#475569",marginTop:2,lineHeight:1.4}}>{s.note}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(altType === "run" || altType === "swim") && (
                    <div style={{marginTop:10,display:"flex",alignItems:"center",gap:8}}>
                      <input type="number" inputMode="decimal" placeholder="0"
                        value={altCardio} onChange={e=>setAltCardio(e.target.value)}
                        style={{flex:1,background:"rgba(255,255,255,0.08)",border:`1px solid ${altWorkout.color}`,borderRadius:8,padding:"10px",color:"#e2e8f0",fontSize:20,fontWeight:800,textAlign:"center"}}
                      />
                      <div style={{color:altWorkout.color,fontWeight:700}}>{altType==="run"?"min":"min"}</div>
                    </div>
                  )}
                </div>

                <button onClick={()=>saveTravelMode("alternative",{altType,altSetDone,altCardio})}
                  style={{width:"100%",background:travelSaved?"#14532d":"linear-gradient(135deg,#7c3aed,#4f46e5)",border:travelSaved?"1px solid #16a34a":"none",borderRadius:10,padding:"13px",color:travelSaved?"#86efac":"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>
                  {travelSaved ? "✓ Logged!" : "Log Alternative Workout ✓"}
                </button>
              </div>
            )}

            {/* ── CUSTOM ── */}
            {travelMode === "custom" && (
              <div>
                <button onClick={()=>setTravelMode(null)} style={{background:"none",border:"none",color:"#64748b",fontSize:12,cursor:"pointer",padding:"0 0 10px",display:"flex",alignItems:"center",gap:4}}>‹ Back</button>
                <div style={{fontSize:14,fontWeight:700,color:"#e2e8f0",marginBottom:4}}>✏️ Log your own workout</div>
                <div style={{fontSize:12,color:"#64748b",marginBottom:12}}>Add whatever you did — exercises, sets, reps, weight.</div>

                {/* Add exercise form */}
                <div style={{background:"rgba(0,0,0,0.3)",borderRadius:12,padding:12,marginBottom:12}}>
                  <div style={{fontSize:11,color:"#64748b",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Add exercise</div>
                  <input type="text" placeholder="Exercise name (e.g. Push-ups)"
                    value={newExName} onChange={e=>setNewExName(e.target.value)}
                    style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid #334155",borderRadius:8,padding:"9px 12px",color:"#e2e8f0",fontSize:13,marginBottom:8,boxSizing:"border-box",fontFamily:"inherit"}}
                  />
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:6}}>
                    <input type="text" placeholder="Sets × reps"
                      value={newExReps} onChange={e=>setNewExReps(e.target.value)}
                      style={{background:"rgba(255,255,255,0.06)",border:"1px solid #334155",borderRadius:8,padding:"9px 10px",color:"#e2e8f0",fontSize:13,fontFamily:"inherit"}}
                    />
                    <input type="number" inputMode="decimal" placeholder="kg (opt)"
                      value={newExKg} onChange={e=>setNewExKg(e.target.value)}
                      style={{background:"rgba(255,255,255,0.06)",border:"1px solid #334155",borderRadius:8,padding:"9px 10px",color:"#e2e8f0",fontSize:13,fontFamily:"inherit"}}
                    />
                    <button onClick={addCustomExercise}
                      style={{background:"#7c3aed",border:"none",borderRadius:8,padding:"9px 14px",color:"#fff",fontWeight:700,fontSize:16,cursor:"pointer"}}>+</button>
                  </div>
                </div>

                {/* Exercise list */}
                {customExercises.length > 0 && (
                  <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
                    {customExercises.map((ex,i)=>(
                      <div key={ex.id} style={{background:"rgba(124,58,237,0.1)",border:"1px solid #4c1d95",borderRadius:10,padding:"10px 12px",display:"flex",alignItems:"center",gap:10}}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:600}}>{ex.name}</div>
                          <div style={{fontSize:11,color:"#7c3aed",marginTop:1}}>
                            {ex.reps}{ex.kg?` · ${ex.kg}kg`:""}
                          </div>
                        </div>
                        <button onClick={()=>removeCustomEx(ex.id)}
                          style={{background:"none",border:"none",color:"#4c1d95",fontSize:16,cursor:"pointer",padding:"2px 6px"}}>✕</button>
                      </div>
                    ))}
                  </div>
                )}

                {customExercises.length > 0 && (
                  <button onClick={()=>saveTravelMode("custom",{customExercises})}
                    style={{width:"100%",background:travelSaved?"#14532d":"linear-gradient(135deg,#7c3aed,#4f46e5)",border:travelSaved?"1px solid #16a34a":"none",borderRadius:10,padding:"13px",color:travelSaved?"#86efac":"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>
                    {travelSaved ? "✓ Saved!" : "Save Custom Workout ✓"}
                  </button>
                )}
                {customExercises.length === 0 && (
                  <div style={{textAlign:"center",padding:"20px 0",color:"#334155",fontSize:13}}>Add your first exercise above ↑</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── NORMAL SCHEDULED SESSION ── */}
        {mode === "normal" && (
          !ts ? (
          <div style={{background:"#1c1917",border:"1px solid #292524",borderRadius:14,padding:28,textAlign:"center"}}>
            <div style={{fontSize:44,marginBottom:12}}>😴</div>
            <div style={{fontWeight:700,fontSize:17,marginBottom:6}}>Rest Day</div>
            <div style={{color:"#78716c",fontSize:13,lineHeight:1.6}}>No session today. Sleep, eat well, recover.<br/>The body grows on rest days.</div>
          </div>
        ) : (
          <>
            <div style={{background:style.bg,border:`1px solid ${style.border}`,borderRadius:14,padding:16,marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <span style={{fontSize:30}}>{ts.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:16}}>{ts.title}</div>
                  <div style={{fontSize:12,color:style.text,marginTop:1}}>{ts.time} · {ts.type}</div>
                </div>
                {done && <div style={{background:"#14532d",border:"1px solid #16a34a",borderRadius:20,padding:"4px 12px",fontSize:12,color:"#86efac",fontWeight:700}}>✓ Done</div>}
              </div>

              {/* Sets */}
              {ts.sets.length > 0 && (
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:10,color:style.text,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>Sets & Weights</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {ts.sets.map((s,i) => (
                      <div key={i} style={{background:"rgba(0,0,0,0.3)",borderRadius:10,padding:"10px 12px",display:"flex",alignItems:"center",gap:8}}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:600}}>{s.label}</div>
                          <div style={{fontSize:11,color:"#475569",marginTop:1}}>{s.reps}{s.note?` · ${s.note}`:""}</div>
                        </div>
                        <input
                          type="number" inputMode="decimal"
                          placeholder="kg"
                          value={setLogs[`${i}_kg`]||""}
                          onChange={e=>setSetLogs(p=>({...p,[`${i}_kg`]:e.target.value}))}
                          style={{width:54,background:"rgba(255,255,255,0.1)",border:`1px solid ${style.border}80`,borderRadius:7,padding:"6px 4px",color:"#e2e8f0",fontSize:14,fontWeight:700,textAlign:"center"}}
                        />
                        <button
                          onClick={()=>setSetLogs(p=>({...p,[`${i}_done`]:!p[`${i}_done`]}))}
                          style={{background:setLogs[`${i}_done`]?"#14532d":"rgba(255,255,255,0.06)",border:`1px solid ${setLogs[`${i}_done`]?"#16a34a":style.border+"50"}`,borderRadius:7,padding:"6px 10px",color:setLogs[`${i}_done`]?"#86efac":style.text,fontSize:11,cursor:"pointer",fontWeight:600,whiteSpace:"nowrap"}}
                        >{setLogs[`${i}_done`]?"✓":"Done"}</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cardio */}
              {ts.cardio && (
                <div style={{background:"rgba(0,0,0,0.3)",borderRadius:10,padding:12}}>
                  <div style={{fontSize:10,color:style.text,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>Cardio / Endurance</div>
                  {ts.cardio.note && <div style={{fontSize:12,color:"#64748b",marginBottom:8}}>{ts.cardio.note}</div>}
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <input
                      type="number" inputMode="decimal"
                      placeholder={ts.cardio.placeholder}
                      value={cardioVal}
                      onChange={e=>setCardioVal(e.target.value)}
                      style={{flex:1,background:"rgba(255,255,255,0.08)",border:`1px solid ${style.border}`,borderRadius:9,padding:"12px",color:"#e2e8f0",fontSize:22,fontWeight:800,textAlign:"center"}}
                    />
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:16,color:style.text,fontWeight:700}}>{ts.cardio.unit}</div>
                      <div style={{fontSize:10,color:"#475569",marginTop:2}}>{ts.cardio.label}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <textarea
              value={notes}
              onChange={e=>setNotes(e.target.value)}
              placeholder="Session notes — how did it go? PRs, how body felt, any pain..."
              style={{width:"100%",background:"rgba(255,255,255,0.03)",border:"1px solid #1e293b",borderRadius:10,padding:"10px 12px",color:"#e2e8f0",fontSize:13,resize:"none",height:72,marginBottom:12,fontFamily:"inherit",boxSizing:"border-box"}}
            />

            <button onClick={save} style={{width:"100%",background:saved?"#14532d":done?"#1e3a5f":"linear-gradient(135deg,#7c3aed,#4f46e5)",border:saved?"1px solid #16a34a":done?"1px solid #2563eb":"none",borderRadius:12,padding:"15px",color:saved?"#86efac":"#fff",fontSize:16,fontWeight:700,cursor:"pointer",transition:"all 0.2s",letterSpacing:0.3}}>
              {saved ? "✓ Saved!" : done ? "Update Log" : "Mark Workout Complete ✓"}
            </button>
          </>
        ))}
      </div>
    </div>
  );
}

// ─── WEEK ─────────────────────────────────────────────────────────────────────

function WeekView({ currentWeek, setCurrentWeek }) {
  const phase = getPhase(currentWeek);
  const schedule = WEEK_SCHEDULES[getSchedKey(currentWeek)];
  const [expanded, setExpanded] = useState(null);
  const [completed, setCompleted] = useState({});

  useEffect(() => {
    const map = {};
    schedule.forEach(s => {
      const d = LS.get(sessionKey(currentWeek, s.id));
      map[s.id] = d?.done || false;
    });
    setCompleted(map);
    setExpanded(null);
  }, [currentWeek]);

  const nonRest = schedule.filter(s=>s.type!=="rest");
  const doneCount = nonRest.filter(s=>completed[s.id]).length;

  return (
    <div style={{paddingBottom:90}}>
      <div style={{background:`linear-gradient(135deg,#0f172a,${phase.dim})`,padding:"20px 16px 14px",borderBottom:"1px solid #1e293b"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:11,color:phase.color,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Phase {phase.id} · {phase.range}</div>
            <div style={{fontSize:24,fontWeight:800}}>Week {currentWeek}</div>
          </div>
          <div style={{display:"flex",gap:6,marginTop:4}}>
            <button onClick={()=>setCurrentWeek(w=>Math.max(1,w-1))} style={{background:"#1e293b",border:"none",color:"#94a3b8",borderRadius:8,width:36,height:36,cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
            <button onClick={()=>setCurrentWeek(w=>Math.min(63,w+1))} style={{background:"#1e293b",border:"none",color:"#94a3b8",borderRadius:8,width:36,height:36,cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
          </div>
        </div>
        <div style={{marginTop:12,background:"rgba(0,0,0,0.3)",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:13,color:"#94a3b8"}}>{doneCount}/{nonRest.length} sessions completed</span>
          <div style={{display:"flex",gap:4}}>
            {nonRest.map(s=>(
              <div key={s.id} style={{width:10,height:10,borderRadius:"50%",background:completed[s.id]?phase.color:"#1e293b",border:`1px solid ${completed[s.id]?phase.color:"#334155"}`}}/>
            ))}
          </div>
        </div>
      </div>

      <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:8}}>
        {schedule.map((s,i) => {
          const st = TYPE_STYLE[s.type]||TYPE_STYLE.rest;
          const isOpen = expanded===i;
          const isDone = completed[s.id];
          return (
            <div key={i} onClick={()=>setExpanded(isOpen?null:i)}
              style={{background:isOpen?st.bg:"rgba(255,255,255,0.03)",border:`1px solid ${isOpen?st.border:"#1e293b"}`,borderRadius:12,padding:"12px 14px",cursor:"pointer",transition:"all 0.2s"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:22,width:30,textAlign:"center"}}>{s.icon}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                    <span style={{fontWeight:700,fontSize:14}}>{s.day}</span>
                    <span style={{fontSize:11,color:"#475569"}}>{s.time}</span>
                    {isDone && <span style={{background:"#14532d",border:"1px solid #16a34a",borderRadius:20,padding:"1px 7px",fontSize:10,color:"#86efac",fontWeight:600}}>✓</span>}
                  </div>
                  <div style={{fontSize:13,color:"#cbd5e1",marginTop:2}}>{s.title}</div>
                </div>
                <span style={{color:"#334155",fontSize:12}}>{isOpen?"▲":"▼"}</span>
              </div>
              {isOpen && (
                <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${st.border}40`}}>
                  {s.sets.map((set,j)=>(
                    <div key={j} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:600}}>{set.label}</div>
                        {set.note && <div style={{fontSize:11,color:"#64748b"}}>{set.note}</div>}
                      </div>
                      <div style={{fontSize:13,color:st.text,fontWeight:700}}>{set.reps}</div>
                    </div>
                  ))}
                  {s.cardio && (
                    <div style={{marginTop:s.sets.length>0?10:0,background:"rgba(0,0,0,0.3)",borderRadius:8,padding:"8px 10px",fontSize:13,color:st.text}}>
                      📊 {s.cardio.label} · target {s.cardio.placeholder}{s.cardio.unit}
                      {s.cardio.note && <div style={{fontSize:11,color:"#64748b",marginTop:3}}>{s.cardio.note}</div>}
                    </div>
                  )}
                  <div style={{marginTop:10,fontSize:12,color:"#475569",textAlign:"center"}}>Log this session in the Today tab</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PROGRESS ─────────────────────────────────────────────────────────────────

function ProgressView({ currentWeek, StreakBadge: SB, StrengthGraphs: SG, RecoveryTracker: RT, RaceCountdown: RC }) {
  const [bwHistory, setBwHistory]         = useState(() => LS.get("im_bw_history") || []);
  const [milestones, setMilestones]       = useState(() => LS.get("im_milestones") || {});
  const [newBw, setNewBw]                 = useState("");

  const logWeight = () => {
    if(!newBw || isNaN(parseFloat(newBw))) return;
    const entry = { week:currentWeek, kg:parseFloat(newBw), date:new Date().toLocaleDateString("en",{day:"numeric",month:"short"}) };
    const updated = [...bwHistory, entry].slice(-40);
    setBwHistory(updated);
    LS.set("im_bw_history", updated);
    setNewBw("");
  };

  const toggleMilestone = (i) => {
    if(currentWeek < MILESTONES[i].week) return;
    const updated = {...milestones, [i]: !milestones[i]};
    setMilestones(updated);
    LS.set("im_milestones", updated);
  };

  const latest = bwHistory[bwHistory.length-1];
  const first  = bwHistory[0];
  const lost   = first && latest ? (first.kg - latest.kg) : null;

  return (
    <div style={{paddingBottom:90}}>
      <div style={{background:"linear-gradient(135deg,#0f172a,#1e1b4b)",padding:"20px 16px 14px",borderBottom:"1px solid #1e293b"}}>
        <div style={{fontSize:11,color:"#8b5cf6",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Progress</div>
        <div style={{fontSize:24,fontWeight:800}}>Your Journey</div>
        <div style={{fontSize:13,color:"#64748b"}}>Week {currentWeek} of 63 · {Math.round((currentWeek/63)*100)}% complete</div>
        <div style={{background:"#1e293b",borderRadius:4,height:5,overflow:"hidden",marginTop:10}}>
          <div style={{background:"linear-gradient(90deg,#3b82f6,#8b5cf6)",height:"100%",borderRadius:4,width:`${(currentWeek/63)*100}%`,transition:"width 0.4s"}}/>
        </div>
      </div>

      <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:14}}>
        {RC && <RC/>}
        {SB && <SB currentWeek={currentWeek}/>}
        {RT && <RT currentWeek={currentWeek}/>}
        {SG && <SG/>}
        {/* Weight */}
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid #1e293b",borderRadius:14,padding:16}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>⚖️ Bodyweight Log</div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <input
              type="number" inputMode="decimal"
              placeholder="Your weight in kg"
              value={newBw}
              onChange={e=>setNewBw(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&logWeight()}
              style={{flex:1,background:"rgba(255,255,255,0.06)",border:"1px solid #334155",borderRadius:9,padding:"11px 12px",color:"#e2e8f0",fontSize:18,fontWeight:700}}
            />
            <button onClick={logWeight} style={{background:"#7c3aed",border:"none",borderRadius:9,padding:"11px 20px",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:15}}>Log</button>
          </div>

          {latest && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
              {[
                {label:"Now",   val:`${latest.kg}kg`, color:"#e2e8f0"},
                {label:"Start", val:first?`${first.kg}kg`:"—", color:"#94a3b8"},
                {label:"Lost",  val:lost!=null&&lost>0?`${lost.toFixed(1)}kg`:"—", color:"#10b981"},
              ].map((s,i)=>(
                <div key={i} style={{background:"#0f172a",borderRadius:9,padding:"10px",textAlign:"center",border:"1px solid #1e293b"}}>
                  <div style={{fontSize:10,color:"#64748b",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>{s.label}</div>
                  <div style={{fontSize:18,fontWeight:800,color:s.color}}>{s.val}</div>
                </div>
              ))}
            </div>
          )}

          {bwHistory.length > 1 && (
            <>
              <div style={{fontSize:11,color:"#475569",marginBottom:6}}>Last {Math.min(8,bwHistory.length)} weigh-ins</div>
              <div style={{display:"flex",gap:4,alignItems:"flex-end",height:52,paddingBottom:4}}>
                {bwHistory.slice(-8).map((e,i,arr)=>{
                  const vals = arr.map(x=>x.kg);
                  const min = Math.min(...vals), max = Math.max(...vals);
                  const h = max===min ? 28 : Math.round(((e.kg-min)/(max-min))*36)+16;
                  return (
                    <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                      <div style={{width:"100%",background:i===arr.length-1?"#8b5cf6":"#334155",borderRadius:"3px 3px 0 0",height:h}}/>
                      <div style={{fontSize:8,color:"#475569"}}>W{e.week}</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Milestones */}
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid #1e293b",borderRadius:14,padding:16}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>🎯 Milestones</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {MILESTONES.map((m,i) => {
              const p = PHASES.find(ph=>ph.id===m.phase);
              const isUnlocked = currentWeek >= m.week;
              const isChecked  = milestones[i];
              const isRace     = m.week===63;
              return (
                <div key={i} onClick={()=>toggleMilestone(i)}
                  style={{display:"flex",alignItems:"center",gap:10,background:isChecked?"rgba(16,185,129,0.1)":"rgba(255,255,255,0.02)",border:`1px solid ${isChecked?"#059669":"#1e293b"}`,borderRadius:10,padding:"10px 12px",cursor:isUnlocked?"pointer":"default",opacity:isUnlocked?1:0.35,transition:"all 0.2s"}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:isChecked?"#059669":"transparent",border:`2px solid ${isChecked?"#10b981":isUnlocked?p?.color||"#334155":"#1e293b"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:12,color:"#fff",fontWeight:700}}>
                    {isChecked?"✓":""}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:isRace?800:600,color:isRace?"#c084fc":isChecked?"#86efac":"#e2e8f0"}}>{m.label}</div>
                    <div style={{fontSize:10,color:"#475569",marginTop:1}}>Week {m.week}{isUnlocked&&!isChecked?" · tap to mark achieved":""}</div>
                  </div>
                  <div style={{width:6,height:6,borderRadius:"50%",background:p?.color||"#334155",flexShrink:0}}/>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GEAR ─────────────────────────────────────────────────────────────────────

function GearView() {
  return (
    <div style={{paddingBottom:90}}>
      <div style={{background:"linear-gradient(135deg,#0f172a,#1a1a2e)",padding:"20px 16px 14px",borderBottom:"1px solid #1e293b"}}>
        <div style={{fontSize:11,color:"#8b5cf6",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Equipment</div>
        <div style={{fontSize:24,fontWeight:800}}>Gear Upgrades</div>
        <div style={{fontSize:13,color:"#64748b"}}>When to buy, what to buy, why</div>
      </div>

      <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:12}}>
        {/* Current */}
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid #1e293b",borderRadius:14,padding:16}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:10}}>📦 What You Have Now</div>
          {[
            {icon:"🚵",label:"Mountain Bike",ok:true, status:"Use through all of Phase 1 (weeks 1–16). Fine for Zone 2 base building and losing weight."},
            {icon:"⌚",label:"Current Watch", ok:false,status:"Replace in week 10–12. You need accurate HR zones from Phase 1 onward."},
          ].map((g,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 0",borderBottom:i===0?"1px solid #1e293b":"none"}}>
              <span style={{fontSize:24,flexShrink:0}}>{g.icon}</span>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:4}}>
                  <span style={{fontWeight:700,fontSize:14}}>{g.label}</span>
                  <span style={{background:g.ok?"#14532d":"#431407",border:`1px solid ${g.ok?"#16a34a":"#ea580c"}`,color:g.ok?"#86efac":"#fb923c",borderRadius:20,padding:"1px 8px",fontSize:10,fontWeight:600}}>{g.ok?"✓ Keep for now":"⚠ Replace soon"}</span>
                </div>
                <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.5}}>{g.status}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Upgrades */}
        {GEAR.map((g,i)=>(
          <div key={i} style={{background:`linear-gradient(135deg,rgba(0,0,0,0.5),${g.color}12)`,border:`1px solid ${g.color}50`,borderLeft:`3px solid ${g.color}`,borderRadius:14,padding:16}}>
            <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:12}}>
              <span style={{fontSize:34,flexShrink:0}}>{g.icon}</span>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:5}}>
                  {g.urgent && <span style={{background:"#7f1d1d",border:"1px solid #ef4444",color:"#fca5a5",borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700}}>Priority</span>}
                  <span style={{background:"#0f172a",border:"1px solid #1e293b",color:"#64748b",borderRadius:20,padding:"2px 8px",fontSize:10}}>{g.cost}</span>
                </div>
                <div style={{fontWeight:800,fontSize:16}}>{g.item}</div>
                <div style={{fontSize:12,color:g.color,fontWeight:600,marginTop:3}}>📅 {g.when}</div>
              </div>
            </div>
            <div style={{fontSize:13,color:"#94a3b8",lineHeight:1.65,marginBottom:10}}>{g.why}</div>
            <div style={{background:"rgba(0,0,0,0.35)",borderRadius:9,padding:"10px 12px",fontSize:12,color:g.color,lineHeight:1.6}}>💡 {g.note}</div>
          </div>
        ))}

        {/* Race kit */}
        <div style={{background:"rgba(124,58,237,0.1)",border:"1px solid #6d28d9",borderRadius:14,padding:16}}>
          <div style={{fontWeight:700,fontSize:15,color:"#c084fc",marginBottom:10}}>🏁 Race Day Kit Checklist</div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {[
              "Wetsuit — rent or buy by April 2027 (Phase 3)",
              "Tri suit — one-piece, worn under wetsuit",
              "Gravel/road bike + helmet (mandatory by race rules)",
              "Cycling shoes + clipless pedals",
              "Running shoes — rotate 2 pairs in training",
              "Garmin watch with triathlon mode",
              "Nutrition: gels, bars, electrolytes — all tested in training",
              "Race belt for bib number — faster transitions",
              "Goggles — tinted for open water in sunlight",
              "Body Glide anti-chafe — neck, underarms, thighs",
            ].map((item,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",fontSize:13,color:"#94a3b8"}}>
                <span style={{color:"#7c3aed",flexShrink:0,marginTop:1}}>→</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── RACE COUNTDOWN ──────────────────────────────────────────────────────────

const RACE_DATE = new Date("2027-09-14"); // Ironman Emilia-Romagna 2027

function RaceCountdown() {
  const now = new Date();
  const diff = RACE_DATE - now;
  const days = Math.max(0, Math.floor(diff / (1000*60*60*24)));
  const weeks = Math.floor(days/7);
  const rem   = days % 7;
  if(days === 0) return (
    <div style={{background:"linear-gradient(135deg,#4c1d95,#7c3aed)",borderRadius:14,padding:"14px 16px",marginBottom:14,textAlign:"center"}}>
      <div style={{fontSize:28,marginBottom:4}}>🏁</div>
      <div style={{fontWeight:800,fontSize:20,color:"#fff"}}>RACE DAY. GO.</div>
    </div>
  );
  return (
    <div style={{background:"linear-gradient(135deg,#1e1b4b,#2e1065)",border:"1px solid #4c1d95",borderRadius:14,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
      <div style={{fontSize:28,flexShrink:0}}>🏁</div>
      <div style={{flex:1}}>
        <div style={{fontSize:11,color:"#8b5cf6",letterSpacing:2,textTransform:"uppercase",marginBottom:2}}>Ironman Emilia-Romagna</div>
        <div style={{fontWeight:800,fontSize:20,color:"#fff",letterSpacing:-0.5}}>
          {days} days <span style={{fontSize:13,fontWeight:400,color:"#a78bfa"}}>({weeks}w {rem}d)</span>
        </div>
        <div style={{fontSize:11,color:"#6d28d9",marginTop:1}}>14 September 2027</div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontSize:28,fontWeight:800,color:"#7c3aed"}}>{days}</div>
        <div style={{fontSize:10,color:"#6d28d9",marginTop:-2}}>days to go</div>
      </div>
    </div>
  );
}

// ─── STRENGTH GRAPHS ─────────────────────────────────────────────────────────

const TRACKED_LIFTS = ["Back Squat","Deadlift","Bench Press","Weighted Pull-ups"];

function StrengthGraphs() {
  // Collect all logs from localStorage
  const allLogs = [];
  for(let w=1; w<=63; w++) {
    const sched = WEEK_SCHEDULES[w<=8?"1-8":w<=16?"9-16":w<=28?"17-28":w<=36?"29-36":w<=56?"37-56":"57-63"];
    sched.forEach(s => {
      const data = LS.get(sessionKey(w, s.id));
      if(!data || !data.setLogs) return;
      s.sets.forEach((set,i) => {
        const kg = parseFloat(data.setLogs[`${i}_kg`]);
        if(kg > 0) allLogs.push({ week:w, exercise:set.label, kg });
      });
    });
  }

  const [activeLift, setActiveLift] = useState(TRACKED_LIFTS[0]);
  const liftData = allLogs.filter(l=>l.exercise===activeLift)
    .reduce((acc,l) => {
      const existing = acc.find(x=>x.week===l.week);
      if(existing) { if(l.kg>existing.kg) existing.kg=l.kg; }
      else acc.push({week:l.week,kg:l.kg});
      return acc;
    },[]).sort((a,b)=>a.week-b.week);

  const maxKg = liftData.length ? Math.max(...liftData.map(x=>x.kg)) : 0;
  const minKg = liftData.length ? Math.min(...liftData.map(x=>x.kg)) : 0;
  const pr = maxKg;
  const latest = liftData[liftData.length-1]?.kg;

  return (
    <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid #1e293b",borderRadius:14,padding:16,marginBottom:14}}>
      <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>📈 Strength Progression</div>

      {/* Lift picker */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
        {TRACKED_LIFTS.map(l=>(
          <button key={l} onClick={()=>setActiveLift(l)}
            style={{background:activeLift===l?"#1d4ed8":"rgba(255,255,255,0.04)",border:`1px solid ${activeLift===l?"#2563eb":"#1e293b"}`,borderRadius:20,padding:"4px 12px",color:activeLift===l?"#93c5fd":"#64748b",fontSize:11,cursor:"pointer",fontWeight:activeLift===l?700:400}}>
            {l}
          </button>
        ))}
      </div>

      {liftData.length === 0 ? (
        <div style={{textAlign:"center",padding:"24px 0",color:"#334155",fontSize:13}}>
          No data yet for {activeLift}.<br/>Log your weights in Today and they'll appear here.
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
            {[
              {label:"Latest",  val:`${latest}kg`,         color:"#e2e8f0"},
              {label:"PR",      val:`${pr}kg`,              color:"#f59e0b"},
              {label:"Sessions",val:`${liftData.length}`,  color:"#8b5cf6"},
            ].map((s,i)=>(
              <div key={i} style={{background:"#0f172a",borderRadius:9,padding:"9px 10px",textAlign:"center",border:"1px solid #1e293b"}}>
                <div style={{fontSize:10,color:"#475569",marginBottom:3,textTransform:"uppercase",letterSpacing:1}}>{s.label}</div>
                <div style={{fontSize:17,fontWeight:800,color:s.color}}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div style={{display:"flex",gap:3,alignItems:"flex-end",height:72,paddingBottom:18,position:"relative"}}>
            {liftData.slice(-16).map((d,i,arr)=>{
              const h = maxKg===minKg ? 48 : Math.round(((d.kg-minKg)/(maxKg-minKg))*52)+16;
              const isPR = d.kg === maxKg;
              const isLast = i===arr.length-1;
              return (
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:0,position:"relative"}}>
                  <div style={{width:"100%",background:isPR?"#f59e0b":isLast?"#3b82f6":"#1e3a5f",borderRadius:"3px 3px 0 0",height:h,position:"relative"}}>
                    {isPR && <div style={{position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)",fontSize:9,color:"#f59e0b",fontWeight:700,whiteSpace:"nowrap"}}>PR</div>}
                  </div>
                  <div style={{position:"absolute",bottom:0,fontSize:8,color:"#334155",whiteSpace:"nowrap"}}>W{d.week}</div>
                </div>
              );
            })}
          </div>
          <div style={{fontSize:11,color:"#334155",textAlign:"center",marginTop:2}}>Showing last {Math.min(16,liftData.length)} sessions · yellow = PR</div>
        </>
      )}
    </div>
  );
}

// ─── RECOVERY TRACKER ────────────────────────────────────────────────────────

function RecoveryTracker({ currentWeek }) {
  const today = new Date().toISOString().split("T")[0];
  const rkey = `im_recovery_${today}`;
  const [sleep, setSleep]       = useState("");
  const [feel,  setFeel]        = useState(0);
  const [saved, setSaved]       = useState(false);
  const [history, setHistory]   = useState([]);

  useEffect(()=>{
    const d = LS.get(rkey);
    if(d){ setSleep(d.sleep||""); setFeel(d.feel||0); setSaved(true); }
    setHistory(LS.get("im_recovery_history")||[]);
  },[rkey]);

  const save = () => {
    const entry = { date:today, week:currentWeek, sleep:parseFloat(sleep)||0, feel };
    LS.set(rkey, entry);
    const hist = [...(LS.get("im_recovery_history")||[]).filter(x=>x.date!==today), entry].slice(-30);
    LS.set("im_recovery_history", hist);
    setHistory(hist);
    setSaved(true);
  };

  const FEEL_LABELS = ["","💀 Wrecked","😴 Tired","😐 OK","💪 Good","🔥 Great"];
  const FEEL_COLORS = ["","#ef4444","#f97316","#eab308","#22c55e","#10b981"];

  return (
    <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid #1e293b",borderRadius:14,padding:16,marginBottom:14}}>
      <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>🛌 Recovery Log — Today</div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        {/* Sleep */}
        <div>
          <div style={{fontSize:11,color:"#64748b",marginBottom:6}}>Sleep last night</div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <input type="number" inputMode="decimal" placeholder="7.5"
              value={sleep} onChange={e=>setSleep(e.target.value)}
              style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid #334155",borderRadius:8,padding:"10px",color:"#e2e8f0",fontSize:20,fontWeight:800,textAlign:"center"}}
            />
            <span style={{color:"#64748b",fontSize:12,flexShrink:0}}>hrs</span>
          </div>
        </div>
        {/* Feel */}
        <div>
          <div style={{fontSize:11,color:"#64748b",marginBottom:6}}>How do you feel?</div>
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid #1e293b",borderRadius:8,padding:"10px",textAlign:"center",minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {feel>0 ? <span style={{fontSize:14,fontWeight:700,color:FEEL_COLORS[feel]}}>{FEEL_LABELS[feel]}</span>
                    : <span style={{fontSize:12,color:"#334155"}}>tap below</span>}
          </div>
        </div>
      </div>

      {/* Feel buttons */}
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        {[1,2,3,4,5].map(v=>(
          <button key={v} onClick={()=>setFeel(v)}
            style={{flex:1,background:feel===v?FEEL_COLORS[v]+"30":"rgba(255,255,255,0.04)",border:`1px solid ${feel===v?FEEL_COLORS[v]:"#1e293b"}`,borderRadius:8,padding:"8px 0",fontSize:16,cursor:"pointer"}}>
            {FEEL_LABELS[v].split(" ")[0]}
          </button>
        ))}
      </div>

      <button onClick={save} disabled={!sleep||!feel}
        style={{width:"100%",background:saved?"#14532d":(!sleep||!feel)?"#1e293b":"#7c3aed",border:saved?"1px solid #16a34a":"none",borderRadius:10,padding:"11px",color:saved?"#86efac":(!sleep||!feel)?"#475569":"#fff",fontWeight:700,fontSize:13,cursor:(!sleep||!feel)?"default":"pointer"}}>
        {saved?"✓ Logged today":"Log Recovery"}
      </button>

      {/* Trend */}
      {history.length>2 && (
        <div style={{marginTop:12}}>
          <div style={{fontSize:11,color:"#475569",marginBottom:6}}>Last {Math.min(7,history.length)} days — feel score</div>
          <div style={{display:"flex",gap:4,alignItems:"flex-end",height:36}}>
            {history.slice(-7).map((d,i)=>{
              const h = Math.round((d.feel/5)*32)+4;
              return (
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  <div style={{width:"100%",background:FEEL_COLORS[d.feel]||"#334155",borderRadius:"2px 2px 0 0",height:h,opacity:0.8}}/>
                  <div style={{fontSize:8,color:"#334155"}}>{d.date.slice(5)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STREAK COUNTER ───────────────────────────────────────────────────────────

function StreakBadge({ currentWeek }) {
  const sched = WEEK_SCHEDULES[currentWeek<=8?"1-8":currentWeek<=16?"9-16":currentWeek<=28?"17-28":currentWeek<=36?"29-36":currentWeek<=56?"37-56":"57-63"];
  const nonRest = sched.filter(s=>s.type!=="rest");
  const done = nonRest.filter(s=>LS.get(sessionKey(currentWeek,s.id))?.done).length;
  const travelDone = nonRest.filter(s=>{
    const tkey=`im_travel_${currentWeek}_${s.day}`;
    const t=LS.get(tkey);
    return t&&(t.travelMode==="alternative"||t.travelMode==="custom"||t.travelMode==="postpone");
  }).length;
  const effective = Math.min(nonRest.length, done + travelDone);

  // Calculate streak across weeks
  let streak = 0;
  for(let w=currentWeek; w>=1; w--) {
    const sc = WEEK_SCHEDULES[w<=8?"1-8":w<=16?"9-16":w<=28?"17-28":w<=36?"29-36":w<=56?"37-56":"57-63"];
    const nr = sc.filter(s=>s.type!=="rest");
    const d  = nr.filter(s=>LS.get(sessionKey(w,s.id))?.done).length;
    if(d >= Math.ceil(nr.length*0.6)) streak++; else if(w<currentWeek) break;
  }

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
      <div style={{background:"rgba(37,99,235,0.1)",border:"1px solid #1d4ed8",borderRadius:12,padding:"12px 14px",textAlign:"center"}}>
        <div style={{fontSize:10,color:"#3b82f6",letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>This week</div>
        <div style={{fontSize:26,fontWeight:800,color:"#93c5fd"}}>{effective}<span style={{fontSize:14,color:"#475569",fontWeight:400}}>/{nonRest.length}</span></div>
        <div style={{fontSize:10,color:"#1d4ed8",marginTop:2}}>sessions done</div>
        <div style={{background:"#1e293b",borderRadius:3,height:4,overflow:"hidden",marginTop:8}}>
          <div style={{background:"#3b82f6",height:"100%",width:`${(effective/nonRest.length)*100}%`,borderRadius:3}}/>
        </div>
      </div>
      <div style={{background:"rgba(245,158,11,0.1)",border:"1px solid #92400e",borderRadius:12,padding:"12px 14px",textAlign:"center"}}>
        <div style={{fontSize:10,color:"#f59e0b",letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Weekly streak</div>
        <div style={{fontSize:26,fontWeight:800,color:"#fcd34d"}}>{streak}<span style={{fontSize:14,color:"#475569",fontWeight:400}}> wks</span></div>
        <div style={{fontSize:10,color:"#92400e",marginTop:2}}>≥60% sessions/week</div>
        <div style={{fontSize:18,marginTop:4}}>{streak>=4?"🔥":streak>=2?"⚡":"💪"}</div>
      </div>
    </div>
  );
}

// ─── PR BELL ─────────────────────────────────────────────────────────────────

function PRBell({ show, exercise, kg, onClose }) {
  useEffect(()=>{ if(show){ const t=setTimeout(onClose,4000); return()=>clearTimeout(t); }}, [show]);
  if(!show) return null;
  return (
    <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:999,background:"linear-gradient(135deg,#92400e,#f59e0b)",borderRadius:14,padding:"14px 20px",boxShadow:"0 8px 32px rgba(245,158,11,0.4)",display:"flex",alignItems:"center",gap:10,maxWidth:340,width:"calc(100% - 32px)"}}>
      <span style={{fontSize:28}}>🏆</span>
      <div>
        <div style={{fontWeight:800,fontSize:15,color:"#fff"}}>New PR!</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.8)"}}>{exercise} — {kg}kg</div>
      </div>
      <button onClick={onClose} style={{marginLeft:"auto",background:"none",border:"none",color:"rgba(255,255,255,0.6)",fontSize:18,cursor:"pointer"}}>✕</button>
    </div>
  );
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

function NotificationsView() {
  const [permission, setPermission] = useState(()=> "Notification" in window ? Notification.permission : "unsupported");
  const [times, setTimes]   = useState(()=> LS.get("im_notif_times") || { morning:"06:30", evening:"18:00", reminder:"20:00" });
  const [enabled, setEnabled] = useState(()=> LS.get("im_notif_enabled") || { morning:true, evening:true, reminder:true });
  const [saved, setSaved]   = useState(false);

  const requestPermission = async () => {
    if(!("Notification" in window)){ setPermission("unsupported"); return; }
    const result = await Notification.requestPermission();
    setPermission(result);
    if(result === "granted") sendTestNotif();
  };

  const sendTestNotif = () => {
    if(Notification.permission !== "granted") return;
    new Notification("Ironman Tracker ✓", {
      body: "Notifications are working! You'll be reminded before each session.",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
    });
  };

  const saveSettings = () => {
    LS.set("im_notif_times", times);
    LS.set("im_notif_enabled", enabled);
    setSaved(true);
    setTimeout(()=>setSaved(false),2000);
  };

  const NOTIF_TYPES = [
    { id:"morning", label:"Morning session reminder",  icon:"🌅", desc:"Before morning swims and runs" },
    { id:"evening", label:"Evening session reminder",  icon:"🌆", desc:"Before gym and bike sessions" },
    { id:"reminder",label:"Evening check-in",          icon:"🔔", desc:"If you haven't logged today's session" },
  ];

  return (
    <div style={{paddingBottom:90}}>
      <div style={{background:"linear-gradient(135deg,#0f172a,#1a1a2e)",padding:"20px 16px 14px",borderBottom:"1px solid #1e293b"}}>
        <div style={{fontSize:11,color:"#8b5cf6",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Settings</div>
        <div style={{fontSize:24,fontWeight:800}}>Notifications</div>
        <div style={{fontSize:13,color:"#64748b"}}>Reminders to keep you on track</div>
      </div>

      <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:12}}>

        {/* Permission block */}
        <div style={{background: permission==="granted" ? "rgba(16,185,129,0.1)" : "rgba(124,58,237,0.1)",
          border:`1px solid ${permission==="granted"?"#059669":"#6d28d9"}`, borderRadius:14, padding:16}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <span style={{fontSize:28}}>{permission==="granted"?"✅":"🔔"}</span>
            <div>
              <div style={{fontWeight:700,fontSize:15}}>
                {permission==="granted"?"Notifications active" : permission==="denied"?"Notifications blocked" : permission==="unsupported"?"Not supported":"Enable notifications"}
              </div>
              <div style={{fontSize:12,color:"#64748b",marginTop:1}}>
                {permission==="granted" ? "Your reminders are set up below"
                  : permission==="denied" ? "Go to Chrome site settings and allow notifications for this app"
                  : permission==="unsupported" ? "Your browser doesn't support notifications"
                  : "Allow notifications to get workout reminders"}
              </div>
            </div>
          </div>
          {permission !== "granted" && permission !== "denied" && permission !== "unsupported" && (
            <button onClick={requestPermission}
              style={{width:"100%",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",border:"none",borderRadius:10,padding:"13px",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>
              Enable Notifications
            </button>
          )}
          {permission === "granted" && (
            <button onClick={sendTestNotif}
              style={{width:"100%",background:"rgba(16,185,129,0.15)",border:"1px solid #059669",borderRadius:10,padding:"11px",color:"#86efac",fontWeight:600,fontSize:13,cursor:"pointer"}}>
              Send test notification
            </button>
          )}
        </div>

        {/* How notifications work on PWA */}
        <div style={{background:"rgba(37,99,235,0.08)",border:"1px solid #1e3a5f",borderRadius:12,padding:14}}>
          <div style={{fontWeight:600,fontSize:13,marginBottom:6,color:"#93c5fd"}}>ℹ️ How this works on Android</div>
          <div style={{fontSize:12,color:"#64748b",lineHeight:1.6}}>
            PWA notifications fire when you open the app and the scheduled time has passed that day. For fully automatic background notifications, set the times below and open the app each morning — it will check and notify if you haven't trained yet. For true background delivery, Android will prompt you to add the app to your home screen first.
          </div>
        </div>

        {/* Notification settings */}
        {permission === "granted" && (
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid #1e293b",borderRadius:14,padding:16}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:14}}>Reminder Times</div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {NOTIF_TYPES.map(n=>(
                <div key={n.id} style={{background:"rgba(0,0,0,0.2)",borderRadius:10,padding:"12px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:18}}>{n.icon}</span>
                      <div>
                        <div style={{fontSize:13,fontWeight:600}}>{n.label}</div>
                        <div style={{fontSize:11,color:"#475569"}}>{n.desc}</div>
                      </div>
                    </div>
                    {/* Toggle */}
                    <div onClick={()=>setEnabled(p=>({...p,[n.id]:!p[n.id]}))}
                      style={{width:44,height:24,background:enabled[n.id]?"#7c3aed":"#1e293b",borderRadius:12,position:"relative",cursor:"pointer",transition:"background 0.2s",flexShrink:0}}>
                      <div style={{position:"absolute",top:3,left:enabled[n.id]?22:3,width:18,height:18,background:"#fff",borderRadius:"50%",transition:"left 0.2s"}}/>
                    </div>
                  </div>
                  {enabled[n.id] && (
                    <input type="time" value={times[n.id]}
                      onChange={e=>setTimes(p=>({...p,[n.id]:e.target.value}))}
                      style={{background:"rgba(255,255,255,0.08)",border:"1px solid #334155",borderRadius:8,padding:"8px 12px",color:"#e2e8f0",fontSize:15,fontWeight:700,width:"100%",boxSizing:"border-box",fontFamily:"inherit"}}
                    />
                  )}
                </div>
              ))}
            </div>
            <button onClick={saveSettings}
              style={{width:"100%",marginTop:14,background:saved?"#14532d":"#7c3aed",border:saved?"1px solid #16a34a":"none",borderRadius:10,padding:"12px",color:saved?"#86efac":"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>
              {saved?"✓ Saved!":"Save Reminder Times"}
            </button>
          </div>
        )}

        {/* Race week auto-reminders info */}
        <div style={{background:"rgba(139,92,246,0.08)",border:"1px solid #4c1d95",borderRadius:12,padding:14}}>
          <div style={{fontWeight:600,fontSize:13,marginBottom:6,color:"#c084fc"}}>🏁 Race Week Reminders</div>
          <div style={{fontSize:12,color:"#64748b",lineHeight:1.6}}>
            In week 62–63 the app automatically activates daily race prep reminders: kit check, nutrition prep, course briefing, sleep targets, and final session reminders. No setup needed.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PRE-RACE CHECKLIST ───────────────────────────────────────────────────────

const RACE_CHECKLIST = [
  { day:"14 days out", icon:"🚴", items:[
    "Book bike service — check gears, brakes, tyres, chain",
    "Confirm race registration and pick up details",
    "Order any missing nutrition (gels, electrolytes, bars)",
    "Check wetsuit fits — try it on in the sea",
    "Plan travel to Cervia (race venue) and accommodation",
  ]},
  { day:"7 days out", icon:"📦", items:[
    "Pack transition bag: helmet, cycling shoes, running shoes, race belt",
    "Pack swim bag: wetsuit, goggles (2 pairs), swim cap, body glide",
    "Prepare nutrition plan: exactly what you'll eat/drink at each stage",
    "Start carb loading — 8–10g carbs/kg bodyweight per day",
    "Reduce training to short sharp sessions only",
    "Confirm hotel checkout time vs race start time",
  ]},
  { day:"3 days out", icon:"🏁", items:[
    "Attend race briefing (mandatory — check race schedule)",
    "Rack your bike in transition — check it's secure",
    "Walk both transition areas (T1 swim→bike, T2 bike→run)",
    "Note landmarks to find your rack position fast",
    "Lay out all race kit — charge Garmin watch fully",
    "Eat clean, familiar food — nothing new or experimental",
    "Sleep target: 8+ hours tonight and tomorrow",
  ]},
  { day:"Race morning", icon:"🌅", items:[
    "Wake 3–3.5 hrs before swim start",
    "Eat race breakfast: 150–200g carbs, low fibre, familiar",
    "Body Glide: neck, underarms, inner thighs, ankles",
    "Warm up: 10 min easy jog, 5 min dynamic stretching",
    "Enter water 15–20 min before start — acclimatise",
    "Seed yourself correctly in swim wave — don't go front if not confident",
    "Garmin on wrist, triathlon multisport mode active",
  ]},
  { day:"Race execution", icon:"⚡", items:[
    "Swim: sight every 8–10 strokes. Start easy — first 400m feels fast",
    "T1: wetsuit off as you run, helmet on before touching bike",
    "Bike: first 30km conservative — everyone goes out too hard",
    "Eat every 30–40 min on bike: target 60–80g carbs/hr",
    "Run: walk the aid stations, run between. Marathon shuffle is fine.",
    "Run nutrition: cola + water at aid stations works well late in race",
    "Finish: enjoy it. You've earned this.",
  ]},
];

function PreRaceChecklist({ currentWeek }) {
  const [checks, setChecks] = useState(()=>LS.get("im_race_checklist")||{});
  const isRaceWeek = currentWeek >= 62;

  const toggle = (dayI, itemI) => {
    const k = `${dayI}_${itemI}`;
    const updated = {...checks, [k]:!checks[k]};
    setChecks(updated);
    LS.set("im_race_checklist", updated);
  };

  const totalItems = RACE_CHECKLIST.reduce((a,d)=>a+d.items.length,0);
  const doneItems  = Object.values(checks).filter(Boolean).length;

  return (
    <div style={{paddingBottom:90}}>
      <div style={{background:"linear-gradient(135deg,#1a0533,#2e1065)",padding:"20px 16px 14px",borderBottom:"1px solid #4c1d95"}}>
        <div style={{fontSize:11,color:"#8b5cf6",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Race Preparation</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:24,fontWeight:800}}>Pre-Race Checklist</div>
            <div style={{fontSize:13,color:"#7c3aed",marginTop:2}}>Ironman Emilia-Romagna · 14 Sep 2027</div>
          </div>
        </div>
        {!isRaceWeek && (
          <div style={{marginTop:10,background:"rgba(124,58,237,0.15)",border:"1px solid #4c1d95",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#a78bfa"}}>
            This checklist activates in week 62. You're in week {currentWeek} — keep training!
          </div>
        )}
        <div style={{marginTop:12}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#6d28d9",marginBottom:4}}>
            <span>{doneItems} / {totalItems} items checked</span>
            <span>{Math.round((doneItems/totalItems)*100)}%</span>
          </div>
          <div style={{background:"#1e293b",borderRadius:4,height:5,overflow:"hidden"}}>
            <div style={{background:"linear-gradient(90deg,#7c3aed,#c084fc)",height:"100%",borderRadius:4,width:`${(doneItems/totalItems)*100}%`,transition:"width 0.3s"}}/>
          </div>
        </div>
      </div>

      <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:12}}>
        {RACE_CHECKLIST.map((section,di)=>{
          const sectionDone = section.items.filter((_,ii)=>checks[`${di}_${ii}`]).length;
          return (
            <div key={di} style={{background:"rgba(255,255,255,0.03)",border:"1px solid #1e293b",borderRadius:14,padding:14,opacity:isRaceWeek?1:0.5}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:22}}>{section.icon}</span>
                  <div style={{fontWeight:700,fontSize:14,color:"#c084fc"}}>{section.day}</div>
                </div>
                <span style={{fontSize:12,color:"#475569"}}>{sectionDone}/{section.items.length}</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {section.items.map((item,ii)=>{
                  const isDone = checks[`${di}_${ii}`];
                  return (
                    <div key={ii} onClick={()=>isRaceWeek&&toggle(di,ii)}
                      style={{display:"flex",alignItems:"flex-start",gap:10,background:isDone?"rgba(16,185,129,0.08)":"transparent",borderRadius:8,padding:"8px 10px",cursor:isRaceWeek?"pointer":"default",transition:"background 0.15s"}}>
                      <div style={{width:20,height:20,borderRadius:5,background:isDone?"#059669":"transparent",border:`2px solid ${isDone?"#10b981":"#334155"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,fontSize:11,color:"#fff",fontWeight:700}}>
                        {isDone?"✓":""}
                      </div>
                      <div style={{fontSize:13,color:isDone?"#86efac":"#cbd5e1",lineHeight:1.5,textDecoration:isDone?"line-through":""}}>{item}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── UPDATED BOTTOM NAV ───────────────────────────────────────────────────────

function BottomNav({ tab, setTab }) {
  const items = [
    {id:"today",    icon:"📋", label:"Today"},
    {id:"week",     icon:"🗓",  label:"Week"},
    {id:"progress", icon:"📈", label:"Progress"},
    {id:"race",     icon:"🏁", label:"Race"},
    {id:"notif",    icon:"🔔", label:"Alerts"},
  ];
  return (
    <nav style={{position:"fixed",bottom:0,left:0,right:0,background:"#0d1117",borderTop:"1px solid #1e293b",display:"flex",zIndex:100,paddingBottom:"env(safe-area-inset-bottom)"}}>
      {items.map(i => (
        <button key={i.id} onClick={() => setTab(i.id)} style={{flex:1,background:"none",border:"none",padding:"10px 0 12px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
          <span style={{fontSize:18}}>{i.icon}</span>
          <span style={{fontSize:9,color:tab===i.id?"#8b5cf6":"#475569",fontWeight:tab===i.id?700:400}}>{i.label}</span>
          {tab===i.id && <div style={{width:20,height:2,background:"#8b5cf6",borderRadius:2,marginTop:-2}}/>}
        </button>
      ))}
    </nav>
  );
}

// ─── NOTIFICATION CHECKER (fires on app open) ─────────────────────────────────

function useNotificationChecker(currentWeek) {
  useEffect(()=>{
    if(Notification.permission !== "granted") return;
    const enabled = LS.get("im_notif_enabled") || {};
    const times   = LS.get("im_notif_times")   || {};
    const now     = new Date();
    const hhmm    = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    const todayKey= `im_notif_fired_${now.toISOString().split("T")[0]}`;
    const fired   = LS.get(todayKey) || {};

    const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const sched = WEEK_SCHEDULES[currentWeek<=8?"1-8":currentWeek<=16?"9-16":currentWeek<=28?"17-28":currentWeek<=36?"29-36":currentWeek<=56?"37-56":"57-63"];
    const todaySession = sched.find(s=>s.day===dayNames[now.getDay()]);
    const isLogged = todaySession ? LS.get(sessionKey(currentWeek,todaySession.id))?.done : false;

    if(enabled.morning && times.morning && hhmm >= times.morning && !fired.morning) {
      new Notification("🌅 Training time!", { body: todaySession ? `Today: ${todaySession.title}` : "Active recovery day — move well.", icon:"/icon-192.png" });
      LS.set(todayKey, {...fired, morning:true});
    }
    if(enabled.reminder && times.reminder && hhmm >= times.reminder && !fired.reminder && todaySession && !isLogged && todaySession.type!=="rest") {
      new Notification("🔔 Did you train today?", { body:`Don't forget to log: ${todaySession.title}`, icon:"/icon-192.png" });
      LS.set(todayKey, {...fired, reminder:true});
    }
  },[currentWeek]);
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

// Week calculation from training start date
const TRAINING_START = new Date("2026-06-08"); // Monday of week 1
function getCurrentTrainingWeek() {
  const now = new Date();
  const diff = now - TRAINING_START;
  const week = Math.floor(diff / (1000*60*60*24*7)) + 1;
  return Math.min(63, Math.max(1, week));
}

export default function App() {
  const [tab, setTab]                 = useState("today");
  const [currentWeek, setCurrentWeek] = useState(()=>LS.get("im_current_week")||getCurrentTrainingWeek());
  const [prShow, setPrShow]           = useState(false);
  const [prExercise, setPrExercise]   = useState("");
  const [prKg, setPrKg]               = useState(0);

  useEffect(()=>{ LS.set("im_current_week", currentWeek); },[currentWeek]);
  useNotificationChecker(currentWeek);

  // Reset to actual current week when switching to Today tab
  const handleTabChange = (newTab) => {
    if(newTab === "today") setCurrentWeek(getCurrentTrainingWeek());
    setTab(newTab);
  };

  // PR detection
  useEffect(()=>{
    const handler = (e)=>{ setPrExercise(e.detail.exercise); setPrKg(e.detail.kg); setPrShow(true); };
    window.addEventListener("ironman_pr", handler);
    return ()=>window.removeEventListener("ironman_pr", handler);
  },[]);

  return (
    <div style={{background:"#0a0a0f",minHeight:"100dvh",color:"#e2e8f0",fontFamily:"'Inter',system-ui,sans-serif",maxWidth:480,margin:"0 auto",position:"relative"}}>
      <PRBell show={prShow} exercise={prExercise} kg={prKg} onClose={()=>setPrShow(false)}/>
      {tab==="today"    && <TodayView    currentWeek={currentWeek} setCurrentWeek={setCurrentWeek} onPR={(ex,kg)=>{setPrExercise(ex);setPrKg(kg);setPrShow(true);}}/>}
      {tab==="week"     && <WeekView     currentWeek={currentWeek} setCurrentWeek={setCurrentWeek}/>}
      {tab==="progress" && <ProgressView currentWeek={currentWeek} StreakBadge={StreakBadge} StrengthGraphs={StrengthGraphs} RecoveryTracker={RecoveryTracker} RaceCountdown={RaceCountdown}/>}
      {tab==="race"     && <PreRaceChecklist currentWeek={currentWeek}/>}
      {tab==="notif"    && <NotificationsView/>}
      <BottomNav tab={tab} setTab={handleTabChange}/>
    </div>
  );
}
