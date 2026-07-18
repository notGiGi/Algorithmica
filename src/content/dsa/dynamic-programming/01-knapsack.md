---
title: "0-1 Knapsack"
category: "Dynamic Programming"
tags: [dynamic-programming, knapsack, pseudo-polynomial, optimization, rolling-array]
difficulty: "intermediate"
time_complexity: "O(nW)"
space_complexity: "O(W)"
time_note: "n·W states, O(1) each — pseudo-polynomial."
space_note: "Rolling 1-D array indexed by capacity."
complexity_class: "ok"
date_added: 2026-07-16
related: ["graphs/union-find"]
leetcode_problems:
  - name: "Partition Equal Subset Sum"
    number: 416
    difficulty: "medium"
  - name: "Target Sum"
    number: 494
    difficulty: "medium"
  - name: "Last Stone Weight II"
    number: 1049
    difficulty: "medium"
svg_type: "tree"
---

## Intuition

The *0-1 knapsack* problem is the archetype of dynamic programming over subsets with a capacity constraint. You have $n$ items, each with weight $w_i$ and value $v_i$, and a knapsack that holds total weight $W$. Every item is taken **whole or not at all** (hence "0-1"): no fractions. The goal is the maximum-value subset whose weight does not exceed $W$.

The reason greed **fails** — and the reason we need DP — is that the locally best item (highest value per unit of weight) can block a globally better combination. The decision about one item is not separable from the rest: it consumes capacity the others will no longer have. DP resolves this by recognizing that the problem has **optimal substructure** and **overlapping subproblems**: the best solution using the first $i$ items with capacity $c$ is built from the best solutions with fewer items.

The canonical formulation defines $dp[i][c]$ = maximum value achievable considering the first $i$ items with capacity $c$. For each item there are exactly two choices — include it or not — and we take the better one. That binariness is the entire recurrence.

## Formal Definition

Let $dp[i][c]$ be the maximum value using a subset of $\{1, \dots, i\}$ with total weight $\le c$. The recurrence distinguishes whether item $i$ fits:

$$
dp[i][c] = \begin{cases}
dp[i-1][c] & \text{if } w_i > c \\[4pt]
\max\big(\underbrace{dp[i-1][c]}_{\text{skip } i},\ \underbrace{dp[i-1][c-w_i] + v_i}_{\text{take } i}\big) & \text{if } w_i \le c
\end{cases}
$$

with base case $dp[0][c] = 0$ for all $c$ (no items, zero value). The answer is $dp[n][W]$.

**Optimal substructure** follows from a cut-and-paste argument: if the optimal solution for $(i, c)$ includes item $i$, then removing it yields a solution for $(i-1, c-w_i)$ that must itself be optimal — otherwise we could swap in a better one and improve the original optimum, a contradiction.

## When to Use It

- **Pattern 1 — subset selection under a budget:** maximize/minimize a value subject to a sum (weight, cost, time) staying within an integer limit.
- **Pattern 2 — "is there a subset summing exactly to $T$?"** (subset-sum). This is 0-1 knapsack with $v_i = w_i$ and a boolean table; *Partition Equal Subset Sum* is exactly this with $T = \text{total}/2$.
- **Pattern 3 — partitions and sign assignments:** *Target Sum* rewrites as subset-sum by solving $P - N = T$, $P + N = \text{sum}$.
- **Recognizable signal:** the statement has a moderate integer limit ($W$) and binary per-element decisions. If weights were fractional and arbitrarily fine, or fractions were allowed, it would be *fractional knapsack* (greedy, not DP).

## Complexity Analysis

**Time: `O(nW)`** — the table has $n \cdot W$ states and each resolves in $O(1)$ by taking a max of two already-computed values. This is **pseudo-polynomial**: polynomial in the *value* of $W$, but exponential in the *input size* of $W$ (its bit length). That is why 0-1 knapsack remains NP-hard despite this table: with $W \sim 2^{64}$, the table is intractable.

**Space: `O(W)`** — the 2-D version uses $O(nW)$, but since row $dp[i]$ depends only on $dp[i-1]$, a single 1-D array of size $W+1$ suffices, **traversed right to left**. That order guarantees $dp[c-w_i]$ still reflects row $i-1$ (not the current one), preserving the "0-1" restriction of using each item at most once.

## Pseudocode

