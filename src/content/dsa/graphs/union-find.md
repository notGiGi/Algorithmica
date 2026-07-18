---
title: "Union-Find (DSU)"
category: "Graphs"
tags: [union-find, dsu, disjoint-set, amortized, path-compression, union-by-rank]
difficulty: "intermediate"
time_complexity: "O(α(n))"
space_complexity: "O(n)"
time_note: "Amortized, with path compression + union by rank."
space_note: "Two flat arrays: parent and rank."
complexity_class: "good"
date_added: 2026-07-16
related: ["arrays/two-pointers", "dynamic-programming/01-knapsack"]
leetcode_problems:
  - name: "Number of Provinces"
    number: 547
    difficulty: "medium"
  - name: "Redundant Connection"
    number: 684
    difficulty: "medium"
  - name: "Accounts Merge"
    number: 721
    difficulty: "medium"
svg_type: "graph"
---

## Intuition

*Union-Find* — or *Disjoint Set Union* (DSU) — maintains a dynamic partition of $n$ elements into equivalence classes, supporting two operations: **`union(x, y)`** merges the classes of $x$ and $y$, and **`find(x)`** returns a canonical representative of $x$'s class. Two elements belong to the same class if and only if their `find` results coincide. It is the right structure whenever a relation is reflexive, symmetric, and transitive, and grows incrementally.

The representation is a **forest**: each element points to a parent, and the root of each tree is the representative of its class. `find` climbs the parent pointers up to the root; `union` hangs one root under the other. Done naively this degenerates into linear chains and `find` costs $O(n)$. The two heuristics that rescue it are surprisingly simple, and their interaction produces one of the most elegant bounds in amortized analysis.

**Union by rank** always hangs the shorter tree under the taller one, bounding the height by $O(\log n)$. **Path compression** flattens the path on every `find`: after locating the root, it reconnects every visited node directly to it. Each heuristic alone gives $O(\log n)$; **together**, the amortized cost per operation drops to $O(\alpha(n))$, where $\alpha$ is the inverse Ackermann function — less than $5$ for any $n$ that fits in the physical universe.

## Formal Definition

Over a universe $U = \{0, 1, \dots, n-1\}$, DSU maintains a partition $\mathcal{P}$ that evolves under unions. Formally it represents the **equivalence closure** of the set of executed unions: after any sequence of `union` calls, `find(x) = find(y)` if and only if $x \equiv y$ in the smallest equivalence relation containing all united pairs.

$$
\text{find}(x) = \begin{cases} x & \text{if } \text{parent}[x] = x \\ \text{find}(\text{parent}[x]) & \text{otherwise} \end{cases}
$$

The structural invariant that sustains correctness: **each tree of the forest contains exactly the elements of one class**, and its root is the representative. `union` preserves the invariant because merging two trees corresponds exactly to merging two classes.

## When to Use It

- **Pattern 1 — incremental connected components:** edges arrive one at a time and you only ask connectivity (are $u$ and $v$ connected?). If you also had to *delete* edges, DSU does not apply directly: it only merges, never splits.
- **Pattern 2 — cycle detection in undirected graphs:** when processing edge $(u, v)$, if `find(u) == find(v)` the endpoints were already connected and the edge closes a cycle. This is the core of Kruskal.
- **Pattern 3 — grouping by transitive equivalence:** accounts identical by shared email, pixels of the same region, variables linked by equalities ($a = b$, $b = c \Rightarrow a = c$).
- **Pattern 4 — Kruskal for minimum spanning trees:** sort edges by weight and union as long as no cycle forms.

## Complexity Analysis

**Time: `O(α(n))`** **amortized per operation** — with union by rank *and* path compression, a sequence of $m$ operations over $n$ elements costs $O(m\,\alpha(n))$ (Tarjan). The proof uses a potential argument that spreads the flattening work across future operations; since $\alpha(n) \le 4$ for all $n \le 2^{2^{2^{2^{2}}}}$, it is **constant** in practice. With only one of the two heuristics the bound is $O(\log n)$.

**Space: `O(n)`** — two arrays of size $n$ (`parent` and `rank`). No per-operation auxiliary memory beyond `find`'s recursion stack, which the iterative version eliminates.

## Pseudocode

