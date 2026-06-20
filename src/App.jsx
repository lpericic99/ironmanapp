import { useState, useEffect, useRef } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const PHASES = [
  { id: 1, name: "Foundation & Fat Loss", short: "Foundation", weeks: [1,16],  color: "#3b82f6", dim: "#1e3a5f", range: "Jun–Sep 2026" },
  { id: 2, name: "Build & Specificity",   short: "Build",      weeks: [17,36], color: "#10b981", dim: "#064e3b", range: "Oct 2026–Feb 2027" },
  { id: 3, name: "Race Volume",           short: "Volume",     weeks: [37,56], color: "#f59e0b", dim: "#451a03", range: "Mar–Jul 2027" },
  { id: 4, name: "Taper & Peak",          short: "Taper",      weeks: [57,63], color: "#8b5cf6", dim: "#2e1065", range: "Aug–Sep 2027" },
];

// ─── WEEK-BY-WEEK SCHEDULES ───────────────────────────────────────────────────
// Each week has individual targets. Recovery weeks (4,8,12,16,20,24,28,32,36,40,44,48,52,56) are ~80% volume.

function makeWeek(w) {
  // Helper: is this week an OW summer week?
  // Weeks 1–16 = Jun–Sep 2026 (summer)
  // Weeks 17–45 = Oct 2026–Jun 2027 (pool/winter)
  // Weeks 46–63 = Jul–Sep 2027 (summer again)
  const isOWSummer = w<=16 || w>=46;

  // ── PHASE 1: Foundation & Fat Loss (weeks 1–16) ── ALL SUMMER / OW ────────
  if(w<=16) {
    const isRecovery = w%4===0;
    // Time-based swim targets for OW (minutes)
    const swimMin = isRecovery
      ? [18,22,20,18,22,26,24,22,26,30,28,25,30,34,32,28][w-1]
      :  [18,22,20,18,22,26,24,22,26,30,28,25,30,34,32,28][w-1];
    // Run intervals
    const runRatio = w<=4?"2min run / 1min walk × 13 rounds":w<=8?"3min run / 1min walk × 11 rounds":w<=12?"5min run / 1min walk × 9 rounds":"8min run / 1min walk × 7 rounds";
    const runMin   = isRecovery?30: w<=4?40:w<=8?45:w<=12?50:55;
    // Bike
    const midBike  = isRecovery?50: w<=4?65:w<=8?75:w<=12?85:90;
    const longBike = isRecovery?60: w<=4?75:w<=8?90:w<=12?105:120;
    // Strength weights (progressive overload ~2.5kg every 2 weeks)
    const squat  = 110 + Math.floor((w-1)/2)*2;
    const rdl    = 90  + Math.floor((w-1)/2)*2;
    const bench  = 85  + Math.floor((w-1)/2)*2;
    const dl     = 130 + Math.floor((w-1)/2)*2;
    const hipThr = 90  + Math.floor((w-1)/2)*2;
    const pullW  = w<=8?0:5+Math.floor((w-9)/2)*2;

    return [
      { id:"mon-str", day:"Mon", time:"Evening", type:"strength", icon:"🏋️",
        title:`Strength A — Full Body${isRecovery?" (Recovery — lighter)":""}`,
        sets:[
          {label:"Back Squat",        reps:`4×${isRecovery?6:8}`,  note:`~${squat}kg${isRecovery?", easy tempo":""}` },
          {label:"Romanian Deadlift", reps:`4×${isRecovery?6:8}`,  note:`~${rdl}kg` },
          {label:"Bench Press",       reps:`4×${isRecovery?6:8}`,  note:`~${bench}kg` },
          {label:w<=8?"Pull-ups":"Weighted Pull-ups", reps:`4×${isRecovery?6:8}`, note:w<=8?"Bodyweight":`+${pullW}kg` },
          {label:"Farmer Carry",      reps:`3×${w<=8?"40":"50"}m`, note:"" },
          {label:"Plank",             reps:`3×${30+w*2}s`,         note:"" },
        ], cardio:null },
      { id:"tue-swm", day:"Tue", time:"Morning", type:"swim", icon:"🏊",
        title:`OW Swim — ${w<=4?"Technique":w<=8?"Form Focus":w<=12?"Building Pace":"Threshold Intro"} Wk${w}`,
        sets: w<=4?[
          {label:"Easy warm-up",   reps:"5 min",  note:"Gentle entry, get comfortable in open water"},
          {label:"Catch-up drill", reps:"4×1 min",note:"Focus on reach and pull — sight every 8 strokes"},
          {label:"Easy continuous",reps:"8 min",  note:"Relax stroke, breathe every 3"},
          {label:"Cool-down",      reps:"3 min",  note:"Easy back to shore"},
        ]:w<=8?[
          {label:"Easy warm-up",    reps:"5 min",  note:""},
          {label:"Rotation drills", reps:"3×2 min",note:"Body rotation, feel the catch"},
          {label:"Continuous swim", reps:`${swimMin-10} min`, note:"Steady pace, sight every 8 strokes"},
          {label:"Cool-down",       reps:"3 min",  note:""},
        ]:w<=12?[
          {label:"Warm-up",         reps:"5 min",  note:"Easy"},
          {label:"Build sets",      reps:`3×${Math.round((swimMin-10)/3)} min`, note:"Build pace each rep, 1 min easy between"},
          {label:"Steady swim",     reps:"8 min",  note:"Comfortable controlled pace"},
          {label:"Cool-down",       reps:"3 min",  note:""},
        ]:[
          {label:"Warm-up",         reps:"5 min",  note:""},
          {label:"Threshold efforts",reps:`4×${Math.round((swimMin-10)/4)} min`,note:"Solid effort — harder than easy but sustainable"},
          {label:"Easy cool-down",  reps:"5 min",  note:""},
        ],
        cardio:{label:"Total OW swim time", unit:"min", placeholder:String(swimMin),
          note:"🌊 Open water — time based. Log actual time swum. No need to measure distance."} },
      { id:"wed-bik", day:"Wed", time:"Evening", type:"bike", icon:"🚴",
        title:`Zone 2 Bike${w<=8?" + Core":w<=12?" + StairMaster":" + Core"}`,
        sets: w<=8?[
          {label:"Dead bug",   reps:"3×12", note:"Slow, controlled"},
          {label:"Bird dog",   reps:"3×12", note:"Each side"},
          {label:"Side plank", reps:"2×30s",note:"Each side"},
          {label:"Hip bridge", reps:"3×15", note:""},
        ]:w<=12?[]:[ 
          {label:"Dead bug",       reps:"3×12", note:""},
          {label:"Pallof press",   reps:"3×12", note:"Each side"},
          {label:"Side plank",     reps:"3×40s",note:"Each side"},
          {label:"Hip bridge",     reps:"3×20", note:""},
        ],
        cardio:{label:w<=8?"Ride duration":w<=12?"Bike + Stair (min)":"Ride duration", unit:"min", placeholder:String(midBike),
          note:w<=8?"Full Zone 2 — can hold a full conversation":w<=12?"35min bike then 20min StairMaster":"Zone 2 steady — HR stays conversational"} },
      { id:"thu-str", day:"Thu", time:"Evening", type:"strength", icon:"🏋️",
        title:`Strength B — Lower & Posterior${isRecovery?" (Recovery)":""}`,
        sets:[
          {label:"Deadlift",             reps:`4×${isRecovery?4:6}`,  note:`~${dl}kg${isRecovery?", easy":""}` },
          {label:"Bulgarian Split Squat",reps:`3×${isRecovery?8:10}`, note:"Each leg" },
          {label:"Hip Thrust",           reps:`4×${isRecovery?8:10}`, note:`~${hipThr}kg` },
          {label:"Cable Row",            reps:`3×${isRecovery?10:12}`,note:"Heavy" },
          {label:"Lat Pulldown",         reps:`3×${isRecovery?10:12}`,note:"" },
          ...(w>8?[{label:"Face Pull",   reps:"3×15",                 note:"Light, high reps"}]:[]),
        ], cardio:null },
      { id:"fri-run", day:"Fri", time:"Morning", type:"run", icon:"🏃",
        title:`Run Intervals — Week ${w}`,
        sets:[], cardio:{label:"Total duration", unit:"min", placeholder:String(runMin), note:runRatio} },
      { id:"sat-bik", day:"Sat", time:"Morning", type:"bike", icon:"🚴",
        title:`Long Ride — ${longBike}min${isRecovery?" (Easy Recovery)":""}`,
        sets:[], cardio:{label:"Ride duration", unit:"min", placeholder:String(longBike),
          note:w<=8?"All Zone 2, flat terrain":w<=12?"Zone 2, start nutrition practice every 45min":"Zone 2, eat every 40min, building endurance"} },
      { id:"sun-rst", day:"Sun", time:w<=8?"—":"Morning", type:w<=8?"rest":"swim", icon:w<=8?"😴":"🏊",
        title:w<=8?"Rest / Active Recovery":`Easy OW Swim — ${Math.round(15+w*1.2)}min`,
        sets:[], cardio:w<=8?null:{label:"Easy OW swim", unit:"min", placeholder:String(Math.round(15+w*1.2)),
          note:"🌊 Easy open water recovery — no pace target, just move"} },
    ];
  }

  // ── PHASE 2: Build & Specificity (weeks 17–36) ────────────────────────────
  if(w<=36) {
    const wInPhase = w-16;
    const isRecovery = wInPhase%4===0;
    const swimM   = isRecovery ? 1600 : Math.min(2600, 1800+wInPhase*60);
    const longBikeKm = isRecovery ? 60  : Math.min(120, 55+wInPhase*4);
    const runMin  = isRecovery ? 45  : Math.min(90, 45+wInPhase*3);
    const brickTotal= isRecovery ? 90  : Math.min(185, 100+wInPhase*5);
    const dl     = Math.min(165, 148+Math.floor(wInPhase/2));
    const bench  = Math.min(108, 100+Math.floor(wInPhase/3));
    const pullW  = Math.min(22, 14+Math.floor(wInPhase/3));

    return [
      { id:"mon-str", day:"Mon", time:"Evening", type:"strength", icon:"🏋️",
        title:`Strength — Upper / Pull${isRecovery?" (Recovery)":""}`,
        sets:[
          {label:"Weighted Pull-ups", reps:`4×${isRecovery?3:5}`,  note:`+${pullW}kg` },
          {label:"Bench Press",       reps:`4×${isRecovery?3:5}`,  note:`~${bench}kg` },
          {label:"Cable Row",         reps:`3×${isRecovery?6:8}`,  note:"Heavy" },
          {label:"OHP",               reps:`3×${isRecovery?6:8}`,  note:"" },
          {label:"Face Pull",         reps:"3×15",                  note:"" },
        ], cardio:null },
      { id:"tue-swm", day:"Tue", time:"Morning", type:"swim", icon:"🏊",
        title:`Swim — ${wInPhase<=8?"Threshold":"Race Pace"} Week ${w}`,
        sets:[
          {label:"Warm-up",     reps:`${wInPhase<=8?"300":"400"}m`, note:"" },
          {label:"Main sets",   reps:`${wInPhase<=8?`5×200m`:`${Math.min(6,3+Math.floor(wInPhase/5))}×300m`}`, note:"30s rest, controlled effort" },
          {label:"Fast 100s",   reps:`${wInPhase<=8?"4":"6"}×100m`, note:"Hard" },
          {label:"Cool-down",   reps:"200m", note:"" },
        ],
        cardio:{label:"Total distance", unit:"m", placeholder:String(swimM)} },
      { id:"wed-brk", day:"Wed", time:"Evening", type:"brick", icon:"⚡",
        title:`Brick: Bike → Run — Week ${w}`,
        sets:[], cardio:{label:"Bike + Run total", unit:"min", placeholder:String(brickTotal),
          note:isRecovery?`Easy brick — ${Math.round(brickTotal*0.75)}min bike + ${Math.round(brickTotal*0.25)}min run`:`${Math.round(brickTotal*0.78)}min bike + ${Math.round(brickTotal*0.22)}min run — no break between`} },
      { id:"thu-str", day:"Thu", time:"Evening", type:"strength", icon:"🏋️",
        title:`Strength — Lower Body${isRecovery?" (Recovery)":""}`,
        sets:[
          {label:"Deadlift",             reps:`3×${isRecovery?3:5}`,  note:`~${dl}kg` },
          {label:"Bulgarian Split Squat",reps:`3×${isRecovery?6:8}`,  note:"Each leg" },
          {label:"Leg Press",            reps:`3×${isRecovery?8:10}`, note:"Heavy" },
          {label:"Nordic Curl",          reps:`3×${isRecovery?4:6}`,  note:"" },
          {label:"Hip Thrust",           reps:`3×${isRecovery?8:10}`, note:"" },
        ], cardio:null },
      { id:"fri-run", day:"Fri", time:"Morning", type:"run", icon:"🏃",
        title:`Run — ${wInPhase<=8?"Building to 10K":wInPhase<=16?"10K Consolidation":"Half Marathon Build"} Wk${w}`,
        sets:[], cardio:{label:"Duration", unit:"min", placeholder:String(runMin),
          note:isRecovery?"Easy Zone 2 — short and relaxed":wInPhase<=8?"Continuous Zone 2 — building to 10K":wInPhase<=16?"10K at comfortable pace":"Building toward half marathon distance"} },
      { id:"sat-bik", day:"Sat", time:"Morning", type:"bike", icon:"🚴",
        title:`Long Ride — ${longBikeKm}km`,
        sets:[], cardio:{label:"Distance", unit:"km", placeholder:String(longBikeKm),
          note:isRecovery?"Easy recovery ride":"Zone 2 steady — eat every 40min, hydrate well"} },
      { id:"sun-run", day:"Sun", time:"Morning", type:"run", icon:"🏃",
        title:`Long Run — ${Math.round(runMin*0.8)}min Easy`,
        sets:[], cardio:{label:"Duration", unit:"min", placeholder:String(Math.round(runMin*0.8)),
          note:"Legs heavy from Saturday ride — run slow, that's the point. Race simulation."} },
    ];
  }

  // ── PHASE 3: Race Volume (weeks 37–56) ───────────────────────────────────
  if(w<=56) {
    const wInPhase = w-36;
    const isRecovery = wInPhase%4===0;
    const isOW = w>=46; // July 2027 onward = summer OW
    const swimM    = isRecovery ? 2400 : Math.min(4000, 2600+wInPhase*80);
    const swimMin  = isRecovery ? 45   : Math.min(85, 50+wInPhase*2); // OW time targets
    const longBikeKm= isRecovery ? 100  : Math.min(175, 100+wInPhase*4);
    const longRunMin= isRecovery ? 70   : Math.min(135, 75+wInPhase*3);
    const threshMin = isRecovery ? 50   : Math.min(80,  55+wInPhase*1);
    const brickTotal= isRecovery ? 170  : Math.min(290, 190+wInPhase*5);

    return [
      { id:"mon-str", day:"Mon", time:"Evening", type:"strength", icon:"🏋️",
        title:`Strength — 1× Maintenance${w>=50?" (Last weeks — winding down)":""}`,
        sets:[
          {label:"Deadlift",          reps:"3×5", note:`~${Math.min(165,155+Math.floor(wInPhase/4))}kg` },
          {label:"Bench Press",       reps:"3×5", note:"" },
          {label:"Weighted Pull-up",  reps:"3×5", note:"" },
          {label:"Split Squat",       reps:"2×8", note:"Each leg" },
        ], cardio:null },
      { id:"tue-swm", day:"Tue", time:"Morning", type:"swim", icon:"🏊",
        title:isOW?`OW Swim — Long Effort Wk${w}`:`Swim — Long Sets Week ${w}`,
        sets: isOW?[
          {label:"Easy warm-up",      reps:"5 min",  note:"Settle into OW, check sighting lines"},
          {label:"Steady long effort", reps:`${swimMin-15} min`, note:"Controlled pace — harder than easy but sustainable. Sight every 8 strokes."},
          {label:"Race pace effort",  reps:"5 min",  note:"Push to race pace — practice positive split strategy"},
          {label:"Easy cool-down",    reps:"5 min",  note:""},
        ]:[
          {label:"Warm-up",   reps:`${wInPhase<=8?"500":"600"}m`,  note:"" },
          {label:"Main sets", reps:`${Math.min(5,3+Math.floor(wInPhase/5))}×${wInPhase<=8?"400":"500"}m`, note:"45s rest, steady effort" },
          {label:"Cool-down", reps:"200m", note:"" },
        ],
        cardio: isOW
          ? {label:"Total OW swim time", unit:"min", placeholder:String(swimMin), note:"🌊 Open water — time based. No distance needed."}
          : {label:"Total distance", unit:"m", placeholder:String(swimM)} },
      { id:"wed-brk", day:"Wed", time:"Evening", type:"brick", icon:"⚡",
        title:`Big Brick — Week ${w}`,
        sets:[], cardio:{label:"Bike + Run total", unit:"min", placeholder:String(brickTotal),
          note:isRecovery?"Recovery brick — shorter effort":`${Math.round(brickTotal*0.77)}min bike + ${Math.round(brickTotal*0.23)}min run — race simulation`} },
      { id:"thu-run", day:"Thu", time:"Morning", type:"run", icon:"🏃",
        title:`Threshold Run — Week ${w}`,
        sets:[], cardio:{label:"Duration", unit:"min", placeholder:String(threshMin),
          note:isRecovery?"Easy Zone 2 only":`${Math.round(threshMin*0.35)}min Zone 2 warm up → ${Math.round(threshMin*0.35)}min Zone 3 → ${Math.round(threshMin*0.3)}min cool down`} },
      { id:"fri-swm", day:"Fri", time:"Morning", type:"swim", icon:"🏊",
        title:`OW Swim — Navigation Wk${w}`,
        sets:[], cardio:{label:"Duration", unit:"min", placeholder:String(Math.round(35+wInPhase*1.5)),
          note:"🌊 Sight every 8 strokes. Practice race start pace first 200m then settle."} },
      { id:"sat-bik", day:"Sat", time:"Morning", type:"bike", icon:"🚴",
        title:`Long Ride — ${longBikeKm}km`,
        sets:[], cardio:{label:"Distance", unit:"km", placeholder:String(longBikeKm),
          note:isRecovery?"Easy recovery ride — Zone 2 only":longBikeKm>=150?"Peak volume ride — eat every 30min, this is race prep":"Zone 2 long ride — nutrition every 40min"} },
      { id:"sun-run", day:"Sun", time:"Morning", type:"run", icon:"🏃",
        title:`Long Run — ${longRunMin}min`,
        sets:[], cardio:{label:"Duration", unit:"min", placeholder:String(longRunMin),
          note:isRecovery?"Easy recovery run — very slow pace":"Easy pace — legs wrecked from yesterday. That's the adaptation."} },
    ];
  }

  // ── PHASE 4: Taper (weeks 57–63) ── ALL SUMMER / OW ─────────────────────
  const wInTaper = w-56;
  const bikeMin  = Math.max(45, 90-wInTaper*8);
  const runMin   = Math.max(25, 55-wInTaper*5);
  const swimMin  = Math.max(20, 45-wInTaper*5);

  return [
    { id:"mon-rst", day:"Mon", time:"—", type:"rest", icon:"😴",
      title:`Full Rest — Taper Week ${wInTaper}`,
      sets:[], cardio:null },
    { id:"tue-swm", day:"Tue", time:"Morning", type:"swim", icon:"🏊",
      title:`OW Swim — Sharp & Short Wk${w}`,
      sets:[
        {label:"Easy warm-up",    reps:"5 min",  note:"Get in, settle, feel the water"},
        {label:"Race pace bursts",reps:`3×3 min`, note:"Race effort with 2 min easy between — feel fast"},
        {label:"Easy cool-down",  reps:"5 min",  note:""},
      ],
      cardio:{label:"Total OW swim time", unit:"min", placeholder:String(swimMin),
        note:"🌊 Open water — time based. Feel fast and smooth, not grinding."} },
    { id:"wed-bik", day:"Wed", time:"Evening", type:"bike", icon:"🚴",
      title:`Bike — ${bikeMin}min, Stay Sharp`,
      sets:[], cardio:{label:"Duration", unit:"min", placeholder:String(bikeMin),
        note:`${Math.round(bikeMin*0.7)}min easy + ${Math.round(bikeMin*0.3)}min race pace efforts`} },
    { id:"thu-run", day:"Thu", time:"Morning", type:"run", icon:"🏃",
      title:`Easy Run — ${runMin}min`,
      sets:[], cardio:{label:"Duration", unit:"min", placeholder:String(runMin),
        note:wInTaper>=5?"Short and easy. Legs should feel springy.":"Keep it easy — absorbing the training."} },
    { id:"fri-swm", day:"Fri", time:"Morning", type:"swim", icon:"🏊",
      title:`OW Shake-Out${w>=62?" — Race Week":""}`,
      sets:[], cardio:{label:"Duration", unit:"min", placeholder:String(Math.max(15,30-wInTaper*3)),
        note:"🌊 Easy open water. Visualise your race swim. You know this water."} },
    { id:"sat-brk", day:"Sat", time:"Morning", type:"brick", icon:"⚡",
      title:w>=62?"Race Simulation Brick — Final":"Brick — Stay Sharp",
      sets:[], cardio:{label:"Bike + Run total", unit:"min", placeholder:String(Math.max(60,130-wInTaper*15)),
        note:`${Math.max(40,90-wInTaper*10)}min bike + ${Math.max(20,40-wInTaper*5)}min run. Full race kit.`} },
    { id:"sun-rst", day:"Sun", time:"—", type:"rest", icon:"😴",
      title:w===63?"REST — RACE TOMORROW 🏁":"Full Rest",
      sets:[], cardio:null },
  ];
}

