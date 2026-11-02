/**
 * DISASTER RESCUE PATH PLANNING SYSTEM
 * Module: Core Algorithms Engine (M7, M8, M9)
 *
 * Implements:
 * 1. Min-Priority Queue (Min-Heap) for O((V+E) log V) Dijkstra & Prim
 * 2. Disjoint Set Union (DSU) with Path Compression & Union by Rank for Kruskal
 * 3. Dijkstra's Algorithm (Primary Path Planner)
 * 4. Bellman-Ford Algorithm (Handles Negative Edges & Cycle Detection)
 * 5. Floyd-Warshall Algorithm (All-Pairs Shortest Path - Dynamic Programming)
 * 6. Prim's Algorithm (Minimum-Cost Infrastructure Spanning Tree)
 * 7. Kruskal's Algorithm (MST from sorted edge list)
 * 8. Breadth-First Search (BFS - Unweighted Reachability)
 * 9. Depth-First Search (DFS - Graph Traversal)
 * 10. Warshall's Algorithm (Transitive Closure / Reachability Matrix)
 */

// ==========================================
// 1. MIN-PRIORITY QUEUE (BINARY MIN-HEAP)
// Transform-and-Conquer Paradigm (Unit-2)
// ==========================================
class MinPriorityQueue {
  constructor() {
    this.heap = [];
  }

  insert(key, priority) {
    const node = { key, priority };
    this.heap.push(node);
    this._bubbleUp(this.heap.length - 1);
  }

  extractMin() {
    if (this.isEmpty()) return null;
    const min = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this._sinkDown(0);
    }
    return min;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  size() {
    return this.heap.length;
  }

  _bubbleUp(index) {
    const node = this.heap[index];
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIdx];
      if (node.priority >= parent.priority) break;
      this.heap[index] = parent;
      index = parentIdx;
    }
    this.heap[index] = node;
  }

  _sinkDown(index) {
    const length = this.heap.length;
    const node = this.heap[index];
    while (true) {
      let leftChildIdx = 2 * index + 1;
      let rightChildIdx = 2 * index + 2;
      let swap = null;

      if (leftChildIdx < length) {
        if (this.heap[leftChildIdx].priority < node.priority) {
          swap = leftChildIdx;
        }
      }

      if (rightChildIdx < length) {
        const rightChild = this.heap[rightChildIdx];
        if (
          (swap === null && rightChild.priority < node.priority) ||
          (swap !== null && rightChild.priority < this.heap[leftChildIdx].priority)
        ) {
          swap = rightChildIdx;
        }
      }

      if (swap === null) break;
      this.heap[index] = this.heap[swap];
      index = swap;
    }
    this.heap[index] = node;
  }
}

// ==========================================
// 2. DISJOINT SET UNION (UNION-FIND)
// ==========================================
class DisjointSet {
  constructor(elements) {
    this.parent = new Map();
    this.rank = new Map();
    for (const elem of elements) {
      this.parent.set(elem, elem);
      this.rank.set(elem, 0);
    }
  }

  find(i) {
    if (this.parent.get(i) === i) return i;
    // Path compression
    const root = this.find(this.parent.get(i));
    this.parent.set(i, root);
    return root;
  }

  union(i, j) {
    const rootI = this.find(i);
    const rootJ = this.find(j);
    if (rootI === rootJ) return false;

    // Union by rank
    const rankI = this.rank.get(rootI);
    const rankJ = this.rank.get(rootJ);
    if (rankI < rankJ) {
      this.parent.set(rootI, rootJ);
    } else if (rankI > rankJ) {
      this.parent.set(rootJ, rootI);
    } else {
      this.parent.set(rootJ, rootI);
      this.rank.set(rootI, rankI + 1);
    }
    return true;
  }
}

