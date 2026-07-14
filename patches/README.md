# workers-og patch

`workers-og@0.0.27.patch` guards `resvg`'s `initWasm` with a cached module-level
promise to prevent an "Already initialized" crash on repeated OG renders in the
same Workers isolate.

**Must be re-evaluated when bumping `workers-og`.**
