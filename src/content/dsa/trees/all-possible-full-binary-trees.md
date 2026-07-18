---
title: "All Possible Full Binary Trees"
category: "Trees"
tags: [full-binary-tree, catalan, recursion, enumeration, divide-and-conquer, memoization]
difficulty: "intermediate"
time_complexity: "O(2^n/√n)"
space_complexity: "O(2^n/√n)"
time_note: "Output-dominated: Θ(n·T(n)) with T(n) = C₍ₙ₋₁₎/₂ trees to build."
space_note: "The returned forest itself is Θ(n·T(n)) — unavoidable."
complexity_class: "heavy"
date_added: 2026-07-16
related: ["catalan-asymptotics"]
leetcode_problems:
  - name: "All Possible Full Binary Trees"
    number: 894
    difficulty: "medium"
svg_type: "tree"
---

## Intuition

A *full binary tree* is one where every node has exactly $0$ or $2$ children — never $1$. The problem asks for **every distinct shape** such a tree can take with $n$ nodes, not merely how many there are. That distinction drives the whole design: this is an *enumeration* problem, and the size of the answer itself — not the cleverness of the recursion — is what dominates the cost.

The combinatorial idea is a clean divide-and-conquer: in any full binary tree with $n \ge 3$ nodes, the root consumes $1$ node and leaves $n-1$ nodes to distribute between the left and right subtrees. Both subtrees must themselves be full binary trees, and — as the parity lemma below forces — both must have an **odd** number of nodes. So if the left subtree takes $i$ nodes ($i$ odd), the right takes $n-1-i$, which is automatically odd too, since $n-1$ is even. Enumerate every odd split, recursively enumerate each side, and take the Cartesian product.

The immediate corollary is the famous guard: a full binary tree always has an odd number of nodes, so **if $n$ is even the answer is the empty list** — no recursion required.

## Formal Definition

**Lemma (internal nodes vs. leaves).** In every full binary tree with $I$ internal nodes and $L$ leaves,

$$
L = I + 1.
$$

*Proof.* Induction on $I$. Base $I=0$: the tree is a single leaf, $L = 1 = 0+1$. Step: pick any internal node $v$ whose two children are leaves (one exists since the tree is finite) and delete both children, turning $v$ into a leaf. The new tree has $I-1$ internal nodes and, by inductive hypothesis, $I$ leaves. Undoing the deletion loses one leaf ($v$) and gains two, so $L = I - 1 + 2 = I + 1$. $\blacksquare$

**Corollary (parity).** The total node count is $n = I + L = 2I + 1$ — **always odd** — and conversely every odd $n$ admits at least one full binary tree, by the recursive construction below.

Writing $F(n)$ for the set of distinct full-binary-tree *shapes* on $n$ nodes and $T(n) = |F(n)|$, the enumeration satisfies the Catalan convolution, and with $m = (n-1)/2$ internal nodes:

$$
T(n) = C_m = \frac{1}{m+1}\binom{2m}{m}.
$$

The identification with Catalan numbers, the closed form, and the exact growth rate are developed in full in [Catalan Numbers & Full Binary Tree Asymptotics](../analysis/catalan-asymptotics).

**Correctness of the enumeration (sketch).** By strong induction on $n$: *no omissions* — any $T \in F(n)$ decomposes uniquely at the root into $T_L \in F(i)$, $T_R \in F(n-1-i)$ for the odd $i = |T_L|$, and the loop visits every odd $i$; *no duplicates* — distinct pairs $(T_L, T_R)$ yield distinct shapes, and iterations with different $i$ produce left subtrees of different sizes, so no collision is possible.

## When to Use It