// ==========================================
// 3. DIJKSTRA'S ALGORITHM
// Time: O((V + E) log V) | Space: O(V + E)
// ==========================================
function dijkstra(graph, sourceId, targetId, weightsConfig = null, recordTrace = true) {
  const startTime = performance.now();
  const adj = graph.getAdjacencyList(false, weightsConfig);
  const locations = graph.getAllLocations();

  const dist = new Map();
  const prev = new Map();
  const visited = new Set();
  const steps = [];

  for (const loc of locations) {
    dist.set(loc.id, Infinity);
    prev.set(loc.id, null);
  }

  dist.set(sourceId, 0);
  const pq = new MinPriorityQueue();
  pq.insert(sourceId, 0);

  if (recordTrace) {
    steps.push({
      type: 'INIT',
      description: `Initialized Dijkstra from Source: ${sourceId}`,
      source: sourceId,
      target: targetId,
      currentDistances: new Map(dist)
    });
  }

  let iterations = 0;

  while (!pq.isEmpty()) {
    iterations++;
    const { key: u, priority: currentD } = pq.extractMin();

    if (visited.has(u)) continue;
    visited.add(u);

    if (recordTrace) {
      steps.push({
        type: 'EXTRACT_MIN',
        node: u,
        cost: currentD,
        description: `Finalized node [${u}] with minimum distance = ${currentD.toFixed(2)}`
      });
    }

    // Early exit if target is finalized
    if (targetId && u === targetId) {
      break;
    }

    const neighbors = adj.get(u) || [];
    for (const { neighbor: v, weight, edge } of neighbors) {
      if (visited.has(v)) continue;

      const alt = currentD + weight;
      const oldD = dist.get(v);

      if (alt < oldD) {
        dist.set(v, alt);
        prev.set(v, { from: u, edge });
        pq.insert(v, alt);

        if (recordTrace) {
          steps.push({
            type: 'RELAX',
            from: u,
            to: v,
            oldDist: oldD === Infinity ? 'INF' : oldD.toFixed(2),
            newDist: alt.toFixed(2),
            edgeWeight: weight.toFixed(2),
            description: `Relaxed edge (${u} → ${v}): updated dist to ${alt.toFixed(2)}`
          });
        }
      }
    }
  }

  // Reconstruct path
  const path = [];
  const edgesInPath = [];
  let curr = targetId;

  if (dist.get(targetId) !== Infinity) {
    while (curr) {
      path.unshift(curr);
      const prevInfo = prev.get(curr);
      if (prevInfo) {
        edgesInPath.unshift(prevInfo.edge);
        curr = prevInfo.from;
      } else {
        break;
      }
    }
  }

  // Compute metrics from actual edges
  let totalDistance = 0;
  let totalTime = 0;
  let totalRisk = 0;

  for (const edge of edgesInPath) {
    totalDistance += edge.distance;
    totalTime += edge.time;
    totalRisk += edge.risk;
  }

  const avgRisk = edgesInPath.length > 0 ? (totalRisk / edgesInPath.length).toFixed(1) : 0;
  const executionTimeMs = (performance.now() - startTime).toFixed(3);

  return {
    algorithm: 'Dijkstra',
    feasible: path.length > 0 && path[0] === sourceId,
    source: sourceId,
    target: targetId,
    path,
    edges: edgesInPath,
    totalCost: dist.get(targetId) === Infinity ? null : Number(dist.get(targetId).toFixed(2)),
    totalDistance: Number(totalDistance.toFixed(2)),
    totalTime: Number(totalTime.toFixed(1)),
    avgRisk: Number(avgRisk),
    visitedNodes: Array.from(visited),
    distances: dist,
    steps,
    iterations,
    executionTimeMs: Number(executionTimeMs),
    complexity: {
      time: 'O((V + E) log V)',
      space: 'O(V + E)'
    }
  };
}

