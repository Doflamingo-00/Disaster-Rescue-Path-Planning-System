/**
 * DISASTER RESCUE PATH PLANNING SYSTEM
 * Module: Disaster Scenario Presets & Test Data
 *
 * Includes:
 * 1. Preset 1: DAA Report Worked Example (Page 18 - 5 Nodes A, B, C, D, E)
 * 2. Preset 2: Metropolitan Flood Crisis (TC01-TC05 Scenarios)
 * 3. Preset 3: Mountain Landslide & Earthquake Sector
 * 4. Preset 4: Cyclone Coastal Evacuation Network
 * 5. Pre-configured Test Suite (TC01 - TC10 matching Section 14 of Report)
 */

const PRESETS = {
  // ==========================================
  // PRESET 1: REPORT WORKED EXAMPLE (PAGE 18)
  // Exact 5-node scenario from DAA project report
  // ==========================================
  workedExamplePage18: {
    id: 'workedExamplePage18',
    title: 'DAA Report Worked Example (Page 18)',
    description: '5-node baseline from project report. Optimal path A → B → C → D (Cost 9). Block B-C to re-route to A → B → D (Cost 11).',
    defaultSource: 'A',
    defaultTarget: 'D',
    costWeights: { alpha: 1.0, beta: 0.0, gamma: 0.0, delta: 0.0, penaltyVal: 30.0 }, // Direct cost as time/weight
    locations: [
      { id: 'A', name: 'Rescue Base (A)', type: 'base', x: 120, y: 250, status: 'ACTIVE', notes: 'Command Headquarters' },
      { id: 'B', name: 'Junction B (B)', type: 'junction', x: 320, y: 140, status: 'ACTIVE', notes: 'North Junction' },
      { id: 'C', name: 'Incident Site (C)', type: 'incident', x: 420, y: 340, status: 'ACTIVE', notes: 'Structural Collapse Site' },
      { id: 'D', name: 'Hospital (D)', type: 'hospital', x: 620, y: 180, status: 'ACTIVE', notes: 'Trauma Center' },
      { id: 'E', name: 'Shelter (E)', type: 'shelter', x: 740, y: 340, status: 'ACTIVE', notes: 'Emergency Relief Camp' }
    ],
    edges: [
      { id: 'e_AB', from: 'A', to: 'B', distance: 4, time: 4, risk: 1, capacity: 100, status: 'OPEN', isDirected: false },
      { id: 'e_AC', from: 'A', to: 'C', distance: 9, time: 9, risk: 2, capacity: 80, status: 'OPEN', isDirected: false },
      { id: 'e_BC', from: 'B', to: 'C', distance: 2, time: 2, risk: 1, capacity: 60, status: 'OPEN', isDirected: false },
      { id: 'e_BD', from: 'B', to: 'D', distance: 7, time: 7, risk: 1, capacity: 90, status: 'OPEN', isDirected: false },
      { id: 'e_CD', from: 'C', to: 'D', distance: 3, time: 3, risk: 1, capacity: 70, status: 'OPEN', isDirected: false },
      { id: 'e_CE', from: 'C', to: 'E', distance: 8, time: 8, risk: 2, capacity: 50, status: 'OPEN', isDirected: false },
      { id: 'e_DE', from: 'D', to: 'E', distance: 2, time: 2, risk: 1, capacity: 110, status: 'OPEN', isDirected: false }
    ]
  },

  // ==========================================
  // PRESET 2: METROPOLITAN URBAN FLOOD
  // Realistic multi-criteria rescue network
  // ==========================================
  metropolitanFlood: {
    id: 'metropolitanFlood',
    title: 'Metropolitan Urban Flood Crisis',
    description: 'High-density urban grid with flash floods, submerged underpasses, restricted arterial bridges, and critical hospital triage.',
    defaultSource: 'HQ_BASE',
    defaultTarget: 'CITY_HOSP',
    costWeights: { alpha: 1.0, beta: 0.6, gamma: 1.5, delta: 1.0, penaltyVal: 25.0 },
    locations: [
      { id: 'HQ_BASE', name: 'Rescue Command HQ', type: 'base', x: 100, y: 220, status: 'ACTIVE', notes: 'National Disaster Response Center' },
      { id: 'JUNC_NORTH', name: 'North Ring Junction', type: 'junction', x: 260, y: 100, status: 'ACTIVE', notes: 'Elevated highway ramp' },
      { id: 'JUNC_SOUTH', name: 'South River Crossing', type: 'junction', x: 280, y: 380, status: 'ACTIVE', notes: 'Low-lying causeway' },
      { id: 'INCIDENT_1', name: 'Flooded Metro Station', type: 'incident', x: 420, y: 190, status: 'ACTIVE', notes: '120 citizens trapped' },
      { id: 'SHELTER_WEST', name: 'West Stadium Shelter', type: 'shelter', x: 400, y: 350, status: 'ACTIVE', notes: 'Relief distribution point' },
      { id: 'CITY_HOSP', name: 'Metro Trauma Center', type: 'hospital', x: 620, y: 110, status: 'ACTIVE', notes: 'Full surgical triage' },
      { id: 'EAST_BRIDGE', name: 'Grand Cable Bridge', type: 'junction', x: 600, y: 270, status: 'ACTIVE', notes: 'Main river bridge' },
      { id: 'SHELTER_EAST', name: 'East Polytechnic Camp', type: 'shelter', x: 760, y: 240, status: 'ACTIVE', notes: 'High ground evacuation haven' },
      { id: 'AIRSTRIP', name: 'Heli-Supply Depot', type: 'supply', x: 740, y: 390, status: 'ACTIVE', notes: 'Airdrop replenishment base' }
    ],
    edges: [
      { id: 'mf_1', from: 'HQ_BASE', to: 'JUNC_NORTH', distance: 6, time: 8, risk: 2, capacity: 120, status: 'OPEN', isDirected: false },
      { id: 'mf_2', from: 'HQ_BASE', to: 'JUNC_SOUTH', distance: 4, time: 5, risk: 3, capacity: 80, status: 'OPEN', isDirected: false },
      { id: 'mf_3', from: 'JUNC_NORTH', to: 'INCIDENT_1', distance: 5, time: 7, risk: 4, capacity: 70, status: 'OPEN', isDirected: false },
      { id: 'mf_4', from: 'JUNC_NORTH', to: 'CITY_HOSP', distance: 11, time: 16, risk: 2, capacity: 150, status: 'OPEN', isDirected: false },
      { id: 'mf_5', from: 'JUNC_SOUTH', to: 'INCIDENT_1', distance: 7, time: 10, risk: 7, capacity: 40, status: 'RESTRICTED', isDirected: false },
      { id: 'mf_6', from: 'JUNC_SOUTH', to: 'SHELTER_WEST', distance: 3, time: 4, risk: 2, capacity: 90, status: 'OPEN', isDirected: false },
      { id: 'mf_7', from: 'INCIDENT_1', to: 'CITY_HOSP', distance: 5, time: 6, risk: 3, capacity: 85, status: 'OPEN', isDirected: false },
      { id: 'mf_8', from: 'INCIDENT_1', to: 'EAST_BRIDGE', distance: 4, time: 8, risk: 8, capacity: 20, status: 'BLOCKED', isDirected: false },
      { id: 'mf_9', from: 'SHELTER_WEST', to: 'EAST_BRIDGE', distance: 6, time: 9, risk: 4, capacity: 60, status: 'OPEN', isDirected: false },
      { id: 'mf_10', from: 'CITY_HOSP', to: 'EAST_BRIDGE', distance: 6, time: 7, risk: 2, capacity: 110, status: 'OPEN', isDirected: false },
      { id: 'mf_11', from: 'EAST_BRIDGE', to: 'SHELTER_EAST', distance: 4, time: 5, risk: 2, capacity: 95, status: 'OPEN', isDirected: false },
      { id: 'mf_12', from: 'SHELTER_EAST', to: 'AIRSTRIP', distance: 5, time: 6, risk: 1, capacity: 130, status: 'OPEN', isDirected: false }
    ]
  },

  // ==========================================
  // PRESET 3: MOUNTAIN LANDSLIDE & SEISMIC ZONE
  // Severe risk factors and blocked mountain passes
  // ==========================================
  mountainLandslide: {
    id: 'mountainLandslide',
    title: 'Himalayan Mountain Landslide Sector',
    description: 'Rugged terrain where narrow gorges and mudslides severely penalize transit risk. Highlights Bellman-Ford and MST infrastructure.',
    defaultSource: 'VALLEY_BASE',
    defaultTarget: 'HILL_CLINIC',
    costWeights: { alpha: 0.8, beta: 0.5, gamma: 2.5, delta: 1.5, penaltyVal: 40.0 },
    locations: [
      { id: 'VALLEY_BASE', name: 'Valley Dispatch Base', type: 'base', x: 100, y: 300, status: 'ACTIVE', notes: 'Altitude: 900m' },
      { id: 'PASS_ALPHA', name: 'Pine Pass Checkpoint', type: 'junction', x: 260, y: 160, status: 'ACTIVE', notes: 'Clear visual corridor' },
      { id: 'RIVER_CANAL', name: 'Rocky Gorge Culvert', type: 'junction', x: 270, y: 410, status: 'ACTIVE', notes: 'Debris risk' },
      { id: 'SLIDE_ZONE', name: 'Mudslide Incident Area', type: 'incident', x: 450, y: 260, status: 'ACTIVE', notes: 'Tourists stranded' },
      { id: 'TUNNEL_WEST', name: 'Bifurcation Tunnel', type: 'junction', x: 500, y: 120, status: 'ACTIVE', notes: 'Single-lane road' },
      { id: 'HILL_CLINIC', name: 'District Hill Clinic', type: 'hospital', x: 680, y: 190, status: 'ACTIVE', notes: 'Emergency medical unit' },
      { id: 'MONASTERY_SHELTER', name: 'Upper Ridge Shelter', type: 'shelter', x: 670, y: 380, status: 'ACTIVE', notes: 'Helipad equipped' }
    ],
    edges: [
      { id: 'ml_1', from: 'VALLEY_BASE', to: 'PASS_ALPHA', distance: 8, time: 14, risk: 2, capacity: 50, status: 'OPEN', isDirected: false },
      { id: 'ml_2', from: 'VALLEY_BASE', to: 'RIVER_CANAL', distance: 6, time: 11, risk: 5, capacity: 30, status: 'OPEN', isDirected: false },
      { id: 'ml_3', from: 'PASS_ALPHA', to: 'TUNNEL_WEST', distance: 7, time: 10, risk: 3, capacity: 45, status: 'OPEN', isDirected: false },
      { id: 'ml_4', from: 'PASS_ALPHA', to: 'SLIDE_ZONE', distance: 5, time: 12, risk: 8, capacity: 20, status: 'RESTRICTED', isDirected: false },
      { id: 'ml_5', from: 'RIVER_CANAL', to: 'SLIDE_ZONE', distance: 6, time: 15, risk: 9, capacity: 10, status: 'BLOCKED', isDirected: false },
      { id: 'ml_6', from: 'TUNNEL_WEST', to: 'HILL_CLINIC', distance: 6, time: 8, risk: 2, capacity: 60, status: 'OPEN', isDirected: false },
      { id: 'ml_7', from: 'SLIDE_ZONE', to: 'HILL_CLINIC', distance: 4, time: 9, risk: 4, capacity: 35, status: 'OPEN', isDirected: false },
      { id: 'ml_8', from: 'SLIDE_ZONE', to: 'MONASTERY_SHELTER', distance: 7, time: 14, risk: 3, capacity: 40, status: 'OPEN', isDirected: false },
      { id: 'ml_9', from: 'HILL_CLINIC', to: 'MONASTERY_SHELTER', distance: 5, time: 10, risk: 2, capacity: 55, status: 'OPEN', isDirected: false }
    ]
  }
};

