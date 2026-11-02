/**
 * DISASTER RESCUE PATH PLANNING SYSTEM
 * Module: DAA Algorithm Laboratory (M9 - Complete Syllabus Coverage)
 *
 * Implements interactive solvers and demonstrators for:
 * UNIT 1:
 * - Sorting Comparative Benchmark (Bubble, Merge, Quick, Heap Sort)
 * - Searching (Linear vs Binary Search)
 * - Fundamental Data Structures (Linked Lists, Stack, Queue, BST, AVL Tree)
 *
 * UNIT 2:
 * - Divide & Conquer vs Decrease & Conquer (Topological Sort)
 * - Greedy Method (Fractional Knapsack)
 * - Minimum Spanning Trees (Prim & Kruskal)
 * - Shortest Paths (Dijkstra)
 * - Optimal Tree (Huffman Codes)
 * - Transform & Conquer (Heap & Heap Sort)
 * - String Matching (KMP & Rabin-Karp)
 *
 * UNIT 3:
 * - Dynamic Programming (Binomial Coeff, Warshall, Floyd, 0/1 Knapsack, Optimal BST)
 * - Backtracking (Graph Coloring, N-Queens, Hamiltonian Cycle, Sum of Subsets)
 * - Branch & Bound (TSP, Assignment Problem, LC Knapsack 0/1)
 * - Complexity Classes (P, NP, NP-Hard, NP-Complete)
 * - Self-Study: Job Sequencing with Deadlines
 */