// ==========================================
// 4. BELLMAN-FORD ALGORITHM
// Time: O(V * E) | Space: O(V)
// Supports negative adjustments & negative cycle detection
// ==========================================
function bellmanFord(graph, sourceId, targetId, weightsConfig = null, recordTrace = true) {
  const startTime = performance.now();
  const locations = graph.getAllLocations();
  const edges = graph.edges.filter(e => e.status !== 'BLOCKED');

  const dist = new Map();
  const prev = new Map();
  const steps = [];

  for (const loc of locations) {
    dist.set(loc.id, Infinity);
    prev.set(loc.id, null);
  }
  dist.set(sourceId, 0);

  const V = locations.length;
  let relaxedInPass = false;

  // Relax edges |V| - 1 times
  for (let i = 1; i < V; i++) {
    relaxedInPass = false;

    for (const edge of edges) {
      const u = edge.from;
      const v = edge.to;
      const w = graph.calculateEdgeCost(edge, weightsConfig);

      // Directed or Undirected handling
      const forwardCheck = (fromNode, toNode) => {
        if (dist.get(fromNode) !== Infinity && dist.get(fromNode) + w < dist.get(toNode)) {
          dist.set(toNode, dist.get(fromNode) + w);
          prev.set(toNode, { from: fromNode, edge });
          relaxedInPass = true;
          if (recordTrace) {
            steps.push({
              type: 'PASS_RELAX',
              pass: i,
              from: fromNode,
              to: toNode,
              newDist: dist.get(toNode).toFixed(2),
              description: `Pass ${i}: relaxed (${fromNode} → ${toNode}) to ${dist.get(toNode).toFixed(2)}`
            });
          }
        }
      };

      forwardCheck(u, v);
      if (!edge.isDirected) {
        forwardCheck(v, u);
      }
    }

    if (!relaxedInPass) break; // Optimization
  }

  // Check for negative-weight cycles
  let hasNegativeCycle = false;
  for (const edge of edges) {
    const u = edge.from;
    const v = edge.to;
    const w = graph.calculateEdgeCost(edge, weightsConfig);

    if (dist.get(u) !== Infinity && dist.get(u) + w < dist.get(v)) {
      hasNegativeCycle = true;
      break;
    }
    if (!edge.isDirected && dist.get(v) !== Infinity && dist.get(v) + w < dist.get(u)) {
      hasNegativeCycle = true;
      break;
    }
  }

  // Reconstruct path
  const path = [];
  const edgesInPath = [];
  let curr = targetId;

  if (!hasNegativeCycle && dist.get(targetId) !== Infinity) {
    while (curr) {
      path.unshift(curr);
      const prevInfo = prev.get(curr);
      if (prevInfo) {
        edgesInPath.unshift(prevInfo.edge);
        curr = prevInfo.from;
      } else {
        break;
      }
    }
  }

  let totalDistance = 0;
  let totalTime = 0;
  let totalRisk = 0;

  for (const edge of edgesInPath) {
    totalDistance += edge.distance;
    totalTime += edge.time;
    totalRisk += edge.risk;
  }

  const avgRisk = edgesInPath.length > 0 ? (totalRisk / edgesInPath.length).toFixed(1) : 0;
  const executionTimeMs = (performance.now() - startTime).toFixed(3);

  return {
    algorithm: 'Bellman-Ford',
    feasible: !hasNegativeCycle && path.length > 0 && path[0] === sourceId,
    hasNegativeCycle,
    source: sourceId,
    target: targetId,
    path,
    edges: edgesInPath,
    totalCost: dist.get(targetId) === Infinity || hasNegativeCycle ? null : Number(dist.get(targetId).toFixed(2)),
    totalDistance: Number(totalDistance.toFixed(2)),
    totalTime: Number(totalTime.toFixed(1)),
    avgRisk: Number(avgRisk),
    distances: dist,
    steps,
    executionTimeMs: Number(executionTimeMs),
    complexity: {
      time: 'O(V * E)',
      space: 'O(V)'
    }
  };
}

// ==========================================
// 5. FLOYD-WARSHALL ALGORITHM (Dynamic Programming)
// All-Pairs Shortest Path: O(V^3) | Space: O(V^2)
// D[k][i][j] = min(D[k-1][i][j], D[k-1][i][k] + D[k-1][k][j])
// ==========================================
function floydWarshall(graph, weightsConfig = null) {
  const startTime = performance.now();
  const { nodes, idToIndex, matrix } = graph.getAdjacencyMatrix(false, weightsConfig);
  const V = nodes.length;

  // Initialize dist and next pointer matrix
  const dist = Array.from({ length: V }, (_, i) => [...matrix[i]]);
  const next = Array.from({ length: V }, () => Array(V).fill(null));

  for (let i = 0; i < V; i++) {
    for (let j = 0; j < V; j++) {
      if (i !== j && dist[i][j] !== Infinity) {
        next[i][j] = j;
      }
    }
  }

  // Triple nested loop
  for (let k = 0; k < V; k++) {
    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        if (dist[i][k] !== Infinity && dist[k][j] !== Infinity) {
          if (dist[i][k] + dist[k][j] < dist[i][j]) {
            dist[i][j] = dist[i][k] + dist[k][j];
            next[i][j] = next[i][k];
          }
        }
      }
    }
  }

  const executionTimeMs = (performance.now() - startTime).toFixed(3);

  // Helper function to reconstruct path between any pair
  const getPath = (sourceId, targetId) => {
    const u = idToIndex.get(sourceId);
    const v = idToIndex.get(targetId);
    if (u === undefined || v === undefined || dist[u][v] === Infinity) {
      return { path: [], cost: Infinity };
    }

    const path = [sourceId];
    let curr = u;
    while (curr !== v) {
      curr = next[curr][v];
      if (curr === null) return { path: [], cost: Infinity };
      path.push(nodes[curr].id);
    }

    return {
      path,
      cost: Number(dist[u][v].toFixed(2))
    };
  };

  return {
    algorithm: 'Floyd-Warshall',
    nodes,
    idToIndex,
    distMatrix: dist,
    nextMatrix: next,
    getPath,
    executionTimeMs: Number(executionTimeMs),
    complexity: {
      time: 'O(V³)',
      space: 'O(V²)'
    }
  };
}

