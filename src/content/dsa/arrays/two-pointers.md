---
title: "Two Pointers"
category: "Arrays & Strings"
tags: [two-pointers, array, string, in-place, invariant]
difficulty: "foundational"
time_complexity: "O(n)"
space_complexity: "O(1)"
time_note: "Each pointer only moves forward — at most 2n steps total."
space_note: "Two indices and an accumulator; nothing grows with n."
complexity_class: "good"
date_added: 2026-07-16
related: ["graphs/union-find"]
leetcode_problems:
  - name: "Two Sum II - Input Array Is Sorted"
    number: 167
    difficulty: "medium"
  - name: "Container With Most Water"
    number: 11
    difficulty: "medium"
  - name: "3Sum"
    number: 15
    difficulty: "medium"
svg_type: "array"
---

## Intuition

The two-pointers technique exploits a structural observation: when an array is **sorted** (or admits some notion of monotonicity), moving inward from both ends discards, at every step, not a single candidate but an entire band of candidates that can no longer be optimal. Instead of examining all $\binom{n}{2}$ pairs, we collapse the search into a single linear pass.

The heart of the method is an **invariant**: at every iteration, no pair involving the pointer we just moved can improve the answer. Consider *Two Sum* over a sorted array $a$ with target $t$. If $a[L] + a[R] > t$, then for every $j > L$ we have $a[j] + a[R] \geq a[L] + a[R] > t$, so $R$ can never form a valid pair with any index to the left of its current position — we may decrement $R$ with the certainty that no solution is lost. Symmetrically when the sum falls short of $t$.

That certainty is what turns $O(n^2)$ into $O(n)$: every pointer move permanently *closes* a full row or column of the pair matrix, and only $2n$ moves are possible before the pointers cross.

## Formal Definition

Let $a$ be an array of length $n$ and $P(i, j)$ a predicate over index pairs $0 \le i < j < n$. Two pointers solves problems where $P$ is **monotone** with respect to pointer movement: there is a direction of motion such that, given the current state $(L, R)$, the sign of the comparison between the current value and the target uniquely determines which pointer to advance without discarding the optimal solution.

$$
\text{Invariant: } \forall\, (i,j) \text{ already discarded}, \quad \neg\,\big(P(i,j) \text{ is optimal}\big).
$$

The two main families:

- **Opposite pointers** (*converging*): $L = 0$, $R = n-1$, moving toward the center. Requires sorted input.
- **Same-direction pointers** (*fast/slow*): both start on the left and advance at different rates. The basis of cycle detection and in-place removal.

## When to Use It

- **Pattern 1 — sorted array + pair/triple with a sum condition:** find two (or, fixing one index, three) elements satisfying an additive relation. Sortedness enables the monotone discard.
- **Pattern 2 — in-place modification with two regions:** a *slow* pointer marks the frontier of the processed region (e.g. elements to keep) while a *fast* one explores. Remove Duplicates, Move Zeroes.
- **Pattern 3 — palindromes and symmetry:** comparing from both ends toward the center is intrinsically two pointers.
- **Pattern 4 — merging two sorted sequences:** one pointer per sequence, always advancing the smaller.

Inverse warning sign: if the array is **not** sorted and you cannot sort it without losing the answer (e.g. because original indices matter), converging pointers probably do not apply — reach for a hash map instead.

## Complexity Analysis

**Time: `O(n)`** — each pointer advances monotonically and never backtracks; together they take at most $2n$ steps before crossing, and each step is $O(1)$. If the input arrives unsorted, the sort dominates and the total becomes $O(n \log n)$.

**Space: `O(1)`** — only two indices and an accumulator are maintained; no auxiliary structure scales with the input.

## Pseudocode

```pseudo
CONVERGING-TWO-POINTERS(a, target):
    L ← 0
    R ← |a| − 1
    while L < R:
        s ← a[L] + a[R]
        if s = target:
            return (L, R)
        else if s < target:      // need more → raise the smaller end
            L ← L + 1
        else:                    // s > target: lower the bigger end
            R ← R − 1
    return NONE
```

