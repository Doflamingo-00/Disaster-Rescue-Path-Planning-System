# DISASTER RESCUE PATH PLANNING SYSTEM
### Design and Analysis of Algorithms (DAA) — Comprehensive Implementation & Decision-Support System

---

## 📌 1. Project Overview
The **Disaster Rescue Path Planning System** is an algorithmic decision-support and simulation system designed to help emergency rescue teams, dispatch coordinators, and disaster management authorities navigate dynamically compromised networks.

In natural disasters (floods, earthquakes, landslides, cyclones), conventional navigation breaks down due to structural damage, bridge collapses, flash floods, or excessive risk. This project converts the disaster operational theater into a **weighted graph $G = (V, E)$** and evaluates multi-criteria operational costs to guarantee safe, optimal rescue routes.

The project strictly follows the **DAA Syllabus** across Units 1, 2, and 3, incorporating single-source shortest paths, all-pairs shortest paths, minimum spanning trees, dynamic programming, greedy strategies, backtracking, and branch-and-bound optimization.

---

## 🖥️ 2. Official Screen Sequence & Dashboard Flow (Section 15)

The project implements the exact sequential screen flow specified in **Section 15.1 of the DAA Report**:

```text
LOGIN (M1: Operator ID & Role)
  ↓
DASHBOARD (Central Command & Live KPIs)
  ↓
DISASTER / INCIDENT (M2: Incident Log, Severity, Urgency)
  ↓
LOCATIONS (M3: Vertices, Base, Hospital, Shelters, Search)
  ↓
ROADS / ROUTES (M4: Edges, Distance, Risk, Status OPEN/BLOCKED)
  ↓
RESCUE REQUEST (M2/M7: Active Emergency Mission Dispatch)
  ↓
SOURCE + DESTINATION (S & T Selection on Graph)
  ↓
ALGORITHM SELECT (Dijkstra, Bellman-Ford, Floyd-Warshall, BFS)
  ↓
CALCULATE ROUTE (Multi-Criteria Cost Engine & Edge Relaxation)
  ↓
BEST ROUTE (Glowing Animated Canvas Track & Turn-by-Turn)
  ↓
RESULT / REPORT (Section 15.3 Table, Complexity, PDF Export)
```

### Central Tactical Dashboard View (Section 15.1):
```text
---------------------------------------------
   DISASTER RESCUE PATH PLANNING SYSTEM
---------------------------------------------

Active Disasters       3
Open Routes           28
Blocked Routes         7
Rescue Requests       12

[Manage Incidents]
[Manage Locations]
[Manage Roads]
[Plan Rescue Route]
[Algorithm Lab]
[Reports]
---------------------------------------------
```


