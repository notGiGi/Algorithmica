---
title: "Step-by-Step Directions Between Two Tree Nodes"
category: "Trees"
tags: [binary-tree, lca, lowest-common-ancestor, dfs, path, binary-lifting]
difficulty: "intermediate"
time_complexity: "O(n)"
space_complexity: "O(h)"
time_note: "Two DFS passes, each O(n); no global early exit."
space_note: "Recursion stack + path lists, all bounded by the height h."
complexity_class: "good"
date_added: 2026-07-16
related: ["all-possible-full-binary-trees"]
leetcode_problems:
  - name: "Step-By-Step Directions From a Binary Tree Node to Another"
    number: 2096
    difficulty: "medium"
  - name: "Lowest Common Ancestor of a Binary Tree"
    number: 236
    difficulty: "medium"
svg_type: "tree"
---

## Intuition

Given a binary tree with **distinct** values and two node values `start` and `dest`, we want the shortest string of moves — `'L'` (left child), `'R'` (right child), `'U'` (parent) — that walks from `start` to `dest`. Because a tree has no cycles, the path between any two nodes is *unique*, and it always bends at their **Lowest Common Ancestor** (LCA): go up from `start` to the LCA, then down from the LCA to `dest`.

Formally, if $P(v)$ is the sequence of nodes from the root to $v$ inclusive, then

$$
\text{LCA}(s, t) = \text{the last common node in the shared prefix of } P(s) \text{ and } P(t).
$$

That equation is also the implementation trick. The path from `start` to the LCA is pure "up" motion, so its contribution is just a run of `'U'`s — one per node strictly between `start` and the LCA. The path from the LCA to `dest` is a suffix of the root-to-`dest` move sequence. So we never need to *name* the LCA node: we only need the **index at which the two root paths diverge**. Everything above that index is shared (turns into nothing); everything below it on the `start` side becomes `'U'`s, and everything below it on the `dest` side is copied verbatim.

## Formal Definition

Let $s$ and $t$ be the start and destination nodes, and let

$$
P(s) = \langle r = u_0, u_1, \dots, u_a = s\rangle, \qquad
P(t) = \langle r = w_0, w_1, \dots, w_b = t\rangle
$$

be their root paths, sharing a common prefix of length $k+1$ (so $u_k = w_k = \text{LCA}(s,t)$ and $u_{k+1} \ne w_{k+1}$). The answer is

$$
\underbrace{\texttt{U} \cdots \texttt{U}}_{a - k} \;\Vert\; \underbrace{d_{k}\, d_{k+1} \cdots d_{b-1}}_{\text{L/R moves from LCA to } t},
$$

where $d_i \in \{\texttt{L}, \texttt{R}\}$ is the move taking $w_i$ to $w_{i+1}$. The $a-k$ up-moves lift `start` to the LCA; the suffix of `dest`'s move string descends to `dest`.

## When to Use It