- **Pattern 1 — "return all structures", not "count them":** the answer is a list of trees. Whenever the output is the set of objects itself, complexity is *output-sensitive* and no algorithm can beat the size of the answer.
- **Pattern 2 — recursive shape decomposition:** the object splits at a root into two independent sub-objects of constrained sizes → enumerate splits, recurse, combine with a Cartesian product. The same skeleton solves *Unique Binary Search Trees II* (LC #95).
- **Pattern 3 — parity/feasibility pruning:** a structural invariant (here $n$ odd) rules out entire inputs in $O(1)$. Prove the invariant first; it becomes both the guard clause and half the correctness proof.
- **Pattern 4 — memoize when subproblems repeat:** `recursive(k)` is requested many times for the same odd $k$; caching turns recomputation into a table lookup (with a structural-sharing caveat — see Common Mistakes).

## Complexity Analysis

**Time: `O(2^n/√n)`** — output-dominated: there are $T(n) = C_{(n-1)/2} = \Theta(2^n / n^{3/2})$ distinct trees and each requires $\Theta(n)$ node-construction work, so $S(n) = \Theta(n \cdot T(n)) = \Theta(2^n/\sqrt{n})$. The widely quoted $O(2^{n/2})$ — including in the LeetCode editorial — is **wrong by an exponential factor**: the correct base is $2$, not $\sqrt{2}$. The full derivation (Stirling, singularity analysis, and exactly where the substitution error happens) lives in [Catalan Numbers & Full Binary Tree Asymptotics](../analysis/catalan-asymptotics).

**Space: `O(2^n/√n)`** — the returned forest materializes $T(n)$ trees of $n$ nodes each: $\Theta(n \cdot T(n))$, with or without memoization. The recursion stack adds only $O(n)$.

## Pseudocode

```pseudo
ALL-FULL-BINARY-TREES(n):
    if n is even: return ∅              // parity corollary: no tree exists
    if n = 1:     return { leaf }

    ans ← ∅
    for i in {1, 3, 5, …, n−2}:         // odd sizes for the left subtree
        L ← ALL-FULL-BINARY-TREES(i)
        R ← ALL-FULL-BINARY-TREES(n−1−i)
        for each (l, r) ∈ L × R:        // Cartesian product of sub-shapes
            ans ← ans ∪ { root(l, r) }
    return ans
```

## Implementation

### Python

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def all_possible_fbt(n: int) -> list[TreeNode]:
    """Every distinct full binary tree shape on n nodes.
    Output-dominated: Θ(n · C_(n-1)/2) time and space."""

    def recursive(n: int) -> list[TreeNode]:
        if n == 1:
            return [TreeNode(0)]
        if n % 2 == 0:
            return []                     # full binary trees have odd size

        ans = []
        for i in range(1, n - 1, 2):      # odd left-subtree sizes
            left_trees = recursive(i)
            right_trees = recursive(n - i - 1)

            for left in left_trees:
                for right in right_trees:
                    root = TreeNode(0)    # fresh root per combination
                    root.left = left
                    root.right = right
                    ans.append(root)

        return ans

    return recursive(n)


def all_possible_fbt_memo(n: int) -> list[TreeNode]:
    """Memoized variant: recursive(k) is computed once per odd k.
    Note: subtrees are structurally SHARED across parents (a DAG,
    not independent copies) — fine for read-only consumers."""
    memo: dict[int, list[TreeNode]] = {}

    def recursive(n: int) -> list[TreeNode]:
        if n == 1:
            return [TreeNode(0)]
        if n % 2 == 0:
            return []
        if n in memo:
            return memo[n]

        ans = []
        for i in range(1, n - 1, 2):
            for left in recursive(i):
                for right in recursive(n - i - 1):
                    ans.append(TreeNode(0, left, right))
        memo[n] = ans
        return ans

    return recursive(n)
```

### Java

```java
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AllPossibleFBT {

    /** Memoized enumeration of every full binary tree shape on n nodes. */
    private final Map<Integer, List<TreeNode>> memo = new HashMap<>();

    public List<TreeNode> allPossibleFBT(int n) {
        if (n % 2 == 0) return new ArrayList<>();   // odd sizes only
        if (n == 1) {
            List<TreeNode> leaf = new ArrayList<>();
            leaf.add(new TreeNode(0));
            return leaf;
        }
        if (memo.containsKey(n)) return memo.get(n);

        List<TreeNode> ans = new ArrayList<>();
        for (int i = 1; i <= n - 2; i += 2) {       // odd left sizes
            for (TreeNode left : allPossibleFBT(i)) {
                for (TreeNode right : allPossibleFBT(n - 1 - i)) {
                    TreeNode root = new TreeNode(0); // fresh root
                    root.left = left;
                    root.right = right;
                    ans.add(root);
                }
            }
        }
        memo.put(n, ans);
        return ans;
    }
}
```

## Worked Example

**Problem:** enumerate all full binary trees with $n = 7$ nodes ($m = 3$ internal nodes, so we expect $C_3 = 5$ shapes).

**Split trace** — the loop over odd left sizes $i$, with $T(1)=1$, $T(3)=1$, $T(5)=2$ already known:

| $i$ (left) | $n-1-i$ (right) | $T(i) \times T(n-1-i)$ | shapes |
|------------|-----------------|------------------------|--------|
| 1          | 5               | $1 \times 2$           | 2      |
| 3          | 3               | $1 \times 1$           | 1      |
| 5          | 1               | $2 \times 1$           | 2      |

Total: $2 + 1 + 2 = 5 = C_3$. The five shapes are the two "left-leaning" trees (a 5-node subtree hanging left), their two mirror images, and the perfectly balanced tree with both subtrees of size 3.

**Solution:**

```python
trees = all_possible_fbt(7)
assert len(trees) == 5          # C_3 = 5

# Catalan sanity check for larger n:
# n = 21 → m = 10 → C_10 = 16796 trees
assert len(all_possible_fbt_memo(21)) == 16796
```

## Common Mistakes

- **Quoting $O(2^{n/2})$ as the complexity.** The classic propagated error — it underestimates the true cost by an exponential factor. $C_m \sim 4^m/(m^{3/2}\sqrt{\pi})$ and $m \approx n/2$ give $4^{n/2} = 2^n$, **not** $2^{n/2}$. See [the analysis entry](../analysis/catalan-asymptotics) for the full autopsy of this substitution error.
- **Hoisting the root out of the inner loop.** `root = TreeNode(0)` must be created *per combination*; reusing one root aliases every pair $(l, r)$ onto the same object and the answer collapses to one mutated tree.
- **Treating memoized results as independent copies.** The memoized variant returns lists whose trees *share* subtree objects across different parents — the result is a DAG overlaid on the answer. Read-only consumers (like LeetCode's judge) are fine; if the caller mutates trees, deep-copy on the way out.
- **Missing the parity guard.** Without `if n % 2 == 0: return []` the code still terminates (even sizes bottom out in empty products), but it silently burns work exploring splits that can never produce a tree — and the guard doubles as documentation of the $n = 2I+1$ invariant.

## See Also

- [Catalan Numbers & Full Binary Tree Asymptotics](../analysis/catalan-asymptotics) — the full derivation behind every bound quoted above.
