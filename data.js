// =============================================================
// Idle Fishing Calculator - Game Data
// Based on spreadsheet V2.0.0.4 by C.Rody, Metzli & Jake From Snake Farm
// =============================================================

const UPGRADE_COSTS = {
  fishingRod: [
    10,12,15,18,22,28,34,42,52,64,79,97,119,147,181,223,274,337,415,510,
    628,772,950,1169,1437,1768,2175,2675,3291,4048,4979,6124,7532,9265,
    11396,14017,17241,21207,26085,32084,39464,48541,59705,73437,90328,
    111104,136658,168089,206749,254302,
    1560000,1920000,2370000,2910000,3580000
  ],
  fishingDrone: [
    12,14,17,21,26,32,39,48,58,71,87,106,130,159,194,236,289,352,430,524,
    640,781,953,1162,1418,1730,2111,2575,3142,3833,4677,5706,6961,8492,
    10361,12640,15421,18814,22953,28003,34164,41680,50850,62037,75685,
    92336,112650,137433,167669,204556,
    2000000,3000000,4500000,6750000,10120000
  ],
  upgradeBoat: [
    15,45,135,405,1215,
    215000,258000,309600,371520,445820
  ],
  tickSpeed: [
    40,49,61,76,94,117,145,180,223,277,343,426,528,655,812,1007,1249,
    1549,1921,2382,2954,3663,4542,5633,6985,8661,10740,13318,16514,
    20478,25392,31487,39043,48414,60034,74442,92308,114462,141933,175997,
    325000,390000,468000,561600,673920
  ],
  fishMultiplier: [
    55,68,85,107,134,167,209,262,327,409,512,640,800,1000,1250,1563,
    1953,2442,3053,3816,4770,5963,7453,9317,11646,14558,18197,22747,
    28434,35542,
    475000,570000,684000,820800,984960
  ],
  rodMultiplier: [
    75,97,126,164,214,278,362,470,611,795,1033,1344,1747,2271,2953,
    3838,4990,6487,8434,10964,
    625000,750000,900000,1080000,1296000
  ],
  droneMultiplier: [
    95,123,160,208,271,352,458,596,774,1007,1309,1702,2213,2877,3740,
    4862,6321,8217,10683,13888,
    850000,1020000,1224000,1468800,1762560
  ],
  doubleTickChance: [
    125,152,186,226,276,337,412,502,613,748,913,1113,1359,1658,2022,
    2467,3010,3673,4481,5466,6669,8137,9927,12111,14775,18026,21992,
    26830,32732,39934
  ],
  fishingDroneX2: [
    145,176,215,263,321,391,478,583,711,868,1059,1292,1576,1923,2346,
    2862,3492,4260,5198,6341,7736,9438,11515,14048,17139,20910,25510,
    31123,37970,46323
  ],
  shinyFishChance: [
    175,215,264,325,400,492,605,745,916,1127,1387,1706,2098,2581,3174,
    3904,4803,5907,7266,8937,10993,13522,16632,20457,25162
  ],
  droneBasePower: [
    205,246,295,354,425,510,612,734,881,1057,1269,1523,1827,2193,2632,
    3158,3790,4548,5457,6549,7859,9431,11317,13580,16296,19556,23467,
    28160,33793,40551
  ],
  tripleTickChance: [
    245,301,370,455,560,689,848,1043,1283,1578,1941,2388,2937,3613,
    4444,5466,6724,8270,10173,12513,15391,18930,23285,28640,35228
  ]
};

// Base upgrade definitions
const BASE_UPGRADES = [
  { id: 'fishingRod',        name: 'Fishing Rod',            maxLevel: 55, costKey: 'fishingRod',       growthPerLevel: 0.0588 },
  { id: 'fishingDrone',      name: 'Fishing Drone (x1)',     maxLevel: 55, costKey: 'fishingDrone',     growthPerLevel: 0.0882 },
  { id: 'upgradeBoat',       name: 'Upgrade Boat',           maxLevel: 10, costKey: 'upgradeBoat',      growthPerLevel: 0.05 },
  { id: 'tickSpeed',         name: 'Tick Speed',             maxLevel: 45, costKey: 'tickSpeed',        growthPerLevel: 0.0084 },
  { id: 'fishMultiplier',    name: 'Fish Multiplier',        maxLevel: 35, costKey: 'fishMultiplier',   growthPerLevel: 0.03 },
  { id: 'rodMultiplier',     name: 'Rod Multiplier',         maxLevel: 25, costKey: 'rodMultiplier',    growthPerLevel: 0.025 },
  { id: 'droneMultiplier',   name: 'Drone Multiplier',       maxLevel: 25, costKey: 'droneMultiplier',  growthPerLevel: 0.0424 },
  { id: 'doubleTickChance',  name: 'Double Tick Chance',     maxLevel: 30, costKey: 'doubleTickChance', growthPerLevel: 0.015 },
  { id: 'fishingDroneX2',    name: 'Fishing Drone (+2)',     maxLevel: 30, costKey: 'fishingDroneX2',   growthPerLevel: 0.04 },
  { id: 'shinyFishChance',   name: 'Shiny Fish Chance',      maxLevel: 25, costKey: 'shinyFishChance',  growthPerLevel: 0.02 },
  { id: 'droneBasePower',    name: 'Drone Base Power',       maxLevel: 30, costKey: 'droneBasePower',   growthPerLevel: 0.035 },
  { id: 'tripleTickChance',  name: 'Triple Tick Chance',     maxLevel: 25, costKey: 'tripleTickChance', growthPerLevel: 0.01 },
];