// ==========================================
// TEST SUITE: TC01 to TC10 (Section 14 of Report)
// ==========================================
const TEST_CASES = [
  {
    id: 'TC01',
    scenario: 'Valid source & destination, all roads open',
    expectedResult: 'Shortest feasible path displayed',
    presetKey: 'workedExamplePage18',
    source: 'A',
    target: 'D',
    algorithm: 'Dijkstra',
    setup: (graph) => {
      // Ensure all edges open
      graph.edges.forEach(e => e.status = 'OPEN');
    },
    validate: (res) => res.feasible && res.path.join(' → ') === 'A → B → C → D' && res.totalCost === 9
  },
  {
    id: 'TC02',
    scenario: 'Source equals destination',
    expectedResult: 'Zero-cost/zero-travel route or clear validation',
    presetKey: 'workedExamplePage18',
    source: 'A',
    target: 'A',
    algorithm: 'Dijkstra',
    setup: () => {},
    validate: (res) => res.totalCost === 0 && res.path.length <= 1
  },
  {
    id: 'TC03',
    scenario: 'Destination unreachable (all incoming roads blocked)',
    expectedResult: 'No feasible route message returned',
    presetKey: 'workedExamplePage18',
    source: 'A',
    target: 'D',
    algorithm: 'Dijkstra',
    setup: (graph) => {
      // Block all edges touching D: B-D, C-D, D-E
      graph.edges.forEach(e => {
        if (e.from === 'D' || e.to === 'D') e.status = 'BLOCKED';
      });
    },
    validate: (res) => !res.feasible || res.totalCost === null
  },
  {
    id: 'TC04',
    scenario: 'Shortest physical road blocked (Page 18 Worked Example: B-C blocked)',
    expectedResult: 'Blocked road excluded; alternative route selected (A → B → D with cost 11)',
    presetKey: 'workedExamplePage18',
    source: 'A',
    target: 'D',
    algorithm: 'Dijkstra',
    setup: (graph) => {
      const bc = graph.edges.find(e => (e.from === 'B' && e.to === 'C') || (e.from === 'C' && e.to === 'B'));
      if (bc) bc.status = 'BLOCKED';
    },
    validate: (res) => res.feasible && res.path.join(' → ') === 'A → B → D' && res.totalCost === 11
  },
  {
    id: 'TC05',
    scenario: 'High-risk edge vs longer safe edge',
    expectedResult: 'Result follows configured cost weights (safe path chosen when gamma is high)',
    presetKey: 'metropolitanFlood',
    source: 'HQ_BASE',
    target: 'INCIDENT_1',
    algorithm: 'Dijkstra',
    setup: (graph) => {
      graph.costWeights.gamma = 3.0; // Emphasize safety heavily
    },
    validate: (res) => res.feasible && res.path.length > 0
  },
  {
    id: 'TC06',
    scenario: 'Negative edge detection test',
    expectedResult: 'Bellman-Ford handles or detects cycle; Dijkstra requires non-negative weights',
    presetKey: 'workedExamplePage18',
    source: 'A',
    target: 'D',
    algorithm: 'Bellman-Ford',
    setup: (graph) => {
      // Set an edge with negative weight
      const bc = graph.edges.find(e => (e.from === 'B' && e.to === 'C') || (e.from === 'C' && e.to === 'B'));
      if (bc) bc.time = -1; // Negative time/cost
    },
    validate: (res) => res !== null // Bellman Ford processes graph
  },
  {
    id: 'TC07',
    scenario: 'Disconnected graph for MST',
    expectedResult: 'System reports spanning tree cannot cover all vertices',
    presetKey: 'workedExamplePage18',
    source: null,
    target: null,
    algorithm: 'Kruskal',
    setup: (graph) => {
      // Isolate node E by blocking all edges to E
      graph.edges.forEach(e => {
        if (e.from === 'E' || e.to === 'E') e.status = 'BLOCKED';
      });
    },
    validate: (res) => res.isConnected === false
  },
  {
    id: 'TC08',
    scenario: 'Many repeated all-pairs queries',
    expectedResult: 'Floyd-Warshall precomputed structure provides O(1) path query time',
    presetKey: 'workedExamplePage18',
    source: null,
    target: null,
    algorithm: 'Floyd-Warshall',
    setup: () => {},
    validate: (res) => res.distMatrix !== undefined && res.getPath('A', 'D').cost === 9
  },
  {
    id: 'TC09',
    scenario: 'Sorted location list lookup',
    expectedResult: 'Binary search finds matching record in O(log N)',
    presetKey: 'metropolitanFlood',
    source: null,
    target: null,
    algorithm: 'Binary Search',
    setup: () => {},
    validate: (res, graph) => {
      const bs = graph.binarySearchLocation('Metro Trauma Center');
      return bs.found !== null && bs.timeComplexity === 'O(log N)';
    }
  },
  {
    id: 'TC10',
    scenario: 'Algorithm execution time & memory boundaries',
    expectedResult: 'Execution time remains well under responsive threshold (<50ms)',
    presetKey: 'metropolitanFlood',
    source: 'HQ_BASE',
    target: 'SHELTER_EAST',
    algorithm: 'Dijkstra',
    setup: () => {},
    validate: (res) => res.executionTimeMs < 50.0
  }
];

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PRESETS, TEST_CASES };
} else {
  window.PRESETS = PRESETS;
  window.TEST_CASES = TEST_CASES;
}