```pseudo
MAKE-SET(n):
    for i in 0..n−1:
        parent[i] ← i
        rank[i]   ← 0

FIND(x):                          // path compression (two passes)
    root ← x
    while parent[root] ≠ root:
        root ← parent[root]
    while parent[x] ≠ root:       // flatten the path
        next ← parent[x]
        parent[x] ← root
        x ← next
    return root

UNION(x, y):                      // union by rank
    rx ← FIND(x);  ry ← FIND(y)
    if rx = ry: return false      // already connected: nothing to merge
    if rank[rx] < rank[ry]: swap(rx, ry)
    parent[ry] ← rx               // hang the shorter under the taller
    if rank[rx] = rank[ry]:
        rank[rx] ← rank[rx] + 1
    return true
```

## Implementation

### Python

```python
class DSU:
    """Disjoint Set Union with path compression + union by rank.
    Amortized O(α(n)) per operation."""

    def __init__(self, n: int) -> None:
        self.parent = list(range(n))
        self.rank = [0] * n
        self.components = n          # number of current classes

    def find(self, x: int) -> int:
        # Iterative path compression (avoids the recursion limit).
        root = x
        while self.parent[root] != root:
            root = self.parent[root]
        while self.parent[x] != root:
            self.parent[x], x = root, self.parent[x]
        return root

    def union(self, x: int, y: int) -> bool:
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return False             # already in the same class
        if self.rank[rx] < self.rank[ry]:
            rx, ry = ry, rx
        self.parent[ry] = rx
        if self.rank[rx] == self.rank[ry]:
            self.rank[rx] += 1
        self.components -= 1
        return True

    def connected(self, x: int, y: int) -> bool:
        return self.find(x) == self.find(y)
```

### Java

```java
public class DSU {
    private final int[] parent, rank;
    private int components;

    public DSU(int n) {
        parent = new int[n];
        rank = new int[n];
        components = n;
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    public int find(int x) {              // iterative path compression
        int root = x;
        while (parent[root] != root) root = parent[root];
        while (parent[x] != root) {
            int next = parent[x];
            parent[x] = root;
            x = next;
        }
        return root;
    }

    public boolean union(int x, int y) {  // union by rank
        int rx = find(x), ry = find(y);
        if (rx == ry) return false;
        if (rank[rx] < rank[ry]) { int t = rx; rx = ry; ry = t; }
        parent[ry] = rx;
        if (rank[rx] == rank[ry]) rank[rx]++;
        components--;
        return true;
    }

    public boolean connected(int x, int y) { return find(x) == find(y); }
    public int count() { return components; }
}
```

## Worked Example

**Problem:** *Redundant Connection* (LC #684). A graph was a tree of $n$ nodes until one extra edge was added, forming exactly one cycle. Return the redundant edge (the last one in input order that closes a cycle).

**Solution:**

```python
def find_redundant(edges: list[list[int]]) -> list[int]:
    dsu = DSU(len(edges) + 1)         # nodes are labeled from 1
    for u, v in edges:
        # If u and v were already connected, this edge closes the cycle.
        if not dsu.union(u, v):
            return [u, v]
    return []
```

**Execution trace** with `edges = [[1,2], [1,3], [2,3]]`:

```
edge     find(u) find(v)  merged?   parent after the operation
(1,2)      1       2       yes      {1:1, 2:1, 3:3}
(1,3)      1       3       yes      {1:1, 2:1, 3:1}
(2,3)      1       1       NO  ←────  both in class of 1 ⇒ redundant
```

Result: **[2, 3]**. The third edge is the first to find both endpoints already connected.

## Common Mistakes

- **Skipping compression or rank "because the test case passes".** Without either heuristic the tree degenerates into a chain and `find` becomes $O(n)$; on adversarial inputs the total scales to $O(n^2)$ and the TLE only shows up on large data.
- **`union` without checking for equal roots.** Hanging a root under itself corrupts the structure or inflates rank for no reason. Always `if rx == ry: return`.
- **Recursive `find` with large $n$.** The recursive version overflows the stack on long chains (relevant in Python, whose default limit is low). The two-pass iterative version is the safe form.
- **Mixing union by size and union by rank halfway.** Both heuristics work, but be consistent: if you hang by size, update sizes; if by rank, update ranks. Combining them incorrectly breaks the bound.

## See Also

- [Two Pointers](../arrays/two-pointers) — another case where an invariant and amortized analysis explain the efficiency.