// Enhance definitions (gem cost)
const ENHANCE_UPGRADES = [
  { id: 'enhFishMult',       name: 'Fish Multiplier',        maxLevel: 255, gemCost: 500,   growthPerLevel: 0.05,   desc: '+5% fish per level' },
  { id: 'enhFishingDrone',   name: 'Fishing Drone (x1)',     maxLevel: 25,  gemCost: 750,   growthPerLevel: 0.0882, desc: '+1 drone per level' },
  { id: 'enhRodMult',        name: 'Rod Multiplier',         maxLevel: 20,  gemCost: 850,   growthPerLevel: 0.0235, desc: 'Rod multiplier boost' },
  { id: 'enhTickSpeed',      name: 'Tick Speed',             maxLevel: 20,  gemCost: 1000,  growthPerLevel: 0.0084, desc: '+tick speed' },
  { id: 'enhDroneMult',      name: 'Drone Multiplier',       maxLevel: 25,  gemCost: 1150,  growthPerLevel: 0.0424, desc: 'Drone multiplier boost' },
  { id: 'enhTokenMult',      name: 'Token Multiplier',       maxLevel: 20,  gemCost: 1250,  growthPerLevel: 0.02,   desc: 'Token bonus' },
  { id: 'enhDoubleTick',     name: 'Double Tick Chance',     maxLevel: 20,  gemCost: 1450,  growthPerLevel: 0.005,  desc: '+0.5% chance' },
  { id: 'enhTinyNotice',     name: 'Tiny Notice Chance',     maxLevel: 20,  gemCost: 1750,  growthPerLevel: 0.01,   desc: 'Tiny notice bonus' },
  { id: 'enhShinyMult',      name: 'Shiny Multiplier',       maxLevel: 20,  gemCost: 1950,  growthPerLevel: 0.025,  desc: 'Shiny fish bonus' },
  { id: 'enhDroneX3',        name: 'Fishing Drone (x3)',     maxLevel: 20,  gemCost: 2450,  growthPerLevel: 0.03,   desc: '+3 drones per level' },
  { id: 'enhT2DockTicks',    name: 'Tier 2 Dock Ticks',      maxLevel: 10,  gemCost: 15000, growthPerLevel: 0.02,   desc: 'T2 dock ticks' },
  { id: 'enhTripleTick',     name: 'Triple Tick Chance',     maxLevel: 20,  gemCost: 4450,  growthPerLevel: 0.004,  desc: '+0.4% chance' },
  { id: 'enhSuperShinyMult', name: 'Super Shiny Multi',      maxLevel: 20,  gemCost: 5550,  growthPerLevel: 0.015,  desc: 'Super shiny bonus' },
  { id: 'enhT2DockPower',    name: 'Tier 2 Dock Power',      maxLevel: 20,  gemCost: 7550,  growthPerLevel: 0.01,   desc: 'T2 dock power' },
  { id: 'enhPolyCardMult',   name: 'Poly Card Multi',        maxLevel: 20,  gemCost: 9550,  growthPerLevel: 0.02,   desc: 'Polychrome card bonus' },
];