## Implementation

### Python

```python
def two_sum_sorted(a: list[int], target: int) -> tuple[int, int] | None:
    """Pair of indices (l, r) with a[l] + a[r] == target over SORTED 'a'.

    Invariant: every possible solution lives inside a[l..r].
    Each move preserves that invariant by discarding a whole band.
    """
    l, r = 0, len(a) - 1
    while l < r:
        s = a[l] + a[r]
        if s == target:
            return (l, r)
        elif s < target:
            l += 1          # current minimum is too small
        else:
            r -= 1          # current maximum is too large
    return None


def remove_duplicates(a: list[int]) -> int:
    """Compact a SORTED array in place; returns the useful length.
    'slow' marks the frontier of the duplicate-free region."""
    if not a:
        return 0
    slow = 0
    for fast in range(1, len(a)):
        if a[fast] != a[slow]:
            slow += 1
            a[slow] = a[fast]
    return slow + 1
```

### Java

```java
public class TwoPointers {

    /** Pair of indices with a[l] + a[r] == target over SORTED 'a'. */
    public static int[] twoSumSorted(int[] a, int target) {
        int l = 0, r = a.length - 1;
        while (l < r) {
            int s = a[l] + a[r];
            if (s == target) return new int[] { l, r };
            else if (s < target) l++;   // raise the smaller end
            else r--;                   // lower the bigger end
        }
        return null;
    }

    /** Compact a SORTED array in place; returns the useful length. */
    public static int removeDuplicates(int[] a) {
        if (a.length == 0) return 0;
        int slow = 0;
        for (int fast = 1; fast < a.length; fast++) {
            if (a[fast] != a[slow]) {
                a[++slow] = a[fast];
            }
        }
        return slow + 1;
    }
}
```

## Worked Example

**Problem:** *Container With Most Water* (LC #11). Given heights $h$, pick two lines that, together with the $x$-axis, hold the most water: maximize $(R - L)\cdot \min(h[L], h[R])$.

**Key idea:** the area is limited by the **shorter** line. Starting from the extremes (maximum possible width), moving the pointer at the taller line can only shrink the width while keeping or lowering the limiting height — it never improves. So we always move the pointer at the shorter line: the only move with upside.

**Solution:**

```python
def max_area(h: list[int]) -> int:
    l, r = 0, len(h) - 1
    best = 0
    while l < r:
        best = max(best, (r - l) * min(h[l], h[r]))
        if h[l] < h[r]:
            l += 1          # the low barrier is on the left
        else:
            r -= 1
    return best
```

**Execution trace** with `h = [1, 8, 6, 2, 5, 4, 8, 3, 7]`:

```
L  R   width  min(h[L],h[R])  area   best
0  8     8         1            8      8
1  8     7         7           49     49   ← h[L]=8 ≥ h[R]=7, move R
1  7     6         3           18     49
1  6     5         8           40     49
1  5     4         4           16     49
1  4     3         5           15     49
1  3     2         2            4     49
1  2     1         6            6     49
```

Result: **49**, in $O(n)$ steps instead of $O(n^2)$ pairs.

## Common Mistakes

- **Moving the wrong pointer.** In *Container With Most Water* the temptation is to move the taller line "in search of something even taller". That is wrong: the shorter line sets the limit, so moving the taller one guarantees no improvement. Correctness depends on always moving whichever pointer can change the active constraint.
- **Forgetting the array must be sorted.** Converging pointers assume monotonicity. Applying them to unsorted data produces silently wrong answers, not a runtime error.
- **Stopping condition `L <= R` instead of `L < R`.** With `<=` an element can pair with itself, producing invalid pairs (or counting one index twice). Unless the problem explicitly allows it, the guard is `L < R`.
- **Duplicates in 3Sum.** When extending to triples, finding them is not enough; you must skip repeated values at all three levels to avoid emitting duplicate triples.

## See Also

- [Union-Find](../graphs/union-find) — another structure where an invariant plus amortized analysis explains the efficiency.