// ==========================================
// 6. PRIM'S ALGORITHM (Minimum Spanning Tree)
// Greedy Paradigm: O((V + E) log V) with Min-Heap
// ==========================================
function primMST(graph, startNodeId = null, weightsConfig = null) {
  const startTime = performance.now();
  const locations = graph.getAllLocations();
  if (locations.length === 0) return { mstEdges: [], totalCost: 0, isConnected: false };

  const startId = startNodeId || locations[0].id;
  const adj = graph.getAdjacencyList(false, weightsConfig);

  const visited = new Set([startId]);
  const mstEdges = [];
  const steps = [];
  let totalCost = 0;

  const pq = new MinPriorityQueue();

  // Enqueue edges from start node
  const startNeighbors = adj.get(startId) || [];
  for (const { neighbor, weight, edge } of startNeighbors) {
    pq.insert({ from: startId, to: neighbor, edge, weight }, weight);
  }

  while (!pq.isEmpty() && visited.size < locations.length) {
    const minItem = pq.extractMin();
    const { from, to, edge, weight } = minItem.key;

    if (visited.has(to)) continue;

    visited.add(to);
    mstEdges.push(edge);
    totalCost += weight;

    steps.push({
      type: 'ADD_EDGE',
      from,
      to,
      weight: weight.toFixed(2),
      description: `Added edge (${from} - ${to}) with cost ${weight.toFixed(2)} to MST`
    });

    const neighbors = adj.get(to) || [];
    for (const nb of neighbors) {
      if (!visited.has(nb.neighbor)) {
        pq.insert({ from: to, to: nb.neighbor, edge: nb.edge, weight: nb.weight }, nb.weight);
      }
    }
  }

  const isConnected = visited.size === locations.length;
  const executionTimeMs = (performance.now() - startTime).toFixed(3);

  return {
    algorithm: "Prim's Algorithm",
    startNode: startId,
    mstEdges,
    totalCost: Number(totalCost.toFixed(2)),
    visitedNodes: Array.from(visited),
    totalNodes: locations.length,
    isConnected,
    steps,
    executionTimeMs: Number(executionTimeMs),
    complexity: {
      time: 'O((V + E) log V)',
      space: 'O(V + E)'
    }
  };
}

// ==========================================
// 7. KRUSKAL'S ALGORITHM (Minimum Spanning Tree)
// Greedy Paradigm with DSU: O(E log E)
// ==========================================
function kruskalMST(graph, weightsConfig = null) {
  const startTime = performance.now();
  const locations = graph.getAllLocations();
  const locIds = locations.map(l => l.id);

  // Filter feasible edges
  const feasibleEdges = graph.edges
    .filter(e => e.status !== 'BLOCKED')
    .map(e => ({
      edge: e,
      weight: graph.calculateEdgeCost(e, weightsConfig)
    }));

  // Sort edges by weight in ascending order (Greedy step)
  feasibleEdges.sort((a, b) => a.weight - b.weight);

  const dsu = new DisjointSet(locIds);
  const mstEdges = [];
  const steps = [];
  let totalCost = 0;

  for (const item of feasibleEdges) {
    const { edge, weight } = item;
    const u = edge.from;
    const v = edge.to;

    // Check if adding edge forms a cycle
    if (dsu.find(u) !== dsu.find(v)) {
      dsu.union(u, v);
      mstEdges.push(edge);
      totalCost += weight;

      steps.push({
        type: 'UNION_EDGE',
        from: u,
        to: v,
        weight: weight.toFixed(2),
        description: `Accepted edge (${u} - ${v}) of weight ${weight.toFixed(2)} (no cycle formed)`
      });

      if (mstEdges.length === locIds.length - 1) {
        break; // Spanning tree complete
      }
    } else {
      steps.push({
        type: 'DISCARD_EDGE',
        from: u,
        to: v,
        weight: weight.toFixed(2),
        description: `Rejected edge (${u} - ${v}) because it creates a cycle`
      });
    }
  }

  // Check connectivity
  let root = null;
  let isConnected = true;
  if (locIds.length > 0) {
    root = dsu.find(locIds[0]);
    for (let i = 1; i < locIds.length; i++) {
      if (dsu.find(locIds[i]) !== root) {
        isConnected = false;
        break;
      }
    }
  }

  const executionTimeMs = (performance.now() - startTime).toFixed(3);

  return {
    algorithm: "Kruskal's Algorithm",
    mstEdges,
    totalCost: Number(totalCost.toFixed(2)),
    edgeCount: mstEdges.length,
    totalNodes: locIds.length,
    isConnected,
    steps,
    executionTimeMs: Number(executionTimeMs),
    complexity: {
      time: 'O(E log E)',
      space: 'O(V + E)'
    }
  };
}