// Build schedule cache for all 63 weeks
const WEEK_SCHEDULES = {};
for(let w=1; w<=63; w++) WEEK_SCHEDULES[w] = makeWeek(w);

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
function getSchedKey(w) { return Math.min(63, Math.max(1, w)); }

// Week calculation from training start date
const TRAINING_START = new Date("2026-06-08");
function getCurrentTrainingWeek() {
  const now = new Date();
  const diff = now - TRAINING_START;
  const week = Math.floor(diff / (1000*60*60*24*7)) + 1;
  return Math.min(63, Math.max(1, week));
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

// ─── STRETCHING LIBRARY ──────────────────────────────────────────────────────

const STRETCH_ROUTINES = {
  postRun: {
    label:"Post-Run Recovery",
    icon:"🏃",
    color:"#ea580c",
    duration:"15–20 min",
    note:"Do this within 10 minutes of finishing any run. Muscles are warm — this is when stretching actually works.",
    stretches:[
      {name:"Standing quad stretch",     duration:"60s each",  icon:"🦵", desc:"Stand on one leg, pull heel to glute. Keep knees together and stand tall. Hold 60s each side × 2. Non-negotiable after runs."},
      {name:"Hip flexor lunge stretch",  duration:"60s each",  icon:"🧘", desc:"Low lunge, back knee on ground, push hips forward. Lean back slightly for deeper stretch. 60s each side. Runners chronically tight here."},
      {name:"Pigeon pose",               duration:"90s each",  icon:"🕊️", desc:"Front shin parallel to top of mat, sink hips down. The gold standard for glute and piriformis. 90s each side — don't rush it."},
      {name:"Seated hamstring stretch",  duration:"60s each",  icon:"⬇️", desc:"Sit on floor, one leg extended. Hinge forward at hip (not spine), reach toward foot. Feel stretch in back of thigh, not lower back."},
      {name:"Calf stretch — straight",   duration:"45s each",  icon:"👟", desc:"Hands on wall, back leg straight, heel flat on floor. Lean into wall. 45s each side. Prevents Achilles issues under high mileage."},
      {name:"Calf stretch — bent knee",  duration:"45s each",  icon:"👟", desc:"Same position, slight bend in back knee. Targets soleus (deeper calf). Often the tighter of the two. 45s each side."},
      {name:"Figure-4 glute stretch",    duration:"60s each",  icon:"🔄", desc:"Lying on back, cross ankle over opposite knee, pull both toward chest. Gentle hip rotation. 60s each side."},
    ]
  },
  postBike: {
    label:"Post-Bike Recovery",
    icon:"🚴",
    color:"#16a34a",
    duration:"15 min",
    note:"After long rides your hip flexors and lower back lock up fast. Do this before they stiffen.",
    stretches:[
      {name:"Hip flexor stretch",        duration:"90s each",  icon:"🦵", desc:"Low lunge, really sink the hips down. After 3+ hours on the bike this will feel tight. 90s each side, no rushing."},
      {name:"Pigeon pose",               duration:"90s each",  icon:"🕊️", desc:"Essential after cycling. Glutes work hard on long rides. 90s each side."},
      {name:"Cat-cow",                   duration:"2 min",     icon:"🐱", desc:"On hands and knees: arch back up (cat), drop belly down (cow). 10 slow reps. Decompresses the lumbar spine after riding position."},
      {name:"Thread the needle",         duration:"45s each",  icon:"🧵", desc:"On hands and knees, slide one arm under body along floor. Thoracic rotation — counteracts the hunched bike position."},
      {name:"Doorframe chest opener",    duration:"60s each",  icon:"🚪", desc:"Arm at 90° on doorframe, rotate body away. Opens chest and anterior shoulder, compressed during cycling. 60s each side."},
      {name:"Standing forward fold",     duration:"60s",       icon:"⬇️", desc:"Feet hip-width, fold forward, arms heavy. Slight bend in knees. Decompresses spine and hamstrings."},
      {name:"Neck side stretch",         duration:"30s each",  icon:"😌", desc:"Tilt ear to shoulder gently, breathe. Cycling neck position creates tension here. 30s each side × 2."},
    ]
  },
  postSwim: {
    label:"Post-Swim Stretch",
    icon:"🏊",
    color:"#0891b2",
    duration:"10 min",
    note:"Shorter routine — swimming is lower impact. Focus on shoulders and lats which work hard in freestyle.",
    stretches:[
      {name:"Cross-body shoulder stretch",duration:"30s each", icon:"💪", desc:"Pull one arm across chest, hold at elbow. 30s each side × 2. Shoulder capsule stretch."},
      {name:"Doorframe chest stretch",   duration:"45s each",  icon:"🚪", desc:"Opens the anterior shoulder and pec — compressed during catch phase of freestyle."},
      {name:"Lat stretch on wall",       duration:"30s each",  icon:"🧗", desc:"Place hand on wall at shoulder height, step forward and rotate away. Lats work extremely hard in swimming."},
      {name:"Child's pose",              duration:"60s",       icon:"🧘", desc:"Kneel, sit back on heels, arms extended forward on floor. Full spine and lat decompression."},
      {name:"Neck rotation",             duration:"30s each",  icon:"🔄", desc:"Slow head rotation side to side. Bilateral breathing in freestyle creates neck imbalance over time."},
    ]
  },
  fullBody: {
    label:"Full Body Mobility",
    icon:"🌟",
    color:"#7c3aed",
    duration:"25–30 min",
    note:"Do this on rest days. The single best thing you can do for long-term injury prevention across 15 months of triathlon training.",
    stretches:[
      {name:"World's greatest stretch",  duration:"5 each side",icon:"🌍", desc:"Step into lunge, place same-side hand on floor, rotate opposite arm to sky. Hold 3s at top. Best single mobility exercise for triathletes."},
      {name:"90/90 hip stretch",         duration:"90s each",  icon:"🧘", desc:"Both knees at 90°, front shin parallel to front, rear shin to side. Sit tall. Works both internal and external hip rotation. Game changer for runners."},
      {name:"Pigeon pose",               duration:"2 min each",icon:"🕊️", desc:"Front shin parallel, sink hips down fully. 2 minutes each side for the full body routine — hold longer than you think."},
      {name:"Hip flexor lunge",          duration:"90s each",  icon:"🦵", desc:"Low lunge with back knee down. Add a gentle back bend for deeper stretch. Critical for desk workers and drivers."},
      {name:"Seated forward fold",       duration:"90s",       icon:"⬇️", desc:"Both legs extended, hinge at hips. Use a strap or towel around feet if needed. Pure hamstring."},
      {name:"Thread the needle",         duration:"45s each",  icon:"🧵", desc:"Thoracic rotation on hands and knees. Do 5 reps slowly each side before holding."},
      {name:"Doorframe chest opener",    duration:"60s each",  icon:"🚪", desc:"Opens chest and anterior shoulder. Iron man training closes you up — this fights that."},
      {name:"Lat stretch",               duration:"45s each",  icon:"🧗", desc:"One hand on wall, step forward and rotate. Lats restrict shoulder mobility when tight."},
      {name:"Calf and Achilles stretch", duration:"45s each",  icon:"👟", desc:"Both variants: straight leg and bent knee. High running volume is brutal on calves."},
      {name:"Supine twist",              duration:"60s each",  icon:"🌀", desc:"Lying on back, bring one knee across body to floor while keeping shoulder down. Decompresses lumbar spine."},
    ]
  },
  morning: {
    label:"Morning Wake-Up",
    icon:"🌅",
    color:"#f59e0b",
    duration:"8–10 min",
    note:"Before you get out of bed or right after. Gets blood moving before early morning sessions. Do this before every morning swim or run.",
    stretches:[
      {name:"Knee to chest",             duration:"30s each",  icon:"🧘", desc:"Lying on back, pull one knee gently to chest. Releases overnight lumbar compression. 30s each side."},
      {name:"Supine twist",              duration:"30s each",  icon:"🌀", desc:"Knee across body, both shoulders on floor. Wakes up the spine before loading it."},
      {name:"Cat-cow × 10",              duration:"1 min",     icon:"🐱", desc:"Slow and deliberate. Lubricates the facet joints. Do this every single morning."},
      {name:"Hip circles standing",      duration:"30s each",  icon:"🔄", desc:"Hands on hips, slow large circles. 10 each direction. Warms up the hip joint capsule."},
      {name:"Arm circles",               duration:"30s each",  icon:"💫", desc:"Forward and backward. Warms shoulder joint before swimming. 15 each direction."},
      {name:"Ankle circles",             duration:"20s each",  icon:"👟", desc:"Seated or standing, rotate ankle slowly. Important before running, especially early morning."},
    ]
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
  const [showRetro, setShowRetro] = useState(false);

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

  // Auto-persist every change to set logs, cardio, and notes — so nothing is lost on navigation
  const autoSaveRef = useRef(false);
  useEffect(() => {
    if(!skey) return;
    // Skip the very first run right after loading from storage (avoids overwriting with empty initial state)
    if(!autoSaveRef.current) { autoSaveRef.current = true; return; }
    const existing = LS.get(skey) || {};
    LS.set(skey, { ...existing, cardioVal, setLogs, notes, done: existing.done||false });
  }, [cardioVal, setLogs, notes]);
  useEffect(() => { autoSaveRef.current = false; }, [skey]);

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
          const sc = WEEK_SCHEDULES[getSchedKey(w)];
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

      {/* Retroactive log modal */}
      {showRetro && <RetroactiveLog currentWeek={currentWeek} onClose={()=>setShowRetro(false)}/>}

      <div style={{padding:"14px 16px"}}>
        {/* Missed workout button */}
        <button onClick={()=>setShowRetro(true)}
          style={{width:"100%",background:"rgba(245,158,11,0.08)",border:"1px solid #92400e",borderRadius:10,padding:"9px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10,cursor:"pointer",textAlign:"left"}}>
          <span style={{fontSize:18}}>📝</span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:600,color:"#fcd34d"}}>Log a missed workout</div>
            <div style={{fontSize:11,color:"#92400e",marginTop:1}}>Retroactively record any past session</div>
          </div>
          <span style={{color:"#92400e",fontSize:12}}>→</span>
        </button>

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
                  <div style={{position:"relative"}}>
                    <input
                      type="number" inputMode="decimal"
                      placeholder={ts.cardio.placeholder}
                      value={cardioVal}
                      onChange={e=>setCardioVal(e.target.value)}
                      style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.08)",border:`1px solid ${style.border}`,borderRadius:9,padding:"12px 56px 12px 12px",color:"#e2e8f0",fontSize:22,fontWeight:800,textAlign:"center"}}
                    />
                    <div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",textAlign:"center",pointerEvents:"none"}}>
                      <div style={{fontSize:13,color:style.text,fontWeight:700,lineHeight:1}}>{ts.cardio.unit}</div>
                      <div style={{fontSize:9,color:"#475569",marginTop:2,whiteSpace:"nowrap"}}>{ts.cardio.label}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {skey && <RPELogger sessionKey={skey} />}
            {skey && <WeatherLog sessionKeyStr={skey} />}
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
  const realWeek = getCurrentTrainingWeek();
  const isFuture = currentWeek > realWeek;
  const isPast   = currentWeek < realWeek;

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
  // Only count dots for current/past weeks — future weeks show empty dots
  const doneCount = isFuture ? 0 : nonRest.filter(s=>completed[s.id]).length;

  return (
    <div style={{paddingBottom:90}}>
      <div style={{background:`linear-gradient(135deg,#0f172a,${phase.dim})`,padding:"20px 16px 14px",borderBottom:"1px solid #1e293b"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:11,color:phase.color,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Phase {phase.id} · {phase.range}</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{fontSize:24,fontWeight:800}}>Week {currentWeek}</div>
              {isFuture && <span style={{background:"#1e293b",border:"1px solid #334155",borderRadius:20,padding:"2px 10px",fontSize:11,color:"#475569"}}>Preview</span>}
              {currentWeek===realWeek && <span style={{background:"rgba(124,58,237,0.2)",border:"1px solid #7c3aed",borderRadius:20,padding:"2px 10px",fontSize:11,color:"#c084fc"}}>Current</span>}
              {isPast && <span style={{background:"rgba(16,185,129,0.1)",border:"1px solid #059669",borderRadius:20,padding:"2px 10px",fontSize:11,color:"#86efac"}}>Past</span>}
            </div>
          </div>
          <div style={{display:"flex",gap:6,marginTop:4}}>
            <button onClick={()=>setCurrentWeek(w=>Math.max(1,w-1))} style={{background:"#1e293b",border:"none",color:"#94a3b8",borderRadius:8,width:36,height:36,cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
            <button onClick={()=>setCurrentWeek(w=>Math.min(63,w+1))} style={{background:"#1e293b",border:"none",color:"#94a3b8",borderRadius:8,width:36,height:36,cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
          </div>
        </div>
        <div style={{marginTop:12,background:"rgba(0,0,0,0.3)",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:13,color:"#94a3b8"}}>
            {isFuture ? `Upcoming — ${nonRest.length} sessions planned` : `${doneCount}/${nonRest.length} sessions completed`}
          </span>
          <div style={{display:"flex",gap:4}}>
            {nonRest.map(s=>(
              <div key={s.id} style={{width:10,height:10,borderRadius:"50%",
                background: isFuture ? "#1e293b" : completed[s.id] ? phase.color : "#1e293b",
                border:`1px solid ${isFuture ? "#334155" : completed[s.id] ? phase.color : "#334155"}`
              }}/>
            ))}
          </div>
        </div>
        {isFuture && (
          <div style={{marginTop:8,background:"rgba(71,85,105,0.2)",borderRadius:8,padding:"7px 12px",fontSize:11,color:"#475569",textAlign:"center"}}>
            👀 Preview mode — you can browse but not log future weeks
          </div>
        )}
      </div>

      <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:8}}>
        {schedule.map((s,i) => {
          const st = TYPE_STYLE[s.type]||TYPE_STYLE.rest;
          const isOpen = expanded===i;
          const isDone = !isFuture && completed[s.id];
          return (
            <div key={i} onClick={()=>setExpanded(isOpen?null:i)}
              style={{background:isOpen?st.bg:"rgba(255,255,255,0.03)",border:`1px solid ${isOpen?st.border:"#1e293b"}`,borderRadius:12,padding:"12px 14px",cursor:"pointer",transition:"all 0.2s",opacity:isFuture?0.7:1}}>
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
                  <div style={{marginTop:10,fontSize:12,color:isFuture?"#334155":"#475569",textAlign:"center"}}>
                    {isFuture ? "🔒 Log opens when this week arrives" : "Log this session in the Today tab"}
                  </div>
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
        <MilestoneCountdown currentWeek={currentWeek}/>
        <TrainingLoad currentWeek={currentWeek}/>
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
  // Always show stats for the REAL current training week, not whatever week is being browsed
  const realWeek = getCurrentTrainingWeek();
  const sched = WEEK_SCHEDULES[realWeek<=8?"1-8":realWeek<=16?"9-16":realWeek<=28?"17-28":realWeek<=36?"29-36":realWeek<=56?"37-56":"57-63"];
  const nonRest = sched.filter(s=>s.type!=="rest");
  const done = nonRest.filter(s=>LS.get(sessionKey(realWeek,s.id))?.done).length;
  const travelDone = nonRest.filter(s=>{
    const tkey=`im_travel_${realWeek}_${s.day}`;
    const t=LS.get(tkey);
    return t&&(t.travelMode==="alternative"||t.travelMode==="custom"||t.travelMode==="postpone");
  }).length;
  const effective = Math.min(nonRest.length, done + travelDone);

  // Streak counts only past weeks that are fully in the past
  let streak = 0;
  for(let w=realWeek; w>=1; w--) {
    const sc = WEEK_SCHEDULES[w<=8?"1-8":w<=16?"9-16":w<=28?"17-28":w<=36?"29-36":w<=56?"37-56":"57-63"];
    const nr = sc.filter(s=>s.type!=="rest");
    const d  = nr.filter(s=>LS.get(sessionKey(w,s.id))?.done).length;
    if(d >= Math.ceil(nr.length*0.6)) streak++; else if(w<realWeek) break;
  }

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
      <div style={{background:"rgba(37,99,235,0.1)",border:"1px solid #1d4ed8",borderRadius:12,padding:"12px 14px",textAlign:"center"}}>
        <div style={{fontSize:10,color:"#3b82f6",letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Week {realWeek}</div>
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

// ─── RACE PACING DATA ─────────────────────────────────────────────────────────

const PACING_SPLITS = [
  { leg:"🏊 Swim", target:"1:30:00", detail:"2:22/100m", color:"#0891b2",
    tips:[
      "Seed yourself in the middle-back of your wave — not the front",
      "First 400m will feel slow — that's correct, let faster swimmers go",
      "Sight every 8–10 strokes, aim for buoys not the shore",
      "Draft off feet of someone slightly faster if you can find them",
      "Exit the water calm — your HR will be elevated, walk T1 entrance",
    ]},
  { leg:"⚡ T1", target:"8:00", detail:"Swim → Bike", color:"#6366f1",
    tips:[
      "Wetsuit off as you jog — practise this in training",
      "Helmet on and clipped BEFORE touching the bike (DQ rule)",
      "Don't rush — 30 extra seconds here saves nothing",
      "Sunglasses, gloves, shoes — know your sequence cold",
    ]},
  { leg:"🚴 Bike", target:"6:30:00", detail:"27.7 km/h avg", color:"#16a34a",
    tips:[
      "First 60km: feel easy, almost boring. HR zone 2 only.",
      "Eat at km 20, 40, 60, 80, 100, 120, 140, 160 — every 20km",
      "Target 60–80g carbs/hour: gels + bars + sports drink",
      "Don't chase faster cyclists early — you'll pay on the run",
      "Km 90–120 is when legs feel heavy — stay patient, it passes",
      "Save 15% for last 30km — controlled push to T2",
      "Drink 500–750ml per hour, more if hot",
    ]},
  { leg:"⚡ T2", target:"6:00", detail:"Bike → Run", color:"#6366f1",
    tips:[
      "Rack bike, helmet off, race belt on, running shoes on",
      "Grab run nutrition — gels in pocket, nothing else needed",
      "Start the run SLOW — first km will feel terrible, that's normal",
    ]},
  { leg:"🏃 Run", target:"4:30:00", detail:"6:24/km", color:"#ea580c",
    tips:[
      "First 5km: slower than target pace. Let legs wake up.",
      "Walk every aid station — take 45–60s, drink, walk out, run again",
      "Cola + water at aid stations from km 25 onward — works remarkably well",
      "Run 8 min / walk 1 min if needed — still hits 6:24/km avg",
      "At km 30 you will want to stop. Don't. It gets better at km 35.",
      "Final 2km: empty the tank. This is what 15 months was for.",
    ]},
];

const NUTRITION_PLAN = [
  { phase:"Race morning (3hrs before)", items:[
    "Large bowl of oats or rice with banana — 150–200g carbs",
    "500ml water with electrolytes",
    "Coffee if that's your normal — race day is not the day to skip it",
    "Nothing new, nothing experimental",
  ]},
  { phase:"Pre-swim (30 min before)", items:[
    "1 gel with 200ml water",
    "Sip electrolyte drink — don't overdrink",
  ]},
  { phase:"On the bike (every 20–30 min)", items:[
    "Alternate between gel (25g carbs) and banana/bar (30–40g carbs)",
    "Sports drink instead of plain water where available",
    "Target: 70g carbs/hour = roughly 1 gel + 1 banana per hour",
    "Salt tablets if sweating heavily (every 45–60 min in heat)",
  ]},
  { phase:"On the run (every aid station)", items:[
    "Small cup cola + small cup water — sip don't gulp",
    "1 gel every 40–45 min for first 25km",
    "From km 25: cola is your best friend — sugar + caffeine",
    "If stomach turns — switch to water only, walk, reset",
  ]},
];

function RaceView({ currentWeek }) {
  const [subTab, setSubTab] = useState("pacing");
  const [checks, setChecks] = useState(()=>LS.get("im_race_checklist")||{});
  const [expandedLeg, setExpandedLeg] = useState(null);
  const [expandedNutr, setExpandedNutr] = useState(null);
  const isRaceWeek = currentWeek >= 62;

  const toggle = (dayI, itemI) => {
    const k = `${dayI}_${itemI}`;
    const updated = {...checks, [k]:!checks[k]};
    setChecks(updated);
    LS.set("im_race_checklist", updated);
  };

  const totalItems = RACE_CHECKLIST.reduce((a,d)=>a+d.items.length,0);
  const doneItems  = Object.values(checks).filter(Boolean).length;

  // Target finish time breakdown
  const totalMins = 90 + 8 + 390 + 6 + 270; // 764 min = 12:44
  const hrs = Math.floor(totalMins/60);
  const mins = totalMins % 60;

  return (
    <div style={{paddingBottom:90}}>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#1a0533,#2e1065)",padding:"20px 16px 14px",borderBottom:"1px solid #4c1d95"}}>
        <div style={{fontSize:11,color:"#8b5cf6",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Race Day</div>
        <div style={{fontSize:24,fontWeight:800}}>Ironman Emilia-Romagna</div>
        <div style={{fontSize:13,color:"#7c3aed",marginTop:2}}>14 September 2027 · Cervia, Italy · Target: Sub-13</div>

        {/* Target time display */}
        <div style={{marginTop:12,background:"rgba(124,58,237,0.2)",border:"1px solid #6d28d9",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:11,color:"#8b5cf6",letterSpacing:1,textTransform:"uppercase"}}>Target finish</div>
            <div style={{fontSize:28,fontWeight:800,color:"#c084fc",letterSpacing:-1}}>{hrs}h {mins}m</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11,color:"#6d28d9",marginBottom:4}}>Goal time</div>
            <div style={{fontSize:14,fontWeight:700,color:"#a78bfa"}}>Sub-13:00</div>
            <div style={{fontSize:11,color:"#6d28d9",marginTop:2}}>+16 min buffer</div>
          </div>
        </div>
      </div>

      {/* Sub-tab nav */}
      <div style={{display:"flex",borderBottom:"1px solid #1e293b",background:"#0d1117"}}>
        {[["pacing","⚡ Pacing"],["nutrition","🍌 Nutrition"],["checklist","✅ Checklist"]].map(([id,label])=>(
          <button key={id} onClick={()=>setSubTab(id)}
            style={{flex:1,background:"none",border:"none",borderBottom:subTab===id?"2px solid #7c3aed":"2px solid transparent",color:subTab===id?"#e2e8f0":"#64748b",padding:"12px 8px",fontSize:12,cursor:"pointer",fontWeight:subTab===id?700:400}}>
            {label}
          </button>
        ))}
      </div>

      {/* PACING TAB */}
      {subTab==="pacing" && (
        <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:"rgba(37,99,235,0.08)",border:"1px solid #1e3a5f",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#93c5fd",lineHeight:1.6,marginBottom:4}}>
            💡 <strong>The golden rule:</strong> The bike makes or breaks your race. Go out easy, build through, empty the tank on the run. Every minute saved on the bike by going too hard costs 3 minutes on the run.
          </div>

          {PACING_SPLITS.map((s,i)=>{
            const isOpen = expandedLeg===i;
            return (
              <div key={i} onClick={()=>setExpandedLeg(isOpen?null:i)}
                style={{background:isOpen?`${s.color}18`:"rgba(255,255,255,0.03)",border:`1px solid ${isOpen?s.color:"#1e293b"}`,borderRadius:12,padding:"12px 14px",cursor:"pointer",transition:"all 0.2s"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontWeight:700,fontSize:15}}>{s.leg}</span>
                      <span style={{fontWeight:800,fontSize:16,color:s.color}}>{s.target}</span>
                    </div>
                    <div style={{fontSize:11,color:"#64748b"}}>{s.detail}</div>
                  </div>
                  <span style={{color:"#334155",fontSize:12,flexShrink:0}}>{isOpen?"▲":"▼"}</span>
                </div>

                {isOpen && (
                  <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${s.color}30`}}>
                    <div style={{fontSize:11,color:s.color,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Race tips</div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {s.tips.map((tip,j)=>(
                        <div key={j} style={{display:"flex",gap:8,fontSize:13,color:"#94a3b8",lineHeight:1.5}}>
                          <span style={{color:s.color,flexShrink:0,marginTop:1}}>→</span>
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Total time bar */}
          <div style={{background:"rgba(124,58,237,0.1)",border:"1px solid #6d28d9",borderRadius:12,padding:"12px 14px",marginTop:4}}>
            <div style={{fontSize:11,color:"#8b5cf6",letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Time breakdown</div>
            <div style={{display:"flex",gap:2,height:20,borderRadius:6,overflow:"hidden",marginBottom:8}}>
              {[
                {w:90,  color:"#0891b2", label:"Swim"},
                {w:8,   color:"#6366f1", label:"T1"},
                {w:390, color:"#16a34a", label:"Bike"},
                {w:6,   color:"#6366f1", label:"T2"},
                {w:270, color:"#ea580c", label:"Run"},
              ].map((seg,i)=>(
                <div key={i} style={{width:`${(seg.w/totalMins)*100}%`,background:seg.color,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {seg.w>20 && <span style={{fontSize:8,color:"rgba(255,255,255,0.8)",fontWeight:700,whiteSpace:"nowrap"}}>{seg.label}</span>}
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4}}>
              {[
                {label:"Swim",color:"#0891b2",time:"1:30"},
                {label:"T1",  color:"#6366f1",time:"0:08"},
                {label:"Bike",color:"#16a34a",time:"6:30"},
                {label:"T2",  color:"#6366f1",time:"0:06"},
                {label:"Run", color:"#ea580c",time:"4:30"},
              ].map((s,i)=>(
                <div key={i} style={{textAlign:"center"}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:s.color,margin:"0 auto 3px"}}/>
                  <div style={{fontSize:9,color:"#64748b"}}>{s.label}</div>
                  <div style={{fontSize:11,fontWeight:700,color:"#e2e8f0"}}>{s.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Key numbers */}
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid #1e293b",borderRadius:12,padding:"12px 14px"}}>
            <div style={{fontSize:11,color:"#64748b",letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Key training benchmarks</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[
                {icon:"🏊",label:"Swim — ready when:",bench:"1500m in pool under 40min"},
                {icon:"🚴",label:"Bike — ready when:",bench:"150km training ride under 6hrs"},
                {icon:"🏃",label:"Run — ready when:",bench:"Half marathon standalone under 2:10"},
                {icon:"⚡",label:"Brick — ready when:",bench:"3hr ride + 45min run feels manageable"},
              ].map((b,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:18,flexShrink:0}}>{b.icon}</span>
                  <div>
                    <div style={{fontSize:11,color:"#64748b"}}>{b.label}</div>
                    <div style={{fontSize:13,fontWeight:600,color:"#e2e8f0"}}>{b.bench}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NUTRITION TAB */}
      {subTab==="nutrition" && (
        <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid #92400e",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#fcd34d",lineHeight:1.6,marginBottom:4}}>
            🍌 <strong>Nothing new on race day.</strong> Every gel, bar, and drink you use on race day must be tested in long training sessions first. Start practising race nutrition from Phase 2 onward.
          </div>
          {NUTRITION_PLAN.map((n,i)=>{
            const isOpen = expandedNutr===i;
            return (
              <div key={i} onClick={()=>setExpandedNutr(isOpen?null:i)}
                style={{background:isOpen?"rgba(245,158,11,0.08)":"rgba(255,255,255,0.03)",border:`1px solid ${isOpen?"#d97706":"#1e293b"}`,borderRadius:12,padding:"12px 14px",cursor:"pointer",transition:"all 0.2s"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{fontWeight:700,fontSize:14,color:isOpen?"#fcd34d":"#e2e8f0"}}>{n.phase}</div>
                  <span style={{color:"#334155",fontSize:12}}>{isOpen?"▲":"▼"}</span>
                </div>
                {isOpen && (
                  <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #d9770630",display:"flex",flexDirection:"column",gap:6}}>
                    {n.items.map((item,j)=>(
                      <div key={j} style={{display:"flex",gap:8,fontSize:13,color:"#94a3b8",lineHeight:1.5}}>
                        <span style={{color:"#f59e0b",flexShrink:0,marginTop:1}}>→</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div style={{background:"rgba(16,185,129,0.08)",border:"1px solid #065f46",borderRadius:12,padding:"12px 14px"}}>
            <div style={{fontWeight:700,fontSize:13,color:"#86efac",marginBottom:8}}>📊 Total race day carb target</div>
            {[
              {label:"Bike (6.5hrs × 70g)",val:"~455g carbs"},
              {label:"Run (4.5hrs × 50g)", val:"~225g carbs"},
              {label:"Total",              val:"~680g carbs",bold:true},
            ].map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:i<2?"1px solid rgba(255,255,255,0.04)":"none"}}>
                <span style={{fontSize:13,color:"#64748b"}}>{r.label}</span>
                <span style={{fontSize:13,fontWeight:r.bold?800:600,color:r.bold?"#86efac":"#e2e8f0"}}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHECKLIST TAB */}
      {subTab==="checklist" && (
        <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
          {!isRaceWeek && (
            <div style={{background:"rgba(124,58,237,0.15)",border:"1px solid #4c1d95",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#a78bfa"}}>
              Checklist activates in week 62. You're in week {currentWeek} — keep training!
            </div>
          )}
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#64748b",marginBottom:2}}>
            <span>{doneItems}/{totalItems} items checked</span>
            <span>{Math.round((doneItems/totalItems)*100)}%</span>
          </div>
          <div style={{background:"#1e293b",borderRadius:4,height:4,overflow:"hidden",marginBottom:8}}>
            <div style={{background:"linear-gradient(90deg,#7c3aed,#c084fc)",height:"100%",borderRadius:4,width:`${(doneItems/totalItems)*100}%`,transition:"width 0.3s"}}/>
          </div>
          {RACE_CHECKLIST.map((section,di)=>{
            const sectionDone = section.items.filter((_,ii)=>checks[`${di}_${ii}`]).length;
            return (
              <div key={di} style={{background:"rgba(255,255,255,0.03)",border:"1px solid #1e293b",borderRadius:12,padding:14,opacity:isRaceWeek?1:0.5}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:20}}>{section.icon}</span>
                    <div style={{fontWeight:700,fontSize:14,color:"#c084fc"}}>{section.day}</div>
                  </div>
                  <span style={{fontSize:12,color:"#475569"}}>{sectionDone}/{section.items.length}</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {section.items.map((item,ii)=>{
                    const isDone = checks[`${di}_${ii}`];
                    return (
                      <div key={ii} onClick={()=>isRaceWeek&&toggle(di,ii)}
                        style={{display:"flex",alignItems:"flex-start",gap:10,background:isDone?"rgba(16,185,129,0.08)":"transparent",borderRadius:8,padding:"7px 10px",cursor:isRaceWeek?"pointer":"default",transition:"background 0.15s"}}>
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
      )}
    </div>
  );
}

// ─── STRETCHING VIEW ─────────────────────────────────────────────────────────

function StretchingView({ embedded }) {
  const [activeRoutine, setActiveRoutine] = useState("fullBody");
  const [checked, setChecked] = useState({});
  const [savedRoutine, setSavedRoutine] = useState(null);

  const today = new Date().toISOString().split("T")[0];
  const skey = `im_stretch_${today}`;

  useEffect(()=>{
    const d = LS.get(skey);
    if(d){ setChecked(d.checked||{}); setSavedRoutine(d.routine||null); if(d.routine) setActiveRoutine(d.routine); }
  },[]);

  const routine = STRETCH_ROUTINES[activeRoutine];
  const doneCount = routine.stretches.filter((_,i)=>checked[`${activeRoutine}_${i}`]).length;

  const toggle = (i) => {
    const k = `${activeRoutine}_${i}`;
    const updated = {...checked, [k]:!checked[k]};
    setChecked(updated);
    LS.set(skey, { checked:updated, routine:activeRoutine, savedAt:new Date().toISOString() });
  };

  const markAllDone = () => {
    const updated = {...checked};
    routine.stretches.forEach((_,i)=>{ updated[`${activeRoutine}_${i}`]=true; });
    setChecked(updated);
    setSavedRoutine(activeRoutine);
    LS.set(skey, { checked:updated, routine:activeRoutine, savedAt:new Date().toISOString() });
  };

  return (
    <div style={{paddingBottom:embedded?0:90}}>
      {!embedded && <div style={{background:"linear-gradient(135deg,#0f172a,#1a1a2e)",padding:"20px 16px 14px",borderBottom:"1px solid #1e293b"}}>
        <div style={{fontSize:11,color:"#8b5cf6",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Recovery</div>
        <div style={{fontSize:24,fontWeight:800}}>Stretching</div>
        <div style={{fontSize:13,color:"#64748b"}}>Mobility routines for every training situation</div>
      </div>}

      <div style={{padding:embedded?"0":"14px 16px"}}>
        {/* Routine picker */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
          {Object.entries(STRETCH_ROUTINES).map(([key,r])=>(
            <button key={key} onClick={()=>{ setActiveRoutine(key); setChecked(c=>c); }}
              style={{background:activeRoutine===key?r.color+"25":"rgba(255,255,255,0.03)",border:`1px solid ${activeRoutine===key?r.color:"#1e293b"}`,borderRadius:10,padding:"10px 12px",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
              <div style={{fontSize:18,marginBottom:4}}>{r.icon}</div>
              <div style={{fontSize:12,fontWeight:700,color:activeRoutine===key?"#e2e8f0":"#94a3b8",lineHeight:1.3}}>{r.label}</div>
              <div style={{fontSize:10,color:"#475569",marginTop:2}}>⏱ {r.duration}</div>
            </button>
          ))}
        </div>

        {/* Routine header */}
        <div style={{background:`linear-gradient(135deg,rgba(0,0,0,0.4),${routine.color}15)`,border:`1px solid ${routine.color}40`,borderLeft:`3px solid ${routine.color}`,borderRadius:12,padding:"12px 14px",marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <div style={{fontWeight:700,fontSize:15}}>{routine.icon} {routine.label}</div>
            <span style={{fontSize:12,color:routine.color,fontWeight:600}}>{doneCount}/{routine.stretches.length}</span>
          </div>
          <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.5,marginBottom:10}}>{routine.note}</div>
          {/* Progress bar */}
          <div style={{background:"#1e293b",borderRadius:3,height:4,overflow:"hidden"}}>
            <div style={{background:routine.color,height:"100%",borderRadius:3,width:`${(doneCount/routine.stretches.length)*100}%`,transition:"width 0.3s"}}/>
          </div>
        </div>

        {/* Stretches */}
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
          {routine.stretches.map((s,i)=>{
            const k = `${activeRoutine}_${i}`;
            const isDone = checked[k];
            return (
              <div key={i} onClick={()=>toggle(i)}
                style={{background:isDone?"rgba(16,185,129,0.08)":"rgba(255,255,255,0.03)",border:`1px solid ${isDone?"#059669":"#1e293b"}`,borderRadius:12,padding:"12px 14px",cursor:"pointer",transition:"all 0.2s"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:isDone?"#059669":"transparent",border:`2px solid ${isDone?"#10b981":"#334155"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,fontSize:12,color:"#fff",fontWeight:700}}>
                    {isDone?"✓":""}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:16}}>{s.icon}</span>
                        <span style={{fontWeight:700,fontSize:13,color:isDone?"#86efac":"#e2e8f0"}}>{s.name}</span>
                      </div>
                      <span style={{fontSize:11,color:routine.color,fontWeight:600,flexShrink:0}}>{s.duration}</span>
                    </div>
                    <div style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>{s.desc}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={markAllDone}
          style={{width:"100%",background:doneCount===routine.stretches.length?"#14532d":"linear-gradient(135deg,#7c3aed,#4f46e5)",border:doneCount===routine.stretches.length?"1px solid #16a34a":"none",borderRadius:12,padding:"14px",color:doneCount===routine.stretches.length?"#86efac":"#fff",fontWeight:700,fontSize:15,cursor:"pointer"}}>
          {doneCount===routine.stretches.length ? "✓ Routine Complete!" : "Mark All Done"}
        </button>
      </div>
    </div>
  );
}

// ─── RETROACTIVE LOG ──────────────────────────────────────────────────────────

function RetroactiveLog({ currentWeek, onClose }) {
  const realWeek = getCurrentTrainingWeek();
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [selectedDay, setSelectedDay]   = useState(null);
  const [cardioVal, setCardioVal]       = useState("");
  const [setLogs, setSetLogs]           = useState({});
  const [notes, setNotes]               = useState("");
  const [saved, setSaved]               = useState(false);

  const schedule = WEEK_SCHEDULES[getSchedKey(selectedWeek)];
  const nonRestSessions = schedule.filter(s=>s.type!=="rest");
  const ts = selectedDay ? schedule.find(s=>s.day===selectedDay) : null;
  const skey = ts ? sessionKey(selectedWeek, ts.id) : null;

  useEffect(()=>{
    if(!skey) return;
    const d = LS.get(skey);
    if(d){ setCardioVal(d.cardioVal||""); setSetLogs(d.setLogs||{}); setNotes(d.notes||""); }
    else { setCardioVal(""); setSetLogs({}); setNotes(""); }
  },[skey]);

  const save = () => {
    if(!skey) return;
    LS.set(skey, { cardioVal, setLogs, done:true, notes, savedAt:new Date().toISOString(), retroactive:true });
    setSaved(true);
    setTimeout(()=>{ setSaved(false); onClose(); }, 1500);
  };

  const style = ts ? (TYPE_STYLE[ts.type]||TYPE_STYLE.rest) : TYPE_STYLE.rest;

  // Only allow past weeks + current week
  const maxWeek = realWeek;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:200,overflowY:"auto"}}>
      <div style={{background:"#0d1117",minHeight:"100vh",maxWidth:480,margin:"0 auto",paddingBottom:40}}>
        {/* Header */}
        <div style={{background:"linear-gradient(135deg,#0f172a,#1a1a2e)",padding:"20px 16px 14px",borderBottom:"1px solid #1e293b",display:"flex",alignItems:"center",gap:12}}>
          <button onClick={onClose} style={{background:"#1e293b",border:"none",color:"#94a3b8",borderRadius:8,width:34,height:34,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
          <div>
            <div style={{fontSize:11,color:"#f59e0b",letterSpacing:2,textTransform:"uppercase",marginBottom:2}}>Retroactive Log</div>
            <div style={{fontSize:18,fontWeight:800}}>Log a Missed Workout</div>
          </div>
        </div>

        <div style={{padding:"16px"}}>
          {/* Week picker */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,color:"#64748b",marginBottom:8}}>Which week?</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <button onClick={()=>setSelectedWeek(w=>Math.max(1,w-1))} style={{background:"#1e293b",border:"none",color:"#94a3b8",borderRadius:8,width:36,height:36,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
              <div style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid #1e293b",borderRadius:10,padding:"10px",textAlign:"center"}}>
                <div style={{fontWeight:800,fontSize:18}}>Week {selectedWeek}</div>
                <div style={{fontSize:11,color:"#475569",marginTop:1}}>{getPhase(selectedWeek).range}</div>
              </div>
              <button onClick={()=>setSelectedWeek(w=>Math.min(maxWeek,w+1))} style={{background:"#1e293b",border:"none",color:"#94a3b8",borderRadius:8,width:36,height:36,cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",opacity:selectedWeek>=maxWeek?0.3:1}}>›</button>
            </div>
          </div>

          {/* Day picker */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,color:"#64748b",marginBottom:8}}>Which session?</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {nonRestSessions.map(s=>{
                const isDone = LS.get(sessionKey(selectedWeek,s.id))?.done;
                const st = TYPE_STYLE[s.type]||TYPE_STYLE.rest;
                const isSelected = selectedDay===s.day;
                return (
                  <button key={s.id} onClick={()=>setSelectedDay(s.day)}
                    style={{background:isSelected?st.bg:isDone?"rgba(16,185,129,0.08)":"rgba(255,255,255,0.03)",border:`1px solid ${isSelected?st.border:isDone?"#059669":"#1e293b"}`,borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",textAlign:"left"}}>
                    <span style={{fontSize:20}}>{s.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontWeight:700,fontSize:13}}>{s.day}</span>
                        {isDone && <span style={{background:"#14532d",border:"1px solid #16a34a",borderRadius:20,padding:"1px 7px",fontSize:10,color:"#86efac"}}>✓ logged</span>}
                      </div>
                      <div style={{fontSize:12,color:"#94a3b8",marginTop:1}}>{s.title}</div>
                    </div>
                    {isSelected && <span style={{color:st.text,fontSize:12}}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Log form */}
          {ts && (
            <div style={{background:style.bg,border:`1px solid ${style.border}`,borderRadius:14,padding:14,marginBottom:12}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:12,color:style.text}}>{ts.icon} {ts.title}</div>

              {ts.sets.length>0 && (
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:10,color:style.text,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>Weights Used</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {ts.sets.map((s,i)=>(
                      <div key={i} style={{background:"rgba(0,0,0,0.3)",borderRadius:9,padding:"9px 12px",display:"flex",alignItems:"center",gap:8}}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:600}}>{s.label}</div>
                          <div style={{fontSize:11,color:"#475569"}}>{s.reps}</div>
                        </div>
                        <input type="number" inputMode="decimal" placeholder="kg"
                          value={setLogs[`${i}_kg`]||""}
                          onChange={e=>setSetLogs(p=>({...p,[`${i}_kg`]:e.target.value}))}
                          style={{width:54,background:"rgba(255,255,255,0.1)",border:`1px solid ${style.border}80`,borderRadius:7,padding:"6px 4px",color:"#e2e8f0",fontSize:14,fontWeight:700,textAlign:"center"}}
                        />
                        <button onClick={()=>setSetLogs(p=>({...p,[`${i}_done`]:!p[`${i}_done`]}))}
                          style={{background:setLogs[`${i}_done`]?"#14532d":"rgba(255,255,255,0.06)",border:`1px solid ${setLogs[`${i}_done`]?"#16a34a":style.border+"50"}`,borderRadius:7,padding:"6px 10px",color:setLogs[`${i}_done`]?"#86efac":style.text,fontSize:11,cursor:"pointer",fontWeight:600}}>
                          {setLogs[`${i}_done`]?"✓":"Done"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ts.cardio && (
                <div style={{background:"rgba(0,0,0,0.3)",borderRadius:9,padding:12,marginBottom:8}}>
                  <div style={{fontSize:10,color:style.text,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>{ts.cardio.label}</div>
                  <div style={{position:"relative"}}>
                    <input type="number" inputMode="decimal" placeholder={ts.cardio.placeholder}
                      value={cardioVal} onChange={e=>setCardioVal(e.target.value)}
                      style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.08)",border:`1px solid ${style.border}`,borderRadius:9,padding:"12px 56px 12px 12px",color:"#e2e8f0",fontSize:22,fontWeight:800,textAlign:"center"}}
                    />
                    <div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
                      <span style={{fontSize:13,color:style.text,fontWeight:700}}>{ts.cardio.unit}</span>
                    </div>
                  </div>
                </div>
              )}

              <textarea value={notes} onChange={e=>setNotes(e.target.value)}
                placeholder="Notes — how did it go, what you remember..."
                style={{width:"100%",background:"rgba(0,0,0,0.3)",border:"1px solid #1e293b",borderRadius:9,padding:"10px 12px",color:"#e2e8f0",fontSize:13,resize:"none",height:64,fontFamily:"inherit",boxSizing:"border-box",marginTop:8}}
              />
            </div>
          )}

          {ts && (
            <button onClick={save}
              style={{width:"100%",background:saved?"#14532d":"linear-gradient(135deg,#f59e0b,#d97706)",border:saved?"1px solid #16a34a":"none",borderRadius:12,padding:"15px",color:saved?"#86efac":"#000",fontWeight:800,fontSize:15,cursor:"pointer"}}>
              {saved ? "✓ Logged!" : `Log Week ${selectedWeek} · ${selectedDay}`}
            </button>
          )}

          {!ts && selectedDay===null && (
            <div style={{textAlign:"center",padding:"20px 0",color:"#334155",fontSize:13}}>Select a week and session above to log it</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ZONE 2 CALCULATOR ───────────────────────────────────────────────────────

function Zone2Calculator() {
  const [age,  setAge]  = useState(()=>LS.get("im_z2_age")||"");
  const [rest, setRest] = useState(()=>LS.get("im_z2_rest")||"");
  const [max,  setMax]  = useState(()=>LS.get("im_z2_max")||"");
  const [saved, setSaved] = useState(false);

  const save = () => {
    LS.set("im_z2_age", age); LS.set("im_z2_rest", rest); LS.set("im_z2_max", max);
    setSaved(true); setTimeout(()=>setSaved(false), 2000);
  };

  // Karvonen method: target HR = resting HR + (HRR × intensity%)
  const hrMax  = max ? parseInt(max) : age ? (220 - parseInt(age)) : null;
  const hrRest = rest ? parseInt(rest) : null;
  const hrr    = hrMax && hrRest ? hrMax - hrRest : null;

  const zones = hrr && hrRest ? [
    { label:"Zone 1 — Recovery",   pct:"50–60%", lo:Math.round(hrRest+hrr*0.50), hi:Math.round(hrRest+hrr*0.60), color:"#22d3ee",  desc:"Very easy. Warm-up, cool-down, active recovery." },
    { label:"Zone 2 — Base",       pct:"60–70%", lo:Math.round(hrRest+hrr*0.60), hi:Math.round(hrRest+hrr*0.70), color:"#22c55e",  desc:"Conversational pace. 80% of all your bike and run training. Burns fat, builds aerobic engine." },
    { label:"Zone 3 — Tempo",      pct:"70–80%", lo:Math.round(hrRest+hrr*0.70), hi:Math.round(hrRest+hrr*0.80), color:"#f59e0b",  desc:"Comfortably hard. Threshold runs and harder bike efforts." },
    { label:"Zone 4 — Threshold",  pct:"80–90%", lo:Math.round(hrRest+hrr*0.80), hi:Math.round(hrRest+hrr*0.90), color:"#f97316",  desc:"Race pace intensity. Intervals and hard brick sessions." },
    { label:"Zone 5 — Max",        pct:"90–100%",lo:Math.round(hrRest+hrr*0.90), hi:hrMax,                        color:"#ef4444",  desc:"All out. Very short efforts only. Avoid in base phase." },
  ] : null;

  const z2 = zones?.[1];

  return (
    <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid #1e293b",borderRadius:14,padding:16,marginBottom:14}}>
      <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>❤️ Zone 2 Heart Rate</div>
      <div style={{fontSize:12,color:"#64748b",marginBottom:12}}>Karvonen method — enter your stats for personalised zones</div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
        {[
          {label:"Age",       val:age,  set:setAge,  ph:"27",   note:"years"},
          {label:"Resting HR",val:rest, set:setRest, ph:"58",   note:"bpm (morning)"},
          {label:"Max HR",    val:max,  set:setMax,  ph:"auto", note:"leave blank to auto"},
        ].map((f,i)=>(
          <div key={i}>
            <div style={{fontSize:10,color:"#64748b",marginBottom:4}}>{f.label}</div>
            <input type="number" inputMode="numeric" placeholder={f.ph} value={f.val}
              onChange={e=>f.set(e.target.value)}
              style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.06)",border:"1px solid #334155",borderRadius:8,padding:"8px",color:"#e2e8f0",fontSize:15,fontWeight:700,textAlign:"center"}}
            />
            <div style={{fontSize:9,color:"#334155",marginTop:2,textAlign:"center"}}>{f.note}</div>
          </div>
        ))}
      </div>

      <button onClick={save} style={{width:"100%",background:saved?"#14532d":"#7c3aed",border:saved?"1px solid #16a34a":"none",borderRadius:9,padding:"10px",color:saved?"#86efac":"#fff",fontWeight:700,fontSize:13,cursor:"pointer",marginBottom:14}}>
        {saved?"✓ Saved!":"Calculate My Zones"}
      </button>

      {z2 && (
        <>
          {/* Zone 2 highlight */}
          <div style={{background:"rgba(34,197,94,0.15)",border:"2px solid #22c55e",borderRadius:12,padding:"12px 14px",marginBottom:10}}>
            <div style={{fontSize:11,color:"#22c55e",letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Your Zone 2 — use for 80% of training</div>
            <div style={{fontSize:32,fontWeight:800,color:"#86efac",letterSpacing:-1}}>{z2.lo}–{z2.hi} <span style={{fontSize:16,fontWeight:400,color:"#4ade80"}}>bpm</span></div>
            <div style={{fontSize:12,color:"#64748b",marginTop:4}}>{z2.desc}</div>
          </div>

          {/* All zones */}
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {zones.map((z,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(0,0,0,0.2)",borderRadius:9,padding:"8px 12px",borderLeft:`3px solid ${z.color}`}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:z.color}}>{z.label}</div>
                  <div style={{fontSize:11,color:"#475569",marginTop:1}}>{z.desc}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:14,fontWeight:800,color:"#e2e8f0"}}>{z.lo}–{z.hi}</div>
                  <div style={{fontSize:10,color:"#475569"}}>bpm</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{fontSize:11,color:"#334155",textAlign:"center",marginTop:8}}>Based on Karvonen formula · Max HR: {hrMax}bpm</div>
        </>
      )}

      {!zones && (age||rest) && (
        <div style={{textAlign:"center",color:"#475569",fontSize:13,padding:"8px 0"}}>Enter both age and resting HR to calculate zones</div>
      )}
    </div>
  );
}

// ─── RPE LOGGER (used inside TodayView save) ─────────────────────────────────

function RPELogger({ sessionKey: skey, onSave }) {
  const [rpe, setRpe] = useState(()=>{ const d=LS.get(skey); return d?.rpe||0; });
  const RPE_LABELS = ["","😴 Very Easy","😌 Easy","🙂 Moderate","😐 Somewhat Hard","😤 Hard","😓 Hard+","🥵 Very Hard","😰 Very Hard+","😵 Extremely Hard","💀 Max Effort"];
  const RPE_COLORS = ["","#22d3ee","#22c55e","#86efac","#fbbf24","#f97316","#fb923c","#ef4444","#dc2626","#b91c1c","#7f1d1d"];

  const save = (val) => {
    setRpe(val);
    const existing = LS.get(skey)||{};
    LS.set(skey, {...existing, rpe:val});
    onSave && onSave(val);
  };

  return (
    <div style={{background:"rgba(0,0,0,0.2)",borderRadius:10,padding:12,marginBottom:12}}>
      <div style={{fontSize:11,color:"#64748b",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>How hard was it? (RPE 1–10)</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(10,1fr)",gap:4,marginBottom:8}}>
        {[1,2,3,4,5,6,7,8,9,10].map(v=>(
          <button key={v} onClick={()=>save(v)}
            style={{background:rpe===v?RPE_COLORS[v]:"rgba(255,255,255,0.06)",border:`1px solid ${rpe===v?RPE_COLORS[v]:"#1e293b"}`,borderRadius:6,padding:"8px 0",color:rpe===v?"#fff":"#64748b",fontSize:13,fontWeight:rpe===v?800:400,cursor:"pointer"}}>
            {v}
          </button>
        ))}
      </div>
      {rpe>0 && <div style={{fontSize:12,color:RPE_COLORS[rpe],fontWeight:600,textAlign:"center"}}>{RPE_LABELS[rpe]}</div>}
    </div>
  );
}

// ─── TRAINING LOAD ────────────────────────────────────────────────────────────

const SESSION_LOAD = { strength:6, swim:4, bike:5, brick:8, run:5, rest:0 };

function TrainingLoad({ currentWeek }) {
  const realWeek = getCurrentTrainingWeek();

  // Calculate load for last 8 weeks
  const weekLoads = [];
  for(let w=Math.max(1,realWeek-7); w<=realWeek; w++) {
    const sched = WEEK_SCHEDULES[getSchedKey(w)];
    let load = 0;
    sched.forEach(s => {
      const d = LS.get(sessionKey(w,s.id));
      if(d?.done) {
        const base = SESSION_LOAD[s.type]||0;
        const rpe  = d.rpe||5;
        load += base * (rpe/5);
      }
    });
    weekLoads.push({ week:w, load:Math.round(load) });
  }

  const thisWeek = weekLoads[weekLoads.length-1];
  const prevWeek = weekLoads[weekLoads.length-2];
  const maxLoad  = Math.max(...weekLoads.map(w=>w.load), 1);
  const trend    = prevWeek ? thisWeek.load - prevWeek.load : 0;

  const getLevel = (load) => {
    if(load===0)  return {label:"No load",   color:"#475569"};
    if(load<15)   return {label:"Easy week",  color:"#22c55e"};
    if(load<30)   return {label:"Moderate",   color:"#f59e0b"};
    if(load<45)   return {label:"Hard week",  color:"#f97316"};
    return              {label:"Peak load",   color:"#ef4444"};
  };

  const level = getLevel(thisWeek?.load||0);

  return (
    <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid #1e293b",borderRadius:14,padding:16,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div>
          <div style={{fontWeight:700,fontSize:15,marginBottom:2}}>⚡ Training Load</div>
          <div style={{fontSize:11,color:"#64748b"}}>Based on sessions done × RPE</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:20,fontWeight:800,color:level.color}}>{level.label}</div>
          <div style={{fontSize:11,color:"#475569",marginTop:1}}>
            {trend>0?`↑ +${trend} vs last week`:trend<0?`↓ ${trend} vs last week`:"Same as last week"}
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div style={{display:"flex",gap:4,alignItems:"flex-end",height:60,marginBottom:4}}>
        {weekLoads.map((w,i)=>{
          const h = maxLoad>0 ? Math.round((w.load/maxLoad)*52)+4 : 4;
          const isCurrent = w.week===realWeek;
          return (
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <div style={{width:"100%",background:isCurrent?level.color:"#1e3a5f",borderRadius:"3px 3px 0 0",height:h,transition:"height 0.3s"}}/>
              <div style={{fontSize:8,color:isCurrent?"#e2e8f0":"#334155"}}>W{w.week}</div>
            </div>
          );
        })}
      </div>

      <div style={{fontSize:11,color:"#334155",textAlign:"center"}}>Tip: don't increase load more than 10% week-to-week</div>
    </div>
  );
}

// ─── INJURY TRACKER ───────────────────────────────────────────────────────────

const BODY_PARTS = [
  ["Left shoulder","Right shoulder","Neck"],
  ["Left knee","Right knee","Lower back"],
  ["Left hip","Right hip","Upper back"],
  ["Left calf","Right calf","Left achilles"],
  ["Right achilles","Left foot","Right foot"],
];

function InjuryTracker() {
  const [injuries, setInjuries] = useState(()=>LS.get("im_injuries")||[]);
  const [showForm, setShowForm] = useState(false);
  const [part,  setPart]  = useState("");
  const [sev,   setSev]   = useState(0);
  const [note,  setNote]  = useState("");
  const [saved, setSaved] = useState(false);

  const SEV_LABELS = ["","😌 Minor niggle","😐 Noticeable","😟 Affecting training","😰 Can't train properly","🚨 Stop training"];
  const SEV_COLORS = ["","#22c55e","#f59e0b","#f97316","#ef4444","#7f1d1d"];

  const addInjury = () => {
    if(!part||!sev) return;
    const entry = { id:Date.now(), part, sev, note, date:new Date().toLocaleDateString("en",{day:"numeric",month:"short"}), resolved:false };
    const updated = [entry, ...injuries];
    setInjuries(updated);
    LS.set("im_injuries", updated);
    setPart(""); setSev(0); setNote(""); setShowForm(false);
    setSaved(true); setTimeout(()=>setSaved(false),2000);
  };

  const resolve = (id) => {
    const updated = injuries.map(inj=>inj.id===id?{...inj,resolved:true,resolvedDate:new Date().toLocaleDateString("en",{day:"numeric",month:"short"})}:inj);
    setInjuries(updated);
    LS.set("im_injuries", updated);
  };

  const remove = (id) => {
    const updated = injuries.filter(inj=>inj.id!==id);
    setInjuries(updated);
    LS.set("im_injuries", updated);
  };

  const active   = injuries.filter(i=>!i.resolved);
  const resolved = injuries.filter(i=>i.resolved);

  return (
    <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid #1e293b",borderRadius:14,padding:16,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          <div style={{fontWeight:700,fontSize:15}}>🩹 Injury & Pain Log</div>
          <div style={{fontSize:11,color:"#64748b",marginTop:1}}>{active.length} active · {resolved.length} resolved</div>
        </div>
        <button onClick={()=>setShowForm(!showForm)}
          style={{background:"#7c3aed",border:"none",borderRadius:8,padding:"7px 14px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>
          {showForm?"Cancel":"+ Log pain"}
        </button>
      </div>

      {showForm && (
        <div style={{background:"rgba(0,0,0,0.3)",borderRadius:12,padding:14,marginBottom:12}}>
          <div style={{fontSize:12,color:"#64748b",marginBottom:8}}>Where does it hurt?</div>
          <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:12}}>
            {BODY_PARTS.flat().map(p=>(
              <button key={p} onClick={()=>setPart(p)}
                style={{background:part===p?"rgba(239,68,68,0.2)":"rgba(255,255,255,0.04)",border:`1px solid ${part===p?"#ef4444":"#1e293b"}`,borderRadius:8,padding:"8px 12px",color:part===p?"#fca5a5":"#94a3b8",fontSize:13,cursor:"pointer",textAlign:"left"}}>
                {p} {part===p?"✓":""}
              </button>
            ))}
          </div>

          <div style={{fontSize:12,color:"#64748b",marginBottom:8}}>Severity</div>
          <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:12}}>
            {[1,2,3,4,5].map(v=>(
              <button key={v} onClick={()=>setSev(v)}
                style={{background:sev===v?SEV_COLORS[v]+"30":"rgba(255,255,255,0.04)",border:`1px solid ${sev===v?SEV_COLORS[v]:"#1e293b"}`,borderRadius:8,padding:"8px 12px",color:sev===v?SEV_COLORS[v]:"#94a3b8",fontSize:13,cursor:"pointer",textAlign:"left",fontWeight:sev===v?700:400}}>
                {SEV_LABELS[v]}
              </button>
            ))}
          </div>

          <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="When does it hurt? After runs? During squats? Sharp or dull?"
            style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid #334155",borderRadius:8,padding:"9px 12px",color:"#e2e8f0",fontSize:13,resize:"none",height:64,fontFamily:"inherit",boxSizing:"border-box",marginBottom:10}}
          />

          <button onClick={addInjury} disabled={!part||!sev}
            style={{width:"100%",background:(!part||!sev)?"#1e293b":"#ef4444",border:"none",borderRadius:9,padding:"12px",color:(!part||!sev)?"#475569":"#fff",fontWeight:700,fontSize:14,cursor:(!part||!sev)?"default":"pointer"}}>
            Log Pain
          </button>
        </div>
      )}

      {active.length===0 && !showForm && (
        <div style={{textAlign:"center",padding:"16px 0",color:"#334155",fontSize:13}}>
          ✅ No active injuries logged. Keep it that way.
        </div>
      )}

      {active.map(inj=>(
        <div key={inj.id} style={{background:`${SEV_COLORS[inj.sev]}15`,border:`1px solid ${SEV_COLORS[inj.sev]}50`,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:SEV_COLORS[inj.sev]}}>{inj.part}</div>
              <div style={{fontSize:11,color:"#64748b",marginTop:1}}>{SEV_LABELS[inj.sev]} · {inj.date}</div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>resolve(inj.id)} style={{background:"#14532d",border:"1px solid #16a34a",borderRadius:6,padding:"4px 8px",color:"#86efac",fontSize:10,cursor:"pointer",fontWeight:600}}>Resolved</button>
              <button onClick={()=>remove(inj.id)} style={{background:"rgba(255,255,255,0.04)",border:"1px solid #334155",borderRadius:6,padding:"4px 8px",color:"#64748b",fontSize:10,cursor:"pointer"}}>✕</button>
            </div>
          </div>
          {inj.note && <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.4}}>{inj.note}</div>}
        </div>
      ))}

      {resolved.length>0 && (
        <div style={{marginTop:8}}>
          <div style={{fontSize:11,color:"#334155",marginBottom:6}}>Resolved ({resolved.length})</div>
          {resolved.slice(0,3).map(inj=>(
            <div key={inj.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #1e293b",opacity:0.5}}>
              <span style={{fontSize:12,color:"#64748b",textDecoration:"line-through"}}>{inj.part}</span>
              <span style={{fontSize:11,color:"#334155"}}>Resolved {inj.resolvedDate}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── OW CONDITIONS LOG ────────────────────────────────────────────────────────

function OWConditionsLog() {
  const [entries, setEntries] = useState(()=>LS.get("im_ow_log")||[]);
  const [showForm, setShowForm] = useState(false);
  const [cond,  setCond]  = useState("");
  const [temp,  setTemp]  = useState("");
  const [dist,  setDist]  = useState("");
  const [time,  setTime]  = useState("");
  const [strokes,setStrokes]=useState("");
  const [note,  setNote]  = useState("");

  const CONDITIONS = [
    {id:"flat",    label:"Flat — mirror calm",   icon:"🌊"},
    {id:"small",   label:"Small chop",            icon:"〰️"},
    {id:"choppy",  label:"Choppy — manageable",   icon:"🌊"},
    {id:"rough",   label:"Rough — challenging",   icon:"⛵"},
    {id:"pool",    label:"Pool session",           icon:"🏊"},
  ];

  const save = () => {
    if(!cond) return;
    const entry = { id:Date.now(), cond, temp, dist, time, strokes, note, date:new Date().toLocaleDateString("en",{day:"numeric",month:"short",year:"numeric"}) };
    const updated = [entry, ...entries].slice(0,30);
    setEntries(updated);
    LS.set("im_ow_log", updated);
    setCond(""); setTemp(""); setDist(""); setTime(""); setStrokes(""); setNote("");
    setShowForm(false);
  };

  return (
    <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid #1e293b",borderRadius:14,padding:16,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          <div style={{fontWeight:700,fontSize:15}}>🌊 Swim Log</div>
          <div style={{fontSize:11,color:"#64748b",marginTop:1}}>OW conditions + stroke count tracker</div>
        </div>
        <button onClick={()=>setShowForm(!showForm)}
          style={{background:"#0891b2",border:"none",borderRadius:8,padding:"7px 14px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>
          {showForm?"Cancel":"+ Log swim"}
        </button>
      </div>

      {showForm && (
        <div style={{background:"rgba(0,0,0,0.3)",borderRadius:12,padding:14,marginBottom:12}}>
          <div style={{fontSize:12,color:"#64748b",marginBottom:8}}>Conditions</div>
          <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:12}}>
            {CONDITIONS.map(c=>(
              <button key={c.id} onClick={()=>setCond(c.id)}
                style={{background:cond===c.id?"rgba(8,145,178,0.2)":"rgba(255,255,255,0.04)",border:`1px solid ${cond===c.id?"#0891b2":"#1e293b"}`,borderRadius:8,padding:"8px 12px",color:cond===c.id?"#67e8f9":"#94a3b8",fontSize:13,cursor:"pointer",textAlign:"left"}}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
            {[
              {label:"Water temp (°C)",val:temp,set:setTemp,ph:"22"},
              {label:"Distance (m)",   val:dist,set:setDist,ph:"1500"},
              {label:"Time (min)",     val:time,set:setTime,ph:"35"},
              {label:"Strokes/length", val:strokes,set:setStrokes,ph:"20"},
            ].map((f,i)=>(
              <div key={i}>
                <div style={{fontSize:10,color:"#64748b",marginBottom:4}}>{f.label}</div>
                <input type="number" inputMode="decimal" placeholder={f.ph} value={f.val} onChange={e=>f.set(e.target.value)}
                  style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.06)",border:"1px solid #334155",borderRadius:8,padding:"8px",color:"#e2e8f0",fontSize:15,fontWeight:700,textAlign:"center"}}
                />
              </div>
            ))}
          </div>

          <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="How did it feel? Sighting good? Any currents?"
            style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid #334155",borderRadius:8,padding:"9px 12px",color:"#e2e8f0",fontSize:13,resize:"none",height:56,fontFamily:"inherit",boxSizing:"border-box",marginBottom:10}}
          />
          <button onClick={save} disabled={!cond}
            style={{width:"100%",background:!cond?"#1e293b":"#0891b2",border:"none",borderRadius:9,padding:"12px",color:!cond?"#475569":"#fff",fontWeight:700,fontSize:14,cursor:!cond?"default":"pointer"}}>
            Save Swim
          </button>
        </div>
      )}

      {entries.length===0 && !showForm && (
        <div style={{textAlign:"center",padding:"16px 0",color:"#334155",fontSize:13}}>No swims logged yet. Start logging OW sessions here.</div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {entries.slice(0,5).map(e=>{
          const c = CONDITIONS.find(x=>x.id===e.cond);
          return (
            <div key={e.id} style={{background:"rgba(8,145,178,0.08)",border:"1px solid #164e63",borderRadius:10,padding:"10px 12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                <div style={{fontWeight:600,fontSize:13,color:"#67e8f9"}}>{c?.icon} {c?.label}</div>
                <div style={{fontSize:11,color:"#475569"}}>{e.date}</div>
              </div>
              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                {e.dist  && <span style={{fontSize:11,color:"#94a3b8"}}>📏 {e.dist}m</span>}
                {e.time  && <span style={{fontSize:11,color:"#94a3b8"}}>⏱ {e.time}min</span>}
                {e.temp  && <span style={{fontSize:11,color:"#94a3b8"}}>🌡 {e.temp}°C</span>}
                {e.strokes && <span style={{fontSize:11,color:"#94a3b8"}}>🤚 {e.strokes} str/len</span>}
              </div>
              {e.note && <div style={{fontSize:11,color:"#475569",marginTop:4,lineHeight:1.4}}>{e.note}</div>}
            </div>
          );
        })}
        {entries.length>5 && <div style={{fontSize:11,color:"#334155",textAlign:"center"}}>+{entries.length-5} more entries</div>}
      </div>
    </div>
  );
}

// ─── RACE SIMULATION TRACKER ──────────────────────────────────────────────────

function RaceSimTracker() {
  const [sims,    setSims]    = useState(()=>LS.get("im_race_sims")||[]);
  const [showForm,setShowForm]= useState(false);
  const [bikeDist,setBikeDist]= useState("");
  const [bikeTime,setBikeTime]= useState("");
  const [runDist, setRunDist] = useState("");
  const [runTime, setRunTime] = useState("");
  const [transQ,  setTransQ]  = useState(0);
  const [note,    setNote]    = useState("");

  const TRANS_Q = ["","Smooth — no issues","Minor fumbles","Clunky — need practice","Confused — major work needed"];
  const TRANS_COLORS = ["","#22c55e","#f59e0b","#f97316","#ef4444"];

  const save = () => {
    if(!bikeDist&&!runDist) return;
    const entry = { id:Date.now(), bikeDist, bikeTime, runDist, runTime, transQ, note,
      date:new Date().toLocaleDateString("en",{day:"numeric",month:"short"}),
      week:getCurrentTrainingWeek() };
    const updated = [entry,...sims].slice(0,20);
    setSims(updated);
    LS.set("im_race_sims", updated);
    setBikeDist(""); setBikeTime(""); setRunDist(""); setRunTime(""); setTransQ(0); setNote("");
    setShowForm(false);
  };

  return (
    <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid #1e293b",borderRadius:14,padding:16,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          <div style={{fontWeight:700,fontSize:15}}>⚡ Brick Sessions</div>
          <div style={{fontSize:11,color:"#64748b",marginTop:1}}>{sims.length} race simulations logged</div>
        </div>
        <button onClick={()=>setShowForm(!showForm)}
          style={{background:"#7c3aed",border:"none",borderRadius:8,padding:"7px 14px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>
          {showForm?"Cancel":"+ Log brick"}
        </button>
      </div>

      {showForm && (
        <div style={{background:"rgba(0,0,0,0.3)",borderRadius:12,padding:14,marginBottom:12}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
            {[
              {label:"Bike distance (km)",val:bikeDist,set:setBikeDist,ph:"90"},
              {label:"Bike time (min)",   val:bikeTime,set:setBikeTime,ph:"190"},
              {label:"Run distance (km)", val:runDist, set:setRunDist, ph:"10"},
              {label:"Run time (min)",    val:runTime, set:setRunTime, ph:"60"},
            ].map((f,i)=>(
              <div key={i}>
                <div style={{fontSize:10,color:"#64748b",marginBottom:4}}>{f.label}</div>
                <input type="number" inputMode="decimal" placeholder={f.ph} value={f.val} onChange={e=>f.set(e.target.value)}
                  style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.06)",border:"1px solid #334155",borderRadius:8,padding:"8px",color:"#e2e8f0",fontSize:15,fontWeight:700,textAlign:"center"}}
                />
              </div>
            ))}
          </div>

          <div style={{fontSize:12,color:"#64748b",marginBottom:8}}>Transition quality</div>
          <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:10}}>
            {[1,2,3,4].map(v=>(
              <button key={v} onClick={()=>setTransQ(v)}
                style={{background:transQ===v?TRANS_COLORS[v]+"25":"rgba(255,255,255,0.04)",border:`1px solid ${transQ===v?TRANS_COLORS[v]:"#1e293b"}`,borderRadius:8,padding:"8px 12px",color:transQ===v?TRANS_COLORS[v]:"#94a3b8",fontSize:13,cursor:"pointer",textAlign:"left",fontWeight:transQ===v?700:400}}>
                {TRANS_Q[v]}
              </button>
            ))}
          </div>

          <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="How did legs feel on the run? Pacing? What to improve?"
            style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid #334155",borderRadius:8,padding:"9px 12px",color:"#e2e8f0",fontSize:13,resize:"none",height:56,fontFamily:"inherit",boxSizing:"border-box",marginBottom:10}}
          />
          <button onClick={save}
            style={{width:"100%",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",border:"none",borderRadius:9,padding:"12px",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>
            Save Brick Session
          </button>
        </div>
      )}

      {sims.length===0 && !showForm && (
        <div style={{textAlign:"center",padding:"16px 0",color:"#334155",fontSize:13}}>No brick sessions logged yet. Start in Phase 2.</div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {sims.slice(0,4).map(s=>(
          <div key={s.id} style={{background:"rgba(124,58,237,0.08)",border:"1px solid #4c1d95",borderRadius:10,padding:"10px 12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontSize:12,color:"#c084fc",fontWeight:600}}>Week {s.week} · {s.date}</div>
              {s.transQ>0 && <div style={{fontSize:11,color:TRANS_COLORS[s.transQ]}}>{TRANS_Q[s.transQ]}</div>}
            </div>
            <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
              {s.bikeDist && <div style={{fontSize:13}}><span style={{color:"#86efac"}}>🚴</span> <strong>{s.bikeDist}km</strong>{s.bikeTime&&<span style={{color:"#64748b",fontSize:11}}> in {s.bikeTime}min</span>}</div>}
              {s.runDist  && <div style={{fontSize:13}}><span style={{color:"#fb923c"}}>🏃</span> <strong>{s.runDist}km</strong>{s.runTime&&<span style={{color:"#64748b",fontSize:11}}> in {s.runTime}min</span>}</div>}
            </div>
            {s.note && <div style={{fontSize:11,color:"#64748b",marginTop:4,lineHeight:1.4}}>{s.note}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── WEATHER LOG ──────────────────────────────────────────────────────────────

function WeatherLog({ sessionKeyStr }) {
  const wkey = `im_weather_${sessionKeyStr}`;
  const [temp,   setTemp]   = useState(()=>LS.get(wkey)?.temp||"");
  const [cond,   setCond]   = useState(()=>LS.get(wkey)?.cond||"");
  const [status, setStatus] = useState(LS.get(wkey) ? "done" : "idle"); // idle|loading|done|error|denied
  const fetchedRef = useRef(!!LS.get(wkey));

  const WMO_MAP = {
    0:"☀️ Clear",1:"🌤 Mostly Clear",2:"⛅ Cloudy",3:"☁️ Overcast",
    45:"🌫 Fog",48:"🌫 Fog",
    51:"🌦 Drizzle",53:"🌦 Drizzle",55:"🌦 Drizzle",
    61:"🌧 Rain",63:"🌧 Rain",65:"🌧 Heavy Rain",
    71:"🌨 Snow",73:"🌨 Snow",75:"🌨 Heavy Snow",
    80:"🌦 Showers",81:"🌦 Showers",82:"⛈ Heavy Showers",
    95:"⛈ Thunderstorm",96:"⛈ Thunderstorm",99:"⛈ Thunderstorm",
  };

  const fetchWeather = () => {
    if(!navigator.geolocation) { setStatus("error"); return; }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`);
          const data = await res.json();
          const t = Math.round(data?.current?.temperature_2m);
          const code = data?.current?.weather_code;
          const condition = WMO_MAP[code] || "🌡 Unknown";
          setTemp(String(t));
          setCond(condition);
          LS.set(wkey, { temp:String(t), cond:condition, auto:true, fetchedAt:new Date().toISOString() });
          setStatus("done");
        } catch(e) { setStatus("error"); }
      },
      () => setStatus("denied"),
      { timeout:8000 }
    );
  };

  useEffect(() => {
    if(!fetchedRef.current) {
      fetchedRef.current = true;
      fetchWeather();
    }
  }, []);

  return (
    <div style={{background:"rgba(0,0,0,0.2)",borderRadius:10,padding:12,marginBottom:12}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div style={{fontSize:11,color:"#64748b",letterSpacing:1,textTransform:"uppercase"}}>Session weather</div>
        {status!=="loading" && (
          <button onClick={fetchWeather} style={{background:"none",border:"none",color:"#7c3aed",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:3}}>
            🔄 Refresh
          </button>
        )}
      </div>

      {status==="loading" && (
        <div style={{display:"flex",alignItems:"center",gap:8,color:"#64748b",fontSize:13,padding:"6px 0"}}>
          <span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>🌐</span> Fetching local weather...
        </div>
      )}

      {status==="done" && temp && (
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:24,fontWeight:800,color:"#e2e8f0"}}>{temp}°C</div>
          <div style={{fontSize:13,color:"#94a3b8"}}>{cond}</div>
          <div style={{marginLeft:"auto",fontSize:9,color:"#334155"}}>📍 auto-detected</div>
        </div>
      )}

      {status==="denied" && (
        <div style={{fontSize:12,color:"#92400e",lineHeight:1.5}}>
          Location access denied. Enable location permission for this app in your browser/phone settings to auto-fetch weather, or it'll just stay blank.
        </div>
      )}

      {status==="error" && (
        <div style={{fontSize:12,color:"#92400e",lineHeight:1.5}}>
          Couldn't fetch weather right now. Tap Refresh to try again.
        </div>
      )}
    </div>
  );
}

// ─── MILESTONE COUNTDOWN ──────────────────────────────────────────────────────

function MilestoneCountdown({ currentWeek }) {
  const realWeek = getCurrentTrainingWeek();
  const next = MILESTONES.find(m => m.week > realWeek);
  const race = MILESTONES[MILESTONES.length-1];
  if(!next) return null;

  const weeksToNext = next.week - realWeek;
  const weeksToRace = race.week - realWeek;

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
      <div style={{background:"rgba(16,185,129,0.1)",border:"1px solid #065f46",borderRadius:12,padding:"12px 14px",textAlign:"center"}}>
        <div style={{fontSize:10,color:"#10b981",letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Next milestone</div>
        <div style={{fontSize:22,fontWeight:800,color:"#86efac"}}>{weeksToNext}<span style={{fontSize:12,color:"#475569",fontWeight:400}}> wks</span></div>
        <div style={{fontSize:11,color:"#64748b",marginTop:4,lineHeight:1.4}}>{next.label}</div>
      </div>
      <div style={{background:"rgba(124,58,237,0.1)",border:"1px solid #4c1d95",borderRadius:12,padding:"12px 14px",textAlign:"center"}}>
        <div style={{fontSize:10,color:"#8b5cf6",letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>To race day</div>
        <div style={{fontSize:22,fontWeight:800,color:"#c084fc"}}>{weeksToRace}<span style={{fontSize:12,color:"#475569",fontWeight:400}}> wks</span></div>
        <div style={{fontSize:11,color:"#64748b",marginTop:4}}>14 Sep 2027</div>
      </div>
    </div>
  );
}

// ─── TOOLS VIEW (new tab combining all the tools) ────────────────────────────

function ToolsView({ currentWeek }) {
  const [subTab, setSubTab] = useState("zone2");

  return (
    <div style={{paddingBottom:90}}>
      <div style={{background:"linear-gradient(135deg,#0f172a,#1a1a2e)",padding:"20px 16px 14px",borderBottom:"1px solid #1e293b"}}>
        <div style={{fontSize:11,color:"#8b5cf6",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Tools</div>
        <div style={{fontSize:24,fontWeight:800}}>Training Tools</div>
        <div style={{fontSize:13,color:"#64748b"}}>Calculators, trackers & logs</div>
      </div>

      {/* Sub-tab nav */}
      <div style={{display:"flex",overflowX:"auto",borderBottom:"1px solid #1e293b",background:"#0d1117"}}>
        {[
          ["zone2",   "❤️ Zone 2"],
          ["injury",  "🩹 Injury"],
          ["swim",    "🌊 Swim"],
          ["brick",   "⚡ Brick"],
          ["stretch", "🧘 Stretch"],
        ].map(([id,label])=>(
          <button key={id} onClick={()=>setSubTab(id)}
            style={{flexShrink:0,background:"none",border:"none",borderBottom:subTab===id?"2px solid #7c3aed":"2px solid transparent",color:subTab===id?"#e2e8f0":"#64748b",padding:"12px 16px",fontSize:12,cursor:"pointer",fontWeight:subTab===id?700:400,whiteSpace:"nowrap"}}>
            {label}
          </button>
        ))}
      </div>

      <div style={{padding:"14px 16px"}}>
        {subTab==="zone2"   && <Zone2Calculator/>}
        {subTab==="injury"  && <InjuryTracker/>}
        {subTab==="swim"    && <OWConditionsLog/>}
        {subTab==="brick"   && <RaceSimTracker/>}
        {subTab==="stretch" && <StretchingView embedded/>}
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
    {id:"tools",    icon:"🔧", label:"Tools"},
    {id:"race",     icon:"🏁", label:"Race"},
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
      {tab==="stretch"  && <StretchingView/>}
      {tab==="tools"    && <ToolsView currentWeek={currentWeek}/>}
      {tab==="race"     && <RaceView currentWeek={currentWeek}/>}
      {tab==="notif"    && <NotificationsView/>}
      <BottomNav tab={tab} setTab={handleTabChange}/>
    </div>
  );
}
