/**
 * DISASTER RESCUE PATH PLANNING SYSTEM
 * Module: Graph Representation & Multi-Criteria Cost Engine (M3, M4, M5, M6)
 *
 * Implements:
 * - Location (Vertex) model with coordinates, type and operational status
 * - Edge (Road connection) model with distance, time, risk, capacity and status
 * - Graph data structure supporting Adjacency List and Adjacency Matrix
 * - Multi-criteria cost calculation formula:
 *     Cost(e) = α * Time(e) + β * Distance(e) + γ * Risk(e) + δ * Penalty(e)
 * - Filtering of BLOCKED edges and penalization of RESTRICTED edges
 */

class Location {
  constructor({ id, name, type = 'junction', x = 0, y = 0, status = 'ACTIVE', notes = '' }) {
    this.id = id;
    this.name = name;
    this.type = type; // 'base' | 'hospital' | 'incident' | 'shelter' | 'junction' | 'supply'
    this.x = x;
    this.y = y;
    this.status = status; // 'ACTIVE' | 'ISOLATED' | 'HAZARDOUS'
    this.notes = notes;
  }
}

class Edge {
  constructor({
    id,
    from,
    to,
    distance = 1,      // in kilometers (km)
    time = 2,          // in minutes (min)
    risk = 1,          // risk score (1 to 10 scale)
    capacity = 100,    // vehicles/hr
    status = 'OPEN',   // 'OPEN' | 'RESTRICTED' | 'BLOCKED'
    isDirected = false // whether edge is one-way
  }) {
    this.id = id || `${from}_${to}_${Date.now()}`;
    this.from = from;
    this.to = to;
    this.distance = Number(distance);
    this.time = Number(time);
    this.risk = Number(risk);
    this.capacity = Number(capacity);
    this.status = status;
    this.isDirected = isDirected;
  }
}

class Graph {
  constructor() {
    this.locations = new Map(); // id -> Location
    this.edges = [];            // list of Edge instances

    // Default Multi-Criteria Cost Weights (from DAA Report Sec 6.4)
    this.costWeights = {
      alpha: 1.0,   // Weight for Travel Time (minutes)
      beta: 0.8,    // Weight for Distance (km)
      gamma: 1.5,   // Weight for Risk score (1-10)
      delta: 1.0,   // Weight for Restriction penalty
      penaltyVal: 30.0 // Extra penalty score for RESTRICTED roads
    };
  }

  // --- Location (Vertex) Operations ---
  addLocation(locationData) {
    const location = new Location(locationData);
    this.locations.set(location.id, location);
    return location;
  }

  removeLocation(id) {
    if (!this.locations.has(id)) return false;
    this.locations.delete(id);
    // Remove all associated edges
    this.edges = this.edges.filter(e => e.from !== id && e.to !== id);
    return true;
  }

  getLocation(id) {
    return this.locations.get(id);
  }

  getAllLocations() {
    return Array.from(this.locations.values());
  }

  // --- Edge Operations ---
  addEdge(edgeData) {
    const edge = new Edge(edgeData);
    this.edges.push(edge);
    return edge;
  }

  removeEdge(edgeId) {
    const initialLen = this.edges.length;
    this.edges = this.edges.filter(e => e.id !== edgeId);
    return this.edges.length < initialLen;
  }

  findEdge(fromId, toId) {
    return this.edges.find(e => 
      (e.from === fromId && e.to === toId) ||
      (!e.isDirected && e.from === toId && e.to === fromId)
    );
  }

  updateEdgeStatus(edgeId, status) {
    const edge = this.edges.find(e => e.id === edgeId);
    if (edge) {
      edge.status = status;
      return true;
    }
    return false;
  }

