# Runtime and portable host

- `documents.mjs` reads and validates the JSON blocks in Markdown, from files in Node or local HTTP in the renderer/worker. Inputs are immutable for the lifetime of a run.
- `catalog-loader.mjs` joins shared and campaign documents at startup. It does not generate specifications or write a data bundle.
- `map-assets.mjs` combines public-domain geometry with documented campaign ownership and labels.
- `simulation-worker.mjs` owns the authoritative simulation catalog and queues commands while it loads.
- `simulation-host.mjs` processes commands, checkpoints state and publishes snapshots.
- `simulation-runner.mjs` advances fifteen-minute steps within a bounded time budget. An overloaded computer runs at a lower actual speed rather than skipping simulation ticks. Movement is interpolated independently by the UI.
- `desktop/` contains the Electron host, local-only file/save server, portable launcher recipe and pinned runtime/tool versions.

The packaged application contains the same `ui`, `catalog`, `mechanics`, `worker` and `assets` files as the source tree. The only distributable is the self-contained Windows portable EXE. `.build/portable/` is temporary assembly, not a second release target.

The server binds to loopback, rejects foreign origins and serves only application files. Saves live outside the extracted payload. Closing the desktop window waits for the current campaign to save.