```pseudo
KNAPSACK-01(w, v, W):                 // w, v of length n
    dp[0..W] ← 0                       // 1-D array, capacity as index
    for i in 1..n:
        for c in W down to w[i]:       // right to left!
            dp[c] ← max(dp[c], dp[c − w[i]] + v[i])
    return dp[W]
```

The **descending** traversal of `c` is the central subtlety: if it were ascending, `dp[c − w[i]]` would already have been updated within this same iteration of $i$, allowing item $i$ to be used multiple times — that solves *unbounded knapsack*, not 0-1.

## Implementation

### Python

```python
def knapsack_01(weights: list[int], values: list[int], W: int) -> int:
    """Maximum value with capacity W taking each item 0 or 1 times.
    Time O(nW), space O(W) with a rolling array."""
    dp = [0] * (W + 1)
    for wi, vi in zip(weights, values):
        # Descending c preserves the 0-1 semantics:
        # dp[c - wi] still means "without the current item".
        for c in range(W, wi - 1, -1):
            dp[c] = max(dp[c], dp[c - wi] + vi)
    return dp[W]


def knapsack_01_2d(weights: list[int], values: list[int], W: int) -> int:
    """Explicit 2-D version: clearer to reason about and to reconstruct."""
    n = len(weights)
    dp = [[0] * (W + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        wi, vi = weights[i - 1], values[i - 1]
        for c in range(W + 1):
            dp[i][c] = dp[i - 1][c]                       # skip
            if wi <= c:
                dp[i][c] = max(dp[i][c], dp[i - 1][c - wi] + vi)  # take
    return dp[n][W]
```

### Java

```java
public class Knapsack01 {

    /** Rolling array: O(nW) time, O(W) space. */
    public static int solve(int[] weights, int[] values, int W) {
        int[] dp = new int[W + 1];
        for (int i = 0; i < weights.length; i++) {
            int wi = weights[i], vi = values[i];
            for (int c = W; c >= wi; c--) {   // descending ⇒ 0-1 semantics
                dp[c] = Math.max(dp[c], dp[c - wi] + vi);
            }
        }
        return dp[W];
    }
}
```

## Worked Example

**Problem:** items with `weights = [1, 3, 4, 5]`, `values = [1, 4, 5, 7]`, capacity `W = 7`.

**Solution (top-down / memoization):**

```python
from functools import lru_cache

def knapsack_topdown(weights, values, W):
    n = len(weights)

    @lru_cache(maxsize=None)
    def best(i: int, cap: int) -> int:
        if i == n or cap == 0:
            return 0
        # option 1: skip item i
        res = best(i + 1, cap)
        # option 2: take it if it fits
        if weights[i] <= cap:
            res = max(res, values[i] + best(i + 1, cap - weights[i]))
        return res

    return best(0, W)
```

**Trace — 2-D DP table** (rows = items considered, columns = capacity $0..7$):

```
         c=0  1   2   3   4   5   6   7
 (empty)   0  0   0   0   0   0   0   0
 +(1,1)    0  1   1   1   1   1   1   1
 +(3,4)    0  1   1   4   5   5   5   5
 +(4,5)    0  1   1   4   5   6   6   9    ← dp[3][7] = max(5, dp[2][3]+5) = 9
 +(5,7)    0  1   1   4   5   7   8   9
```

Result: **`dp[4][7] = 9`**, achieved by taking items $(3,4)$ and $(4,5)$: weight $3+4=7 \le 7$, value $4+5=9$. Note that the single most valuable item $(5,7)$ is left out — greed by value would have failed.

## Common Mistakes

- **Traversing capacity in ascending order in the 1-D version.** The classic mistake: it turns 0-1 into *unbounded* (reusable items) with no visible symptom other than inflated answers. The loop's lower bound is `wi` and the direction must be **descending**.
- **Confusing capacity with item count in the table dimension.** The second dimension indexes *capacity*, not item quantity; mixing them up produces wrongly sized tables and out-of-range accesses.
- **Assuming $O(nW)$ is always "efficient".** It is pseudo-polynomial: with large $W$ (say $10^{9}$) the table fits in neither memory nor time. With huge $W$ and small values, use the dual DP over *total value* ($O(n \sum v_i)$).
- **Wrong base case in exact-sum variants.** In subset-sum flavors requiring exact equality, initialize correctly (boolean `dp[0] = True`) or you will conflate "sum 0 reachable" with "unreachable".

## See Also

- [Union-Find](../graphs/union-find) — another classic from the graphs-and-optimization repertoire.
