---
"@sysutils/ps": patch
---

Refine `/proc` backend field selection and invalid-backend error messaging.

- Avoid reading `exe`/`comm` when only `cmd` is requested in the `proc` backend.
- Report the actual invalid backend value in `resolveBackend` instead of a misleading missing-binary message.
- When an env-selected `dotnet-nodeapi` backend fails in `listProcesses`, fall back to `backend: "auto"` so Linux hosts without the CLI binary can still use the `/proc` reader.