// ==========================================
// 8. BREADTH-FIRST SEARCH (BFS)
// Reachability & Unweighted Shortest Path
// ==========================================
function bfs(graph, sourceId, targetId = null) {
  const startTime = performance.now();
  const adj = graph.getAdjacencyList(false);
  const visited = new Set([sourceId]);
  const queue = [sourceId];
  const parent = new Map([[sourceId, null]]);
  const order = [];

  while (queue.length > 0) {
    const u = queue.shift();
    order.push(u);

    if (targetId && u === targetId) break;

    const neighbors = adj.get(u) || [];
    for (const { neighbor } of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent.set(neighbor, u);
        queue.push(neighbor);
      }
    }
  }

  // Reconstruct path if target requested
  const path = [];
  if (targetId && visited.has(targetId)) {
    let curr = targetId;
    while (curr) {
      path.unshift(curr);
      curr = parent.get(curr);
    }
  }

  const executionTimeMs = (performance.now() - startTime).toFixed(3);

  return {
    algorithm: 'BFS',
    source: sourceId,
    target: targetId,
    visitedNodes: Array.from(visited),
    traversalOrder: order,
    path,
    executionTimeMs: Number(executionTimeMs),
    complexity: {
      time: 'O(V + E)',
      space: 'O(V)'
    }
  };
}

// ==========================================
// 9. DEPTH-FIRST SEARCH (DFS)
// Traversal and Topological Precedence
// ==========================================
function dfs(graph, sourceId) {
  const startTime = performance.now();
  const adj = graph.getAdjacencyList(false);
  const visited = new Set();
  const order = [];

  function explore(u) {
    visited.add(u);
    order.push(u);

    const neighbors = adj.get(u) || [];
    for (const { neighbor } of neighbors) {
      if (!visited.has(neighbor)) {
        explore(neighbor);
      }
    }
  }

  explore(sourceId);
  const executionTimeMs = (performance.now() - startTime).toFixed(3);

  return {
    algorithm: 'DFS',
    source: sourceId,
    visitedNodes: Array.from(visited),
    traversalOrder: order,
    executionTimeMs: Number(executionTimeMs),
    complexity: {
      time: 'O(V + E)',
      space: 'O(V)'
    }
  };
}

// ==========================================
// 10. WARSHALL'S ALGORITHM (Transitive Closure)
// Reachability Matrix: R[i][j] = R[i][j] OR (R[i][k] AND R[k][j])
// ==========================================
function warshallReachability(graph) {
  const startTime = performance.now();
  const { nodes, idToIndex, matrix } = graph.getAdjacencyMatrix(false);
  const V = nodes.length;

  // Boolean reachability matrix
  const R = Array.from({ length: V }, (_, i) => 
    Array.from({ length: V }, (_, j) => matrix[i][j] !== Infinity || i === j)
  );

  for (let k = 0; k < V; k++) {
    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        R[i][j] = R[i][j] || (R[i][k] && R[k][j]);
      }
    }
  }

  const executionTimeMs = (performance.now() - startTime).toFixed(3);

  return {
    algorithm: "Warshall's Algorithm",
    nodes,
    idToIndex,
    reachabilityMatrix: R,
    executionTimeMs: Number(executionTimeMs),
    complexity: {
      time: 'O(V³)',
      space: 'O(V²)'
    }
  };
}

// Export for ES modules and browser global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MinPriorityQueue,
    DisjointSet,
    dijkstra,
    bellmanFord,
    floydWarshall,
    primMST,
    kruskalMST,
    bfs,
    dfs,
    warshallReachability
  };
} else {
  window.MinPriorityQueue = MinPriorityQueue;
  window.DisjointSet = DisjointSet;
  window.dijkstra = dijkstra;
  window.bellmanFord = bellmanFord;
  window.floydWarshall = floydWarshall;
  window.primMST = primMST;
  window.kruskalMST = kruskalMST;
  window.bfs = bfs;
  window.dfs = dfs;
  window.warshallReachability = warshallReachability;
}
