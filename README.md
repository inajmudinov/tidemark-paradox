# Tidemark Paradox

A two-player simultaneous strategy game created with AI assistance for a Handshake AI project.

**[Play the live game](https://tidemark-paradox-ilkhom.quietpetal9.chatgpt.site/)**

## How to play

1. Create a room and share its eight-character code with another player.
2. Each player secretly selects an anchor cell and a direction on the 4 × 4 board.
3. Both moves resolve together. Different anchor cells earn one point each; colliding anchors earn no anchor points and create no new echoes.
4. An anchor sends an echo one cell in its chosen direction for the following round. Edges wrap around.
5. Intercept an opponent's echo by anchoring on its destination for three points. An echo that arrives without being intercepted earns its owner two points.
6. After six rounds, the highest score wins. Both players can request a rematch.

The final round creates no new echoes. Player seats persist on the same browser through reloads.

## Features

- Shared rooms with server-side state in Cloudflare D1.
- Simultaneous moves, opponent move redaction, and server-side scoring.
- Optimistic concurrency checks to prevent conflicting room updates.
- Round history, rematches, and room expiration after 48 hours of inactivity.
- Responsive interface built with React, TypeScript, and Tailwind CSS.

## Run locally

Requires Node.js >=22.13.0 and the package manager declared in package.json.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by the development server. In a separate terminal, initialize the local D1 database before creating a room:

```sh
pnpm exec wrangler d1 execute site-creator-d1 --local --file=drizzle/0000_legal_tombstone.sql
```

The local hosting manifest declares the DB binding without the original hosted Site's project identifier. A separate deployment requires its own hosting configuration and database.

## Validation

```sh
node tests/game.mjs
pnpm exec tsc --noEmit
pnpm build
```

The game tests cover board wrapping, anchor scoring, interception, collisions, secret move redaction, and the six-round ending.

## Source layout

- app/page.tsx: interactive game interface.
- app/api/game/route.ts: room creation, joining, moves, polling, and rematches.
- lib/game.ts: scoring and round resolution.
- db/ and drizzle/: database schema and migration.
- tests/game.mjs: game-rule checks.
- worker/ and scripts/: Vinext/Cloudflare runtime and build support.

## Project notes

This is a portfolio demonstration. The source uses the Vinext Sites starter; its original setup documentation is retained in docs/STARTER.md, together with bundled third-party license notices. Room codes and player tokens provide game-session access; the game does not require player accounts.
