---
title: "Catalan Numbers & Full Binary Tree Asymptotics"
category: "Analysis"
tags: [catalan, asymptotics, generating-functions, stirling, singularity-analysis, complexity]
difficulty: "advanced"
time_complexity: "Θ(2^n/n^1.5)"
space_complexity: "—"
time_note: "Exact growth of T(n), the number of full binary trees on n nodes."
space_note: "Not an algorithm — a counting analysis."
complexity_class: "heavy"
date_added: 2026-07-16
related: ["all-possible-full-binary-trees"]
leetcode_problems:
  - name: "All Possible Full Binary Trees"
    number: 894
    difficulty: "medium"
svg_type: "tree"
---

## Intuition

How many distinct full binary trees exist on $n$ nodes? Call that count $T(n)$. The question matters beyond curiosity: for the [enumeration algorithm](../trees/all-possible-full-binary-trees) that *returns* all of them, $T(n)$ **is** the complexity — the algorithm cannot possibly run faster than the size of its own output. Getting $T(n)$ wrong means getting the algorithm's complexity wrong.

And it *is* widely gotten wrong. A commonly quoted bound — replicated in the LeetCode editorial for problem #894 — claims $O(2^{n/2})$. The correct order is $\Theta(2^n / n^{3/2})$: same shape, **exponentially larger**. This entry derives the exact asymptotics from first principles and performs the autopsy on where the $2^{n/2}$ myth comes from. The punchline is a one-line substitution error with severe asymptotic consequences.

The structure that makes all of this tractable: $T(n)$ is a **Catalan number**, and Catalan numbers sit at the center of a large universality class whose growth rate ($\rho^{-m}$) and polynomial correction ($m^{-3/2}$) can be read directly off a generating function.

## Formal Definition

The **Catalan numbers** are defined by the convolution recurrence

$$
C_0 = 1, \qquad C_{m+1} = \sum_{k=0}^{m} C_k \, C_{m-k} \quad (m \ge 0),
$$

with first values $C_0=1,\ C_1=1,\ C_2=2,\ C_3=5,\ C_4=14,\ C_5=42,\ C_6=132,\dots$

**Closed form.**

$$
C_m = \frac{1}{m+1}\binom{2m}{m}.
$$

*Proof (via the generating function).* Let $C(x) = \sum_{m\ge0} C_m x^m$. The Cauchy product $C(x)^2 = \sum_m \big(\sum_{k=0}^m C_k C_{m-k}\big) x^m$ reproduces the right-hand side of the recurrence shifted by one index, so the recurrence is exactly the functional equation

$$
C(x) = 1 + x\,C(x)^2.
$$

Solving the quadratic $xC^2 - C + 1 = 0$ and choosing the branch analytic at $x=0$ with $C(0)=1$:

$$
C(x) = \frac{1-\sqrt{1-4x}}{2x}.
$$

Expanding $\sqrt{1-4x}$ with the generalized binomial theorem and extracting the coefficient of $x^m$ yields $C_m = \frac{1}{m+1}\binom{2m}{m}$ (the coefficient extraction is standard; see Flajolet–Sedgewick, *Analytic Combinatorics*, ch. I). $\blacksquare$

## The Bijection with Full Binary Trees

**Theorem 1.** Let $T(n)$ be the number of distinct full binary trees on $n$ nodes and $m = (n-1)/2$ the number of internal nodes. Then

$$
T(n) = C_m.
$$

*Proof.* Write $t_m := T(2m+1)$, counting by internal nodes. A full binary tree with $m$ internal nodes decomposes at the root: choose $j \in \{0, \dots, m-1\}$ internal nodes for the left subtree (the root consumes one, leaving $m-1-j$ for the right), and combine any left shape with any right shape independently:

$$
t_m = \sum_{j=0}^{m-1} t_j\, t_{m-1-j}, \qquad t_0 = 1.
$$

This is **exactly** the Catalan convolution. Since $t_0 = C_0 = 1$ and both sequences satisfy the same recurrence with the same initial condition, induction gives $t_m = C_m$ for all $m \ge 0$. $\blacksquare$