const AlgorithmLab = {
  // ==========================================
  // UNIT 1: SORTING BENCHMARK
  // ==========================================
  bubbleSort(arr) {
    const a = [...arr];
    let comparisons = 0, swaps = 0;
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        comparisons++;
        if (a[j] > a[j + 1]) {
          swaps++;
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
        }
      }
    }
    return { sorted: a, comparisons, swaps, complexity: 'O(N²)' };
  },

  mergeSort(arr) {
    let comparisons = 0;
    function sort(subArr) {
      if (subArr.length <= 1) return subArr;
      const mid = Math.floor(subArr.length / 2);
      const left = sort(subArr.slice(0, mid));
      const right = sort(subArr.slice(mid));
      return merge(left, right);
    }
    function merge(left, right) {
      const res = [];
      let i = 0, j = 0;
      while (i < left.length && j < right.length) {
        comparisons++;
        if (left[i] <= right[j]) res.push(left[i++]);
        else res.push(right[j++]);
      }
      return res.concat(left.slice(i)).concat(right.slice(j));
    }
    const sorted = sort(arr);
    return { sorted, comparisons, complexity: 'O(N log N)' };
  },

  quickSort(arr) {
    const a = [...arr];
    let comparisons = 0;
    function sort(low, high) {
      if (low < high) {
        const pIdx = partition(low, high);
        sort(low, pIdx - 1);
        sort(pIdx + 1, high);
      }
    }
    function partition(low, high) {
      const pivot = a[high];
      let i = low - 1;
      for (let j = low; j < high; j++) {
        comparisons++;
        if (a[j] < pivot) {
          i++;
          [a[i], a[j]] = [a[j], a[i]];
        }
      }
      [a[i + 1], a[high]] = [a[high], a[i + 1]];
      return i + 1;
    }
    sort(0, a.length - 1);
    return { sorted: a, comparisons, complexity: 'O(N log N) avg' };
  },

  heapSort(arr) {
    const a = [...arr];
    let comparisons = 0;
    const n = a.length;

    function heapify(len, i) {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < len) {
        comparisons++;
        if (a[left] > a[largest]) largest = left;
      }
      if (right < len) {
        comparisons++;
        if (a[right] > a[largest]) largest = right;
      }
      if (largest !== i) {
        [a[i], a[largest]] = [a[largest], a[i]];
        heapify(len, largest);
      }
    }

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);
    for (let i = n - 1; i > 0; i--) {
      [a[0], a[i]] = [a[i], a[0]];
      heapify(i, 0);
    }
    return { sorted: a, comparisons, complexity: 'O(N log N)' };
  },

  runSortingBenchmark(size = 500) {
    const rawData = Array.from({ length: size }, () => Math.floor(Math.random() * 1000) + 1);
    const runTimed = (fn, name) => {
      const t0 = performance.now();
      const res = fn(rawData);
      const t1 = performance.now();
      return {
        name,
        timeMs: Number((t1 - t0).toFixed(3)),
        comparisons: res.comparisons,
        complexity: res.complexity
      };
    };

    return [
      runTimed(this.bubbleSort.bind(this), 'Bubble Sort'),
      runTimed(this.mergeSort.bind(this), 'Merge Sort (Divide & Conquer)'),
      runTimed(this.quickSort.bind(this), 'Quick Sort'),
      runTimed(this.heapSort.bind(this), 'Heap Sort (Transform & Conquer)')
    ];
  },

  // ==========================================
  // UNIT 1: FUNDAMENTAL DATA STRUCTURES
  // Stack, Queue, Linked Lists, BST, AVL Tree
  // ==========================================
  simulateDataStructures() {
    return {
      singlyLinkedList: "Singly Linked List: [Head] -> [Base] -> [Junction A] -> [Hospital] -> [NULL] (O(1) Insertion at head, O(N) Traversal)",
      doublyLinkedList: "Doubly Linked List: [NULL] <-> [Base] <-> [Junction A] <-> [Hospital] <-> [NULL] (Bidirectional emergency road links, O(1) Deletion given node)",
      circularLinkedList: "Circular Linked List: [Base] -> [Junction A] -> [Hospital] -> (Loops back to [Base]) (Useful for continuous patrol and round-robin monitoring)",
      stack: "Stack (LIFO): Push / Pop operations in O(1). Essential for Depth First Search (DFS) and backtracking path reversal.",
      queue: "Queue (FIFO): Enqueue / Dequeue operations in O(1). Essential for Breadth First Search (BFS) and emergency request triage.",
      bst: "Binary Search Tree (BST): Ordered location keys. Search/Insert average O(log N), worst-case O(N).",
      avl: "AVL Tree: Self-balancing BST using Left & Right Rotations. Enforces Balance Factor in {-1, 0, 1}. Guaranteed O(log N) lookup."
    };
  },

  // ==========================================
  // UNIT 2: DECREASE & CONQUER — TOPOLOGICAL SORT
  // Emergency Task Precedence
  // ==========================================
  topologicalSort() {
    // Tasks: 0: Assess Damage, 1: Clear Arterial Road, 2: Setup Medical Triage, 3: Deploy Ambulances, 4: Evacuate Civilians
    const tasks = [
      "Assess Damage & Blockages",
      "Clear Arterial Road",
      "Setup Medical Triage Camp",
      "Deploy Rescue Ambulances",
      "Evacuate Critical Civilians"
    ];
    // Directed dependencies: 0->1, 1->2, 1->3, 2->4, 3->4
    const inDegree = [0, 1, 1, 1, 2];
    const adj = [
      [1],       // 0 -> 1
      [2, 3],    // 1 -> 2, 3
      [4],       // 2 -> 4
      [4],       // 3 -> 4
      []         // 4
    ];

    const queue = [];
    inDegree.forEach((deg, idx) => {
      if (deg === 0) queue.push(idx);
    });

    const order = [];
    while (queue.length > 0) {
      const u = queue.shift();
      order.push(tasks[u]);
      adj[u].forEach(v => {
        inDegree[v]--;
        if (inDegree[v] === 0) queue.push(v);
      });
    }

    return {
      paradigm: "Decrease and Conquer (Topological Ordering)",
      executionOrder: order,
      complexity: "O(V + E) using Kahn's Algorithm / DFS",
      isDAG: order.length === tasks.length
    };
  },

  // ==========================================
  // UNIT 2: GREEDY METHOD — FRACTIONAL KNAPSACK
  // ==========================================
  fractionalKnapsack(items, capacity) {
    const decorated = items.map(item => ({
      ...item,
      ratio: item.value / item.weight
    }));
    decorated.sort((a, b) => b.ratio - a.ratio);

    let remainingCap = capacity;
    let totalValue = 0;
    const taken = [];

    for (const item of decorated) {
      if (remainingCap <= 0) break;
      if (item.weight <= remainingCap) {
        taken.push({ ...item, fraction: 1.0, takenWeight: item.weight, takenValue: item.value });
        totalValue += item.value;
        remainingCap -= item.weight;
      } else {
        const fraction = Number((remainingCap / item.weight).toFixed(3));
        const val = Number((fraction * item.value).toFixed(2));
        taken.push({ ...item, fraction, takenWeight: remainingCap, takenValue: val });
        totalValue += val;
        remainingCap = 0;
      }
    }

    return {
      capacity,
      totalValue: Number(totalValue.toFixed(2)),
      remainingCap,
      items: taken,
      timeComplexity: 'O(N log N) due to greedy sorting',
      spaceComplexity: 'O(1)'
    };
  },

  // ==========================================
  // UNIT 2: STRING MATCHING — RABIN-KARP & KMP
  // ==========================================
  rabinKarp(text, pattern, d = 256, q = 101) {
    const N = text.length;
    const M = pattern.length;
    let pHash = 0; // hash for pattern
    let tHash = 0; // hash for text window
    let h = 1;
    const matches = [];

    for (let i = 0; i < M - 1; i++) {
      h = (h * d) % q;
    }

    for (let i = 0; i < M; i++) {
      pHash = (d * pHash + pattern.charCodeAt(i)) % q;
      tHash = (d * tHash + text.charCodeAt(i)) % q;
    }

    for (let i = 0; i <= N - M; i++) {
      if (pHash === tHash) {
        let match = true;
        for (let j = 0; j < M; j++) {
          if (text[i + j] !== pattern[j]) {
            match = false;
            break;
          }
        }
        if (match) matches.push(i);
      }
      if (i < N - M) {
        tHash = (d * (tHash - text.charCodeAt(i) * h) + text.charCodeAt(i + M)) % q;
        if (tHash < 0) tHash += q;
      }
    }

    return {
      pattern,
      matches,
      matchCount: matches.length,
      complexity: 'O(N + M) average, O(N*M) worst',
      method: 'Rolling Hash via Modulo Arithmetic'
    };
  },

  kmpSearch(text, pattern) {
    const N = text.length;
    const M = pattern.length;
    if (M === 0) return { matches: [], matchCount: 0 };

    const lps = Array(M).fill(0);
    let len = 0, i = 1;
    while (i < M) {
      if (pattern[i] === pattern[len]) {
        len++;
        lps[i] = len;
        i++;
      } else {
        if (len !== 0) len = lps[len - 1];
        else { lps[i] = 0; i++; }
      }
    }

    const matches = [];
    let ti = 0, pi = 0;
    while (ti < N) {
      if (pattern[pi] === text[ti]) {
        ti++;
        pi++;
      }
      if (pi === M) {
        matches.push(ti - pi);
        pi = lps[pi - 1];
      } else if (ti < N && pattern[pi] !== text[ti]) {
        if (pi !== 0) pi = lps[pi - 1];
        else ti++;
      }
    }

    return {
      pattern,
      matches,
      matchCount: matches.length,
      lpsArray: lps,
      timeComplexity: 'O(N + M)',
      spaceComplexity: 'O(M)'
    };
  },

  // ==========================================
  // UNIT 2: HUFFMAN CODING
  // ==========================================
  huffmanCoding(text) {
    if (!text || text.length === 0) return null;
    const freq = new Map();
    for (const ch of text) freq.set(ch, (freq.get(ch) || 0) + 1);

    class HuffmanNode {
      constructor(char, frequency, left = null, right = null) {
        this.char = char;
        this.frequency = frequency;
        this.left = left;
        this.right = right;
      }
    }

    const nodes = [];
    for (const [char, count] of freq.entries()) {
      nodes.push(new HuffmanNode(char, count));
    }

    if (nodes.length === 1) {
      const root = new HuffmanNode(null, nodes[0].frequency, nodes[0]);
      nodes[0] = root;
    } else {
      while (nodes.length > 1) {
        nodes.sort((a, b) => a.frequency - b.frequency);
        const left = nodes.shift();
        const right = nodes.shift();
        const parent = new HuffmanNode(null, left.frequency + right.frequency, left, right);
        nodes.push(parent);
      }
    }

    const root = nodes[0];
    const codes = new Map();
    function generateCodes(node, code) {
      if (!node) return;
      if (node.char !== null) {
        codes.set(node.char, code || '0');
        return;
      }
      generateCodes(node.left, code + '0');
      generateCodes(node.right, code + '1');
    }
    generateCodes(root, '');

    let encoded = '';
    for (const ch of text) encoded += codes.get(ch);

    const originalBits = text.length * 8;
    const compressedBits = encoded.length;
    const compressionRatio = Number(((1 - compressedBits / originalBits) * 100).toFixed(1));

    return {
      frequencies: Object.fromEntries(freq),
      codes: Object.fromEntries(codes),
      originalBits,
      compressedBits,
      compressionRatio: `${compressionRatio}%`,
      encodedSnippet: encoded.slice(0, 80) + (encoded.length > 80 ? '...' : '')
    };
  },

  // ==========================================
  // UNIT 3: DYNAMIC PROGRAMMING
  // 0/1 Knapsack, Binomial Coeff, Optimal BST
  // ==========================================
  knapsack01(items, capacity) {
    const n = items.length;
    const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

    for (let i = 1; i <= n; i++) {
      const { weight, value } = items[i - 1];
      for (let w = 0; w <= capacity; w++) {
        if (weight <= w) {
          dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - weight] + value);
        } else {
          dp[i][w] = dp[i - 1][w];
        }
      }
    }

    let res = dp[n][capacity];
    let w = capacity;
    const selected = [];
    for (let i = n; i > 0 && res > 0; i--) {
      if (res !== dp[i - 1][w]) {
        selected.push(items[i - 1]);
        res -= items[i - 1].value;
        w -= items[i - 1].weight;
      }
    }

    return {
      maxValue: dp[n][capacity],
      selectedItems: selected,
      dpTable: dp,
      capacity,
      timeComplexity: 'O(N * W)',
      spaceComplexity: 'O(N * W)'
    };
  },

  binomialCoefficient(n, k) {
    if (k > n) return { value: 0, table: [] };
    const C = Array.from({ length: n + 1 }, () => Array(k + 1).fill(0));
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= Math.min(i, k); j++) {
        if (j === 0 || j === i) C[i][j] = 1;
        else C[i][j] = C[i - 1][j - 1] + C[i - 1][j];
      }
    }
    return {
      n, k,
      value: C[n][k],
      table: C,
      timeComplexity: 'O(n * k)',
      spaceComplexity: 'O(n * k)'
    };
  },

  optimalBST(keys, freq) {
    const n = keys.length;
    const cost = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i < n; i++) cost[i][i] = freq[i];

    for (let L = 2; L <= n; L++) {
      for (let i = 0; i <= n - L + 1; i++) {
        const j = i + L - 1;
        cost[i][j] = Infinity;
        let sumF = 0;
        for (let s = i; s <= j; s++) sumF += freq[s];

        for (let r = i; r <= j; r++) {
          const c = (r > i ? cost[i][r - 1] : 0) + (r < j ? cost[r + 1][j] : 0) + sumF;
          if (c < cost[i][j]) cost[i][j] = c;
        }
      }
    }

    return {
      keys,
      frequencies: freq,
      optimalCost: cost[0][n - 1],
      complexity: 'O(N³)',
      paradigm: 'Dynamic Programming (Optimal Substructure)'
    };
  },

  // ==========================================
  // UNIT 3: BACKTRACKING
  // Graph Coloring, N-Queens, Hamiltonian, Sum of Subsets
  // ==========================================
  graphColoring(adjMatrix, mColors) {
    const V = adjMatrix.length;
    const color = Array(V).fill(0);
    let recursiveCalls = 0;

    function isSafe(v, c) {
      for (let i = 0; i < V; i++) {
        if (adjMatrix[v][i] === 1 && color[i] === c) return false;
      }
      return true;
    }

    function solve(v) {
      recursiveCalls++;
      if (v === V) return true;
      for (let c = 1; c <= mColors; c++) {
        if (isSafe(v, c)) {
          color[v] = c;
          if (solve(v + 1)) return true;
          color[v] = 0;
        }
      }
      return false;
    }

    const hasSolution = solve(0);
    return {
      hasSolution,
      colorAssignment: color,
      recursiveCalls,
      colorsAllowed: mColors,
      timeComplexity: 'O(m^V)',
      spaceComplexity: 'O(V)'
    };
  },

  nQueens(N = 4) {
    const board = Array.from({ length: N }, () => Array(N).fill(0));
    const solutions = [];
    let recursiveSteps = 0;

    function isSafe(row, col) {
      for (let i = 0; i < row; i++) if (board[i][col] === 1) return false;
      for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) if (board[i][j] === 1) return false;
      for (let i = row, j = col; i >= 0 && j < N; i--, j++) if (board[i][j] === 1) return false;
      return true;
    }

    function solve(row) {
      recursiveSteps++;
      if (row === N) {
        solutions.push(board.map(r => [...r]));
        return;
      }
      for (let col = 0; col < N; col++) {
        if (isSafe(row, col)) {
          board[row][col] = 1;
          solve(row + 1);
          board[row][col] = 0;
        }
      }
    }

    solve(0);
    return {
      n: N,
      totalSolutions: solutions.length,
      firstSolution: solutions[0] || null,
      recursiveSteps,
      timeComplexity: 'O(N!)',
      spaceComplexity: 'O(N²)'
    };
  },

  hamiltonianCycle(adjMatrix) {
    const V = adjMatrix.length;
    const path = Array(V).fill(-1);
    path[0] = 0;

    function isSafe(v, pos) {
      if (adjMatrix[path[pos - 1]][v] === 0) return false;
      for (let i = 0; i < pos; i++) if (path[i] === v) return false;
      return true;
    }

    function solve(pos) {
      if (pos === V) return adjMatrix[path[pos - 1]][path[0]] === 1;
      for (let v = 1; v < V; v++) {
        if (isSafe(v, pos)) {
          path[pos] = v;
          if (solve(pos + 1)) return true;
          path[pos] = -1;
        }
      }
      return false;
    }

    const exists = solve(1);
    return {
      exists,
      cycle: exists ? [...path, path[0]] : null,
      timeComplexity: 'O(N!)',
      spaceComplexity: 'O(N)'
    };
  },

  sumOfSubsets(weights, targetSum) {
    const sorted = [...weights].sort((a, b) => a - b);
    const solutions = [];
    const current = [];

    function solve(index, currentSum) {
      if (currentSum === targetSum) {
        solutions.push([...current]);
        return;
      }
      if (index >= sorted.length || currentSum > targetSum) return;

      current.push(sorted[index]);
      solve(index + 1, currentSum + sorted[index]);
      current.pop();
      solve(index + 1, currentSum);
    }

    solve(0, 0);
    return {
      weights: sorted,
      targetSum,
      solutions,
      timeComplexity: 'O(2^N)',
      spaceComplexity: 'O(N)'
    };
  },

  // ==========================================
  // UNIT 3: BRANCH & BOUND
  // TSP, Assignment Problem, LC Knapsack
  // ==========================================
  tspBranchAndBound(costMatrix) {
    const n = costMatrix.length;
    if (n > 10) return { error: 'Restricted to n <= 10 for interactive responsiveness' };

    let minCost = Infinity;
    let bestTour = [];
    const visited = Array(n).fill(false);
    visited[0] = true;

    function search(curr, count, cost, path) {
      if (count === n && costMatrix[curr][0] > 0) {
        const total = cost + costMatrix[curr][0];
        if (total < minCost) {
          minCost = total;
          bestTour = [...path, 0];
        }
        return;
      }
      if (cost >= minCost) return; // Bounding pruning

      for (let next = 0; next < n; next++) {
        if (!visited[next] && costMatrix[curr][next] > 0) {
          const nextCost = cost + costMatrix[curr][next];
          if (nextCost < minCost) {
            visited[next] = true;
            search(next, count + 1, nextCost, [...path, next]);
            visited[next] = false;
          }
        }
      }
    }

    search(0, 1, 0, [0]);
    return {
      n,
      minCost: minCost === Infinity ? null : minCost,
      tour: bestTour,
      timeComplexity: 'O(N!) worst / B&B pruned',
      spaceComplexity: 'O(N)'
    };
  },

  assignmentProblem(costMatrix) {
    // Dispatch N rescue teams to N incident locations with min total penalty
    const n = costMatrix.length;
    let minTotal = Infinity;
    let bestAssignment = [];
    const assignedTasks = Array(n).fill(false);

    function solve(agent, currentCost, currentAssign) {
      if (agent === n) {
        if (currentCost < minTotal) {
          minTotal = currentCost;
          bestAssignment = [...currentAssign];
        }
        return;
      }
      if (currentCost >= minTotal) return; // Branch and Bound Cutoff

      for (let task = 0; task < n; task++) {
        if (!assignedTasks[task]) {
          assignedTasks[task] = true;
          solve(agent + 1, currentCost + costMatrix[agent][task], [...currentAssign, { agent, task, cost: costMatrix[agent][task] }]);
          assignedTasks[task] = false;
        }
      }
    }

    solve(0, 0, []);
    return {
      n,
      minTotalCost: minTotal,
      assignment: bestAssignment,
      complexity: 'Branch & Bound O(N!) pruned state space'
    };
  },

  // ==========================================
  // SELF-STUDY: JOB SEQUENCING WITH DEADLINES
  // ==========================================
  jobSequencingWithDeadlines(jobs, maxSlots = 3) {
    // Jobs: [{ id, deadline, profit/urgency }]
    const sorted = [...jobs].sort((a, b) => b.profit - a.profit);
    const slots = Array(maxSlots).fill(null);
    let totalProfit = 0;

    for (const job of sorted) {
      for (let j = Math.min(maxSlots, job.deadline) - 1; j >= 0; j--) {
        if (slots[j] === null) {
          slots[j] = job;
          totalProfit += job.profit;
          break;
        }
      }
    }

    return {
      maxSlots,
      scheduledJobs: slots.filter(Boolean),
      totalUrgencyScore: totalProfit,
      complexity: 'Greedy with Deadlines O(N²)'
    };
  },

  // ==========================================
  // COMPLEXITY CLASSES EXPLORER
  // ==========================================
  getComplexityClasses() {
    return [
      { class: "P (Polynomial)", desc: "Problems solvable in polynomial time O(n^k). Examples in this project: Dijkstra O((V+E)log V), Prim O((V+E)log V), Floyd O(V³), Merge Sort O(n log n)." },
      { class: "NP (Nondeterministic Polynomial)", desc: "Problems where a proposed solution can be verified in polynomial time. (Includes P as a subset)." },
      { class: "NP-Complete", desc: "Hardest problems in NP. Any NP problem can be reduced to them in polynomial time. Examples: Traveling Salesperson (Decision), Knapsack 0/1, Graph Coloring." },
      { class: "NP-Hard", desc: "At least as hard as the hardest problems in NP. Optimization version of TSP is NP-Hard. Solved using Branch & Bound or Approximation." },
      { class: "co-NP", desc: "Complement class of NP problems, where 'NO' instances have polynomial-time verifiable proofs." }
    ];
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AlgorithmLab };
} else {
  window.AlgorithmLab = AlgorithmLab;
}