// Skill tree
const SKILL_TREE = [
  { id: 'skillFWF',  name: 'Fishing With Friends',                    maxLevel: 3, gemCost: 5000,  growthPerLevel: 0.5844, desc: 'Powerful multiplier' },
  { id: 'skillLPUP', name: "Let's Pick Up The Pace",                  maxLevel: 3, gemCost: 5000,  growthPerLevel: 0.0763, desc: 'Speed bonus' },
  { id: 'skillFEWT', name: 'Friendship Ended W/ T1 Items',            maxLevel: 3, gemCost: 6250,  growthPerLevel: 0.05,   desc: 'T1 replacement' },
  { id: 'skillWTFI', name: 'With This Fish I Summon Two More Fish',   maxLevel: 3, gemCost: 6250,  growthPerLevel: 0.03,   desc: 'Fish spawning' },
  { id: 'skillMS',   name: 'Motley School',                           maxLevel: 3, gemCost: 12500, growthPerLevel: 0.06,   desc: 'School bonus' },
  { id: 'skillCG',   name: 'Completionist Gatekeeper',                maxLevel: 3, gemCost: 12500, growthPerLevel: 0.03,   desc: 'Completion bonus' },
];

// Bar upgrades - numeric and toggle types
const BAR_UPGRADES = [
  { id: 'barDroneBasePower',   name: 'Fishing Drone Base Power',       type: 'number', default: 0 },
  { id: 'barDronePower',       name: 'Fishing Drone Power (Workshop)', type: 'number', default: 0 },
  { id: 'barMrNibbles',        name: 'Mr Nibbles',                     type: 'number', default: 0 },
  { id: 'barNibblesQuest',     name: "Mr Nibbles' Quest",              type: 'number', default: 0 },
  { id: 'barCetus',            name: 'Cetus',                          type: 'number', default: 0 },
  { id: 'barAstraueus',        name: 'Astraueus',                      type: 'number', default: 0 },
  { id: 'barPoseidon',         name: 'Poseidon',                       type: 'number', default: 0 },
  { id: 'barTethys',           name: 'Tethys',                         type: 'number', default: 0 },
  { id: 'barSuperStar',        name: 'Super Star - Fish Mult',         type: 'number', default: 0 },
  { id: 'barTickChance5x',     name: 'Fishing Tick 5x Chance +2%',     type: 'number', default: 0 },
  { id: 'bar3xTickSpeed',      name: '3x Fishing Tick Speed',          type: 'toggle', default: false },
  { id: 'barFishBundle',       name: 'Fish Bundle',                    type: 'toggle', default: false },
  { id: 'barPolyPotency',     name: 'Polychrome Potency Bundle',      type: 'toggle', default: false },
  { id: 'barShinyMult10',      name: 'Shiny Fish Multiplier +10%',     type: 'toggle', default: false },
  { id: 'barDrCoolSkin',       name: 'Dr Cool Skin',                   type: 'toggle', default: false },
  { id: 'barGildedStatue',     name: 'Gilded Statue of Craftmanship',  type: 'toggle', default: false },
  { id: 'barPlatStatue',       name: 'Platinum Statue of Craftmanship',type: 'toggle', default: false },
  { id: 'barBlackHole',        name: 'Black Hole - T2 Dock Power',     type: 'toggle', default: false },
  { id: 'barAbyssTribute',     name: 'Abyss Tribute 1',                type: 'toggle', default: false },
  { id: 'barLegHauler',        name: 'Legendary Hauler Bundle',        type: 'toggle', default: false },
  { id: 'barInfAnglerBonus',   name: 'Infernal Angler Bonus',          type: 'number', default: 0 },
  { id: 'barInfNibblesBonus',  name: 'Infernal Mr. Nibbles Bonus',     type: 'number', default: 0 },
];

// Dock data
const DOCKS = {
  lake:    { name: 'Lake',    power: 8,  t1: 8,  t2: 8  },
  desert:  { name: 'Desert',  power: 8,  t1: 8,  t2: 8  },
  tundra:  { name: 'Tundra',  power: 12, t1: 12, t2: 12 },
  ocean:   { name: 'Ocean',   power: 16, t1: 16, t2: 16 },
  nuclear: { name: 'Nuclear', power: 22, t1: 22, t2: 22 },
  abyss:   { name: 'Abyss',   power: 30, t1: 30, t2: 28 },
  cave:    { name: 'Cave',    power: 40, t1: 39, t2: 38 },
  volcano: { name: 'Volcano', power: 50, t1: 49, t2: 48 },
  sky:     { name: 'Sky',     power: 60, t1: 59, t2: 58 },
  solaris: { name: 'Solaris', power: 70, t1: 69, t2: 68 },
  galaxy:  { name: 'Galaxy',  power: 80, t1: 79, t2: 78 },
};

// Card types
const CARD_OPTIONS = [
  { value: 0, label: '0 - None' },
  { value: 1, label: '1 - Normal' },
  { value: 2, label: '2 - Gilded' },
  { value: 3, label: '3 - Polychrome' },
  { value: 4, label: '4 - Infernal' },
];

const T1_CARD_SLOTS = 5;
const T2_CARD_SLOTS = 5;
const OTHER_CARD_SLOTS = 1;