Therefore:

$$
\boxed{\,T(n) = C_{(n-1)/2} = \frac{2}{n+1}\binom{n-1}{(n-1)/2}\,}
$$

## Asymptotics via Stirling

**Theorem 2 (Catalan asymptotics).**

$$
C_m \sim \frac{4^m}{m^{3/2}\sqrt{\pi}} \quad (m \to \infty),
$$

meaning $\lim_{m\to\infty} C_m \big/ \frac{4^m}{m^{3/2}\sqrt{\pi}} = 1$.

*Proof.* From the closed form and Stirling's formula $m! \sim \sqrt{2\pi m}\,(m/e)^m$:

$$
\binom{2m}{m} = \frac{(2m)!}{(m!)^2} \sim \frac{\sqrt{4\pi m}\left(\frac{2m}{e}\right)^{2m}}{2\pi m \left(\frac{m}{e}\right)^{2m}} = \frac{4^m}{\sqrt{\pi m}},
$$

and since $m+1 \sim m$,

$$
C_m = \frac{1}{m+1}\binom{2m}{m} \sim \frac{1}{m}\cdot\frac{4^m}{\sqrt{\pi m}} = \frac{4^m}{\sqrt{\pi}\,m^{3/2}}. \qquad \blacksquare
$$

## Singularity Analysis

The same result falls out of the generating function directly — a method that generalizes far beyond Catalan. $C(x)=\frac{1-\sqrt{1-4x}}{2x}$ has its dominant singularity at $x = \rho = 1/4$, the branch point of $\sqrt{1-4x}$. The **transfer principle** of singularity analysis (Flajolet–Odlyzko) states that if $f(x) \sim K(1-x/\rho)^{-\alpha}$ near the dominant singularity, then

$$
[x^m]\,f(x) \sim \frac{K}{\Gamma(\alpha)}\, m^{\alpha-1}\, \rho^{-m}.
$$

Here the singular part is of square-root type ($\alpha = -1/2$, with $\Gamma(-1/2) = -2\sqrt{\pi}$ and the signs resolving through $1 - 2x\,C(x) = \sqrt{1-4x}$), and $\rho = 1/4$ gives the exponential factor $\rho^{-m} = 4^m$ together with the polynomial factor $m^{-3/2}$.

Two structural lessons, both general:

- **The exponential growth rate is always $\rho^{-m}$**, the reciprocal of the generating function's radius of convergence.
- **The polynomial correction depends only on the singularity type** — square-root singularities give $m^{-3/2}$, universally.

## Where the O(2^(n/2)) Myth Comes From

Substituting $m = (n-1)/2$ into Theorem 2 translates the asymptotics to the variable $n$ (total nodes):

$$
T(n) = C_{(n-1)/2} \sim \frac{4^{(n-1)/2}}{\left(\frac{n-1}{2}\right)^{3/2}\sqrt{\pi}} = \frac{2^{\,n-1}}{\left(\frac{n-1}{2}\right)^{3/2}\sqrt{\pi}},
$$

so, absorbing constants into $\Theta$:

$$
T(n) = \Theta\!\left(\frac{2^n}{n^{3/2}}\right).
$$

**This is exponentially different from $O(2^{n/2})$:**

| Expression | Exponential base | Correct bound for $T(n)$? |
|---|---|---|
| $2^{n/2} = (\sqrt{2})^n \approx 1.41^n$ | $\sqrt{2} \approx 1.414$ | **No** — drastically underestimates |
| $\Theta(2^n / n^{3/2})$ | $2$ | **Yes** — exact order |
| $4^{n/2} = 2^n$ | $2$ | Upper bound, loose only by the $n^{-3/2}$ factor |

Numerical check at $n = 21$ (i.e. $m = 10$): $C_{10} = 16796$.

- $2^{n/2} = 2^{10.5} \approx 1448$ — underestimates by a factor of $\sim 11.6\times$, and the gap **grows exponentially** with $n$.
- $2^n / n^{3/2} = 2^{21} / 21^{1.5} \approx 21800$ — the right order of magnitude.