  // --- Multi-Criteria Cost Formula ---
  /**
   * Section 6.4: Cost(e) = α·Time(e) + β·Distance(e) + γ·Risk(e) + δ·Penalty(e)
   * Guaranteed to be non-negative for Dijkstra's Algorithm prerequisite.
   */
  calculateEdgeCost(edge, customWeights = null) {
    const w = customWeights || this.costWeights;

    if (edge.status === 'BLOCKED') {
      return Infinity; // Blocked roads are impassable
    }

    const penalty = edge.status === 'RESTRICTED' ? (w.penaltyVal || 30.0) : 0;
    const cost = (w.alpha * edge.time) +
                 (w.beta * edge.distance) +
                 (w.gamma * edge.risk) +
                 (w.delta * penalty);

    return Math.max(0, Number(cost.toFixed(2)));
  }

  // --- Adjacency List Representation (O(V + E) Space) ---
  getAdjacencyList(includeBlocked = false, customWeights = null) {
    const adj = new Map();
    for (const [id] of this.locations) {
      adj.set(id, []);
    }

    for (const edge of this.edges) {
      if (!includeBlocked && edge.status === 'BLOCKED') continue;

      const cost = this.calculateEdgeCost(edge, customWeights);
      
      if (adj.has(edge.from)) {
        adj.get(edge.from).push({
          neighbor: edge.to,
          weight: cost,
          edge: edge
        });
      }

      if (!edge.isDirected && adj.has(edge.to)) {
        adj.get(edge.to).push({
          neighbor: edge.from,
          weight: cost,
          edge: edge
        });
      }
    }
    return adj;
  }

  // --- Adjacency Matrix Representation (O(V^2) Space) ---
  getAdjacencyMatrix(includeBlocked = false, customWeights = null) {
    const locArray = Array.from(this.locations.values());
    const idToIndex = new Map();
    locArray.forEach((loc, idx) => idToIndex.set(loc.id, idx));

    const V = locArray.length;
    const matrix = Array.from({ length: V }, () => Array(V).fill(Infinity));

    // Distance to self is 0
    for (let i = 0; i < V; i++) {
      matrix[i][i] = 0;
    }

    for (const edge of this.edges) {
      if (!includeBlocked && edge.status === 'BLOCKED') continue;

      const u = idToIndex.get(edge.from);
      const v = idToIndex.get(edge.to);

      if (u !== undefined && v !== undefined) {
        const cost = this.calculateEdgeCost(edge, customWeights);
        matrix[u][v] = Math.min(matrix[u][v], cost);
        if (!edge.isDirected) {
          matrix[v][u] = Math.min(matrix[v][u], cost);
        }
      }
    }

    return {
      nodes: locArray,
      idToIndex,
      matrix
    };
  }

  // --- Search Algorithms for Location Lookup (Unit 1 Syllabus) ---
  linearSearchLocation(searchTerm) {
    const term = searchTerm.toLowerCase();
    const locs = this.getAllLocations();
    let steps = 0;
    for (let i = 0; i < locs.length; i++) {
      steps++;
      if (locs[i].id.toLowerCase() === term || locs[i].name.toLowerCase().includes(term)) {
        return { found: locs[i], index: i, steps, timeComplexity: 'O(N)' };
      }
    }
    return { found: null, steps, timeComplexity: 'O(N)' };
  }

  binarySearchLocation(searchTerm) {
    // Sort array by name first
    const sorted = [...this.getAllLocations()].sort((a, b) => a.name.localeCompare(b.name));
    const term = searchTerm.toLowerCase();
    let left = 0;
    let right = sorted.length - 1;
    let steps = 0;
    const trace = [];

    while (left <= right) {
      steps++;
      const mid = Math.floor((left + right) / 2);
      const midName = sorted[mid].name.toLowerCase();
      trace.push({ step: steps, left, right, mid, current: sorted[mid].name });

      if (midName === term || sorted[mid].id.toLowerCase() === term) {
        return { found: sorted[mid], sortedList: sorted, steps, trace, timeComplexity: 'O(log N)' };
      }
      if (midName < term) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    return { found: null, sortedList: sorted, steps, trace, timeComplexity: 'O(log N)' };
  }

  // Clear everything
  clear() {
    this.locations.clear();
    this.edges = [];
  }
}

// Export for ES modules and browser global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Location, Edge, Graph };
} else {
  window.Location = Location;
  window.Edge = Edge;
  window.Graph = Graph;
}
