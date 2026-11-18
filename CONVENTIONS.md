# Page conventions v2 (sidebar = the app's real admin sidebar)
One page per sidebar item of the HeroCloud app: `src/content/docs/<section>/<slug>.mdx`, sections: workspace, pipeline, operations, intelligence, admin. Sidebar order/labels come from /Users/pylot/Downloads/herocloud-github/apps/prototype/src/app/navigation.tsx (navRegistry).
Keep pages SHORT and plain English (new team member). Frontmatter: `title` (the sidebar label) and `description` (one sentence, ALWAYS wrapped in double quotes).
Body, exactly this order:
```
import { Badge, Tabs, TabItem } from '@astrojs/starlight/components';
## Purpose
(2-3 short sentences: why this page exists, who uses it, route path.)
## What works with the real API
(bullets: each feature that is wired to a real backend call in live mode. Name the call in plain words, e.g. "loads leads from the core API".)
## Not finished yet
(bullets: MOCK parts, demo data, frontend-only logic, missing server side, planned features. Say what is missing.)
## Overall status
<Badge text="Integrated" variant="success" /> | <Badge text="Partly integrated" variant="caution" /> | <Badge text="Mock only" variant="danger" /> | <Badge text="Planned" variant="note" />  (pick ONE)
## Screenshots
<Tabs><TabItem label="Light">![alt](/shots/<slug>/<name>-light.png)</TabItem><TabItem label="Dark">![alt](/shots/<slug>/<name>-dark.png)</TabItem></Tabs>  (1-3 shots)
```
HOW TO DECIDE "real API": in apps/prototype/src/modules/<module>: look at `api.live.ts`, `svc('...')`, `isLiveMode()`/`isDemoMode()` branches, hooks that fetch `/v1/...`; then confirm the server route exists in services/* (route file) and is not a stub. Anything using only the in-browser mock store (src/mock, api.ts without live branch) or labelled MOCK is NOT integrated. Tests existing is not proof. If you cannot tell, say "not verified" in Not finished yet.
Also write `shots/<slug>.json` per page: `[{ "name": "main", "path": "/route", "waitFor": "visible text" }]` using the real route (check manifest.tsx for exact path). Images land in public/shots/<slug>/<name>-light|dark.png (a script generates them; do not take screenshots).
Repo is READ ONLY. No dev servers, no browser. Write only your own pages and shots json.