**The autopsy.** The asymptotics $C_m \sim 4^m/(\cdot)$ is correct *in the variable $m$* (internal nodes). Since $m \approx n/2$, translating to total nodes requires $4^m \approx 4^{n/2} = (4^{1/2})^n = 2^n$. The myth writes $2^{n/2}$ instead — i.e. it substitutes $m \to n/2$ into a base-$2$ exponential rather than the base-$4$ one, silently halving the exponent. A one-line algebra slip, an exponentially wrong answer. Its appearance in the LeetCode editorial for #894 suggests copy-propagation rather than independent (erroneous) derivations.

## Algorithmic Consequences

For the [enumeration algorithm](../trees/all-possible-full-binary-trees) that returns all of $F(n)$:

**Time (no memoization).** Let $S(n)$ be total work. The recursion recomputes identical subproblems, but the dominant cost is not the call count — it is **constructing the output**: $T(n)$ trees of $n$ nodes each, at $\Theta(1)$ per node created,

$$
S(n) = \Theta\big(n \cdot T(n)\big) = \Theta\!\left(n \cdot \frac{2^n}{n^{3/2}}\right) = \Theta\!\left(\frac{2^n}{\sqrt{n}}\right).
$$

The redundant recomputation adds at most a polynomial factor in $n$ (from the $O(n)$ split loop) — it **never changes the exponential base**, which stays at $2$. In the looser style common in interviews: $S(n) = O(n \cdot 4^{n/2}) = O(n \cdot 2^n)$. Never $O(2^{n/2})$.

**Space.** The recursion stack is $O(n)$ (each call strictly decreases size). The output — $T(n)$ trees of $n$ nodes — is unavoidable:

$$
\text{output space} = \Theta\big(n \cdot T(n)\big) = \Theta\!\left(\frac{2^n}{\sqrt{n}}\right).
$$

**Memoization** caches the list for each odd $k$, eliminating recomputation — but the cached trees must remain materialized, and they cannot be shared across parents without turning the answer into a DAG rather than independent trees. Memoization saves *time*; it does not change the *space* order, which stays output-dominated.

## Catalan Universality

Theorem 1 is not an isolated coincidence. Full binary trees with $m$ internal nodes are in **bijection** with, among many others:

1. **General binary trees on $m$ nodes** — Knuth's rotation correspondence between binary trees and ordered forests.
2. **Balanced sequences of $m$ parenthesis pairs** (Dyck words of length $2m$) — traverse the tree in pre-order, emitting `(` on entering an internal node and `)` on leaving.
3. **Triangulations of a convex $(m+2)$-gon** — via the dual tree of the triangulation.
4. **Monotone lattice paths** from $(0,0)$ to $(m,m)$ never crossing above the diagonal.

This multiplicity is why Catalan numbers keep surfacing in computer science: parsing algorithms, persistent data structures, unambiguous context-free languages, and in algebraic combinatorics via generalized Catalan polynomials.

**Why the $-3/2$ exponent is universal.** The polynomial factor $m^{-3/2}$ is not specific to binary trees. Every family of *simple trees* (Meir–Moon) whose branching generating function $\phi$ yields the functional equation $y = x\,\phi(y)$, with $\phi$ analytic and $\phi(0) \ne 0$, has asymptotics of the form $K \cdot \rho^{-m}\, m^{-3/2}$, where $\rho$ is fixed by the square-root-singularity condition $\phi(\tau) - \tau\,\phi'(\tau) = 0$. This is the **Otter–Meir–Moon theorem**; Flajolet and Sedgewick describe the phenomenon as the tree-like *universality class* of algebraic generating functions — the reason virtually every "count the trees" problem you meet ends in $\rho^{-m} m^{-3/2}$.

## See Also

- [All Possible Full Binary Trees](../trees/all-possible-full-binary-trees) — the enumeration algorithm whose complexity this entry pins down.