### Option A: Launch Interactive Web Application
You can run the built-in zero-dependency Python server:
```powershell
python server.py
```
Or use the standard HTTP server:
```powershell
python -m http.server 8000
```
Then open your browser at **[http://localhost:8000](http://localhost:8000)** or double-click **`index.html`** in File Explorer.

---

### Option B: Run Standalone Python CLI & Test Suite
To run the automated verification of **all 10 Test Cases (TC01-TC10)** and the **Page 18 Worked Example**:
```powershell
python disaster_rescue_cli.py
```

Expected terminal output:
```text
===========================================================================
 DAA REPORT SECTION 12: DETAILED WORKED EXAMPLE (PAGE 18)
===========================================================================
Scenario 1: All routes open. Computing route A -> D via Dijkstra:
  Recommended Path : A -> B -> C -> D
  Calculated Cost  : 9.0
  Execution Time   : 0.046 ms
  [OK] Matches Report Page 18: A -> B -> C -> D with total cost 9.

Scenario 2: Edge B-C becomes BLOCKED due to disaster conditions:
  Re-routed Path   : A -> B -> D
  Calculated Cost  : 11.0
  Execution Time   : 0.014 ms
  [OK] Matches Report Page 18: System dynamically re-routed to A -> B -> D with cost 11.
===========================================================================
>>> 10/10 TEST CASES PASSED SUCCESSFULLY! ALL DAA REQUIREMENTS VERIFIED! <<<
```

---

## 🏗️ 3. System Architecture & Module Decomposition

| Module | Name | Purpose | Implementation File |
| :--- | :--- | :--- | :--- |
| **M1** | User & Access Management | Operator authentication & permission roles (Commander, Operator, Examiner) | `index.html`, `js/app.js` |
| **M2** | Incident Management | Disaster classification (Flood, Earthquake, Landslide) & severity levels | `index.html`, `js/presets.js` |
| **M3** | Location Management | Vertex CRUD, types (Base, Hospital, Incident, Shelter, Junction), Linear/Binary Search | `js/graph.js`, `js/app.js` |
| **M4** | Road / Edge Management | Connection metrics (distance, time, risk 1-10, capacity, status: OPEN, RESTRICTED, BLOCKED) | `js/graph.js`, `js/app.js` |
| **M5** | Graph Builder | Adjacency List $O(V+E)$, Adjacency Matrix $O(V^2)$, and Interactive Canvas Visualizer | `js/graph.js`, `js/canvas_renderer.js` |
| **M6** | Cost Engine | Multi-criteria edge cost formula with configurable weights | `js/graph.js`, `disaster_rescue_cli.py` |
| **M7** | Route Planner | Dijkstra (Min-Heap), Bellman-Ford, Floyd-Warshall, BFS, and Step-by-Step Playback | `js/algorithms.js`, `js/app.js` |
| **M8** | Connectivity Planner | Minimum Spanning Tree infrastructure planning (Prim's vs Kruskal's algorithms) | `js/algorithms.js` |
| **M9** | DAA Algorithm Lab | Interactive laboratory covering Units 1, 2, and 3 syllabus algorithms | `js/algorithm_lab.js` |
| **M10** | Results & Reporting | Real-time metrics HUD, turn-by-turn routing table, complexity tables, PDF/Print report | `index.html`, `css/styles.css` |

---

## 🧮 4. Mathematical Cost Engine (Section 6.4)

Each edge $e$ receives a composite operational score balancing speed, physical distance, hazard exposure, and capacity restrictions:

$$\text{Cost}(e) = \alpha \cdot \text{Time}(e) + \beta \cdot \text{Distance}(e) + \gamma \cdot \text{Risk}(e) + \delta \cdot \text{Penalty}(e)$$

- **$\alpha$**: Travel Time Coefficient ($\ge 0$)
- **$\beta$**: Physical Distance Coefficient ($\ge 0$)
- **$\gamma$**: Risk / Hazard Factor Coefficient ($\ge 0$)
- **$\delta$**: Restriction Penalty Coefficient ($\ge 0$)
- **Blocked Edges**: Completely excluded from graph traversal ($\text{Cost} = \infty$)
- **Dijkstra Invariant**: Because all coefficients and edge attributes are non-negative, $\text{Cost}(e) \ge 0$, which mathematically satisfies the non-negative weight prerequisite of Dijkstra’s Algorithm.

---

## 📊 5. Core Algorithms & Syllabus Mapping

### 1. Shortest Path & Routing
- **Dijkstra’s Algorithm** with Min-Heap Priority Queue:
  - Time Complexity: $\mathcal{O}((V + E) \log V)$
  - Space Complexity: $\mathcal{O}(V + E)$
  - Primary algorithm for single-source non-negative rescue routing.
- **Bellman-Ford Algorithm**:
  - Time Complexity: $\mathcal{O}(V \cdot E)$
  - Space Complexity: $\mathcal{O}(V)$
  - Handles negative edge adjustments and reports reachable negative cycles.
- **Floyd-Warshall Algorithm**:
  - Time Complexity: $\mathcal{O}(V^3)$
  - Space Complexity: $\mathcal{O}(V^2)$
  - Dynamic Programming all-pairs shortest paths using the recurrence:
    $$D[k][i][j] = \min(D[k-1][i][j], D[k-1][i][k] + D[k-1][k][j])$$

### 2. Infrastructure Connectivity (MST)
- **Prim’s Algorithm**:
  - Time Complexity: $\mathcal{O}((V + E) \log V)$
  - Greedy paradigm; grows a single tree frontier using a Min-Heap.
- **Kruskal’s Algorithm**:
  - Time Complexity: $\mathcal{O}(E \log E)$
  - Greedy paradigm; sorts all edges globally and utilizes **Disjoint Set Union (DSU)** with path compression and union-by-rank.

### 3. DAA Algorithm Laboratory (Units 1, 2, 3)
- **Sorting Benchmark**: Bubble Sort $\mathcal{O}(n^2)$, Merge Sort $\mathcal{O}(n \log n)$, Quick Sort $\mathcal{O}(n \log n)$, Heap Sort $\mathcal{O}(n \log n)$.
- **Searching**: Linear Search $\mathcal{O}(n)$ vs Binary Search $\mathcal{O}(\log n)$ on sorted location registries.
- **Greedy Logistics**: Fractional Knapsack for divisible relief supplies (food rations, drinking water).
- **Dynamic Programming**: 0/1 Knapsack for critical indivisible rescue equipment packing.
- **Backtracking**:
  - Rescue Zone Graph Coloring (assigning non-interfering radio frequencies).
  - N-Queens Problem ($\mathcal{O}(N!)$).
  - Hamiltonian Cycle detection.
  - Sum of Subsets team dispatch allocation.
- **Branch and Bound**:
  - Multi-Site Travelling Salesperson Problem (TSP) for emergency inspection tours.
- **Text & Compression**:
  - Huffman Coding prefix tree compression for emergency message broadcasts.
  - Knuth-Morris-Pratt (KMP) string matching for emergency keywords.

---

## 🧪 6. Test Suite (TC01 to TC10 Verification)

| Test ID | Scenario | Expected Result | Verified Status |
| :--- | :--- | :--- | :---: |
| **TC01** | Valid source and destination, all roads open | Shortest feasible path $A \to B \to C \to D$ (Cost 9.0) | **PASS** |
| **TC02** | Source equals destination | Zero-cost / zero-distance validation | **PASS** |
| **TC03** | Destination unreachable (incoming links blocked) | Clear failure message (No feasible route) | **PASS** |
| **TC04** | Shortest physical road blocked (Page 18 Worked Example) | Dynamically re-routes to $A \to B \to D$ (Cost 11.0) | **PASS** |
| **TC05** | High-risk edge vs longer safe edge | Cost weights prioritize safe alternative | **PASS** |
| **TC06** | Negative edge weights | Bellman-Ford correctly processes or flags cycle | **PASS** |
| **TC07** | Disconnected graph for MST | Detects disconnected components | **PASS** |
| **TC08** | Repeated all-pairs queries | Floyd-Warshall precomputed $\mathcal{O}(1)$ query lookup | **PASS** |
| **TC09** | Sorted location lookup | Binary search finds record in $\mathcal{O}(\log n)$ | **PASS** |
| **TC10** | Execution time & memory limits | All executions finish under 50ms | **PASS** |

---

## 🎓 7. Viva / Presentation Q&A Reference (Section 20)

1. **Why is disaster rescue modeled as a graph problem?**
   - Locations (bases, hospitals, incident sites) are vertices $V$, and passable roads are edges $E$ with operational costs.
2. **Why Dijkstra as primary algorithm?**
   - Road costs are non-negative, and single-source shortest path is found in optimal $\mathcal{O}((V+E)\log V)$ time with a min-heap.
3. **Why not shortest distance alone?**
   - In disaster conditions, a short path may have collapsed bridges or extreme risk. Multi-criteria cost factors in time, distance, risk, and blockage.
4. **Prim vs Kruskal?**
   - Prim grows a single tree vertex-by-vertex using a min-heap; Kruskal sorts all edges globally and avoids cycles with Union-Find (DSU).
5. **What does Bellman-Ford add?**
   - Handles negative weights and identifies negative weight cycles.
6. **Why Adjacency List over Matrix for road networks?**
   - Real-world networks are sparse ($E \ll V^2$). Space is $\mathcal{O}(V+E)$ instead of $\mathcal{O}(V^2)$.

---

## 📁 8. Project File Structure
```text
PROJECT1/
├── index.html               # Main HUD & Operations Center UI
├── css/
│   └── styles.css           # Tactical dark theme, glassmorphism, responsive styles
├── js/
│   ├── graph.js             # Graph, Location, Edge, Adjacency List & Matrix, Cost Engine
│   ├── algorithms.js        # Dijkstra, Bellman-Ford, Floyd, Prim, Kruskal, BFS, DFS, Warshall
│   ├── algorithm_lab.js     # Sorting bench, Knapsack, Backtracking, B&B, Huffman, KMP
│   ├── presets.js           # Page 18 worked example, flood grid, test cases TC01-TC10
│   ├── canvas_renderer.js   # Interactive HTML5 Canvas visualizer with animation & playback
│   └── app.js               # Application coordinator, event wiring, HUD metrics
├── disaster_rescue_cli.py   # Full Python CLI engine and automated test runner
├── server.py                # Zero-dependency local web server launcher
└── README.md                # Comprehensive documentation
```
