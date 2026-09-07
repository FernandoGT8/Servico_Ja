# Graph Report - TCC  (2026-09-06)

## Corpus Check
- Corpus is ~4,056 words - fits in a single context window. You may not need a graph.

## Summary
- 58 nodes · 67 edges · 9 communities (6 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6

## God Nodes (most connected - your core abstractions)
1. `react` - 6 edges
2. `scripts` - 5 edges
3. `@eslint/js` - 2 edges
4. `@vitejs/plugin-react` - 2 edges
5. `eslint-plugin-react-hooks` - 2 edges
6. `eslint-plugin-react-refresh` - 2 edges
7. `globals` - 2 edges
8. `vite` - 2 edges
9. `App()` - 2 edges
10. `AdminForm()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (9 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.14
Nodes (13): name, private, type, version, autoprefixer, eslint, postcss, react-dom (+5 more)

### Community 1 - "Community 1"
Cohesion: 0.14
Nodes (14): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+6 more)

### Community 2 - "Community 2"
Cohesion: 0.38
Nodes (5): react, App(), AdminForm(), Footer(), Header()

### Community 3 - "Community 3"
Cohesion: 0.40
Nodes (4): @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals

### Community 4 - "Community 4"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 5 - "Community 5"
Cohesion: 0.50
Nodes (4): dependencies, react, react-dom, react-router-dom

## Knowledge Gaps
- **33 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+28 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 36 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.383) - this node is a cross-community bridge._
- **Why does `react` connect `Community 2` to `Community 0`?**
  _High betweenness centrality (0.256) - this node is a cross-community bridge._
- **Why does `scripts` connect `Community 4` to `Community 0`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _33 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._