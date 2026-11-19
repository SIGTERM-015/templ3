# workers-og patch

`workers-og@0.0.27.patch` memoizes resvg's `initWasm` in a module-level promise, so
it runs once per Workers isolate. Upstream calls it on every render, catches the
resulting "Already initialized" error and logs `init RESVG` plus the error on each
OG image request after the first.

0.0.27 is the latest release. Drop this patch (and the `pnpm.patchedDependencies`
entry in the root `package.json`) once upstream ships
[kvnang/workers-og#20](https://github.com/kvnang/workers-og/pull/20), or when
migrating to another OG renderer.

**Must be re-evaluated when bumping `workers-og`.**