- **Pattern 1 — unique path between two nodes of a tree:** any "distance", "route", or "directions" query on a tree reduces to the LCA plus the two half-paths. No cycles means no search — just two root paths.
- **Pattern 2 — turn a node answer into a move/edge answer:** when the classic LCA (LeetCode #236) gives you *the meeting node*, but the problem wants *the edges traversed*, carry the L/R decisions alongside the path instead of only the node.
- **Pattern 3 — one query, so no preprocessing:** for a single pair, two linear DFS passes are optimal. Reach for [binary lifting](#see-also) only when many pairs query the same tree.
- **Pattern 4 — distinct values as node identity:** the algorithm matches nodes by value, which is only sound when values are unique — exactly the problem's precondition.

## Complexity Analysis

**Time: `O(n)`** — each `dfs` is, worst case, a full traversal ($O(n)$, since the target may be the last leaf visited), and we run two of them; reversing the paths, scanning for the common prefix, and building the string are each $O(\text{path length}) = O(n)$. The bound is robustly $\Theta(n)$: there is no *global* early exit, so both passes always sweep the tree regardless of where the nodes sit.

**Space: `O(h)`** — the recursion stack is $O(h)$ for tree height $h$, and the path lists `ps`, `pd`, `dr` and the answer string are each bounded by a node's depth, hence $O(h)$. Unlike the time bound, space genuinely depends on shape: $O(\log n)$ for a balanced tree, $O(n)$ for a degenerate (linked-list-shaped) one.

## Pseudocode

```pseudo
GET-DIRECTIONS(root, start, dest):
    // DFS returns the root→target path bottom-up; when collectMoves is
    // true it also appends each L/R step (in reverse) to a shared list.
    ps ← DFS(root, start, collectMoves = false)
    pd, moves ← DFS(root, dest,  collectMoves = true)
    reverse(ps); reverse(pd); reverse(moves)   // now top-down

    k ← length of the longest common prefix of ps and pd   // LCA index
    return "U" × (len(ps) − 1 − k)  ++  moves[k ..]         // up to LCA, then down
```

## Implementation

### Python

```python
from typing import Optional


class Solution:
    def getDirections(
        self, root: Optional["TreeNode"], startValue: int, destValue: int
    ) -> str:
        dr: list[str] = []

        def dfs(node, target, collect):
            # Returns the root->target path as a list of values, built
            # bottom-up. Only the successful return branch touches `dr`,
            # so failed branches never leave garbage behind.
            if not node:
                return None
            if node.val == target:
                return [node.val]

            left = dfs(node.left, target, collect)
            if left:
                left.append(node.val)
                if collect:
                    dr.append("L")          # step from node -> left child
                return left

            right = dfs(node.right, target, collect)
            if right:
                right.append(node.val)
                if collect:
                    dr.append("R")
                return right
            return None

        ps = dfs(root, startValue, False)   # root->start path (no moves collected)
        pd = dfs(root, destValue, True)     # root->dest path; fills dr in reverse
        ps.reverse()                        # [root, ..., start]
        pd.reverse()                        # [root, ..., dest]
        dr.reverse()                        # dr[i] = move from pd[i] to pd[i+1]

        idx = -1                            # last index where the paths agree = LCA
        for i in range(min(len(ps), len(pd))):
            if ps[i] == pd[i]:
                idx = i
            else:
                break

        return "U" * (len(ps[idx:]) - 1) + "".join(dr[idx:])
```

### Java

```java
import java.util.ArrayList;
import java.util.List;

class Solution {
    public String getDirections(TreeNode root, int startValue, int destValue) {
        StringBuilder sp = new StringBuilder(); // root -> start, as L/R moves
        StringBuilder dp = new StringBuilder(); // root -> dest,  as L/R moves
        findPath(root, startValue, sp);
        findPath(root, destValue, dp);

        // Drop the shared prefix (the descent to the LCA).
        int i = 0, max = Math.min(sp.length(), dp.length());
        while (i < max && sp.charAt(i) == dp.charAt(i)) i++;

        StringBuilder ans = new StringBuilder();
        for (int j = i; j < sp.length(); j++) ans.append('U'); // climb to LCA
        ans.append(dp.substring(i));                           // descend to dest
        return ans.toString();
    }

    // Records the L/R moves from root to target; returns whether found.
    private boolean findPath(TreeNode node, int target, StringBuilder path) {
        if (node == null) return false;
        if (node.val == target) return true;

        path.append('L');
        if (findPath(node.left, target, path)) return true;
        path.setLength(path.length() - 1);   // backtrack

        path.append('R');
        if (findPath(node.right, target, path)) return true;
        path.setLength(path.length() - 1);
        return false;
    }
}
```

> The Java version builds each root path as an L/R string directly and diffs the two — a slightly cleaner framing of the same idea, since the shared prefix drops out with a plain string comparison and no explicit LCA node.

## Worked Example

**Problem:** the canonical LeetCode case.

**Input:** `root = [5,1,2,3,null,6,4]`, `startValue = 3`, `destValue = 6`
**Expected output:** `"UURL"`

```
          5
        /   \
       1     2
      /     / \
     3     6   4
```

**Step-by-step trace:**

| Step | What we compute | Result |
|------|-----------------|--------|
| 1 | root path to `start=3` | `[5, 1, 3]` |
| 2 | root path to `dest=6` (with moves) | `[5, 2, 6]`, moves `R, L` |
| 3 | longest common prefix | just `5` → LCA index `idx = 0` |
| 4 | up-moves: `len(ps[0:]) − 1 = 3 − 1 = 2` | `"UU"` |
| 5 | down-moves: `dr[0:] = ['R','L']` | `"RL"` |
| 6 | concatenate | `"UURL"` |

Climb from `3` up past `1` to the root (`UU`), then descend right to `2` and left to `6` (`RL`).

## Common Mistakes

- **Fearing that failed DFS branches pollute `dr`.** They don't: `dr.append(...)` fires only on the successful return path (when the recursive call returned a truthy list). A branch missing the target returns `None` at every level, and `None` never triggers an append — so each ancestor on the true path appends exactly once, in unwind order (hence the later `dr.reverse()`).
- **Resetting `dr` between the two calls.** Unnecessary — the first call runs with `collect=False`, so it never writes to `dr`. It works, but overloading one function with a boolean flag couples two responsibilities; returning *both* the path and the moves and letting the caller pick is cleaner.
- **Assuming `start == dest` needs a special case.** It doesn't: both paths are identical, `idx` lands on the last shared index, the up-count is `1 − 1 = 0`, and `dr[idx:]` is empty — the empty string emerges from the index arithmetic, not from a guard. Correct, but verify it rather than trust it at a glance.
- **Forgetting the distinct-values precondition.** Nodes are matched by `node.val`, not object identity. With duplicate values, DFS returns the first match in preorder — possibly not the intended node. The code neither validates nor warns about this.

## See Also

- **Binary lifting for repeated queries.** For *one* pair, two DFS passes are optimal. If many pairs query the *same* tree, precompute depths and an ancestor table `anc[k][v]` (the $2^k$-th ancestor) in $O(n \log n)$; then each LCA is $O(\log n)$ and the node distance is `depth[s] + depth[t] − 2·depth[LCA(s,t)]`. This mirrors the Euler-tour + sparse-table pattern used for Range Minimum Query.
- **Lowest Common Ancestor (LeetCode #236)** is the sub-problem underneath: solve LCA first, then translate the meeting point into a move string. The classic recursive #236 solution — where `dfs` returns the LCA as soon as both children report a hit — is the same skeleton, extended here to return the *whole path* rather than just the meeting node.
