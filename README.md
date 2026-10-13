# Hereabout

**What's on near you, tonight.** A hyperlocal discovery and booking app for evening plans in Bengaluru: live music, food walks, workshops and home-hosted nights, sorted by time and walking distance.

This is the production Next.js port of the Hereabout v1.0 prototype. It is a front-end only demo: there is no backend and no auth. All event data lives in `src/data/events.ts`; tickets, saved events, host requests, the event draft and the theme are kept in a React context and persisted to `localStorage`.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run lint
```

Deploys to Vercel with default settings. No environment variables are needed.

## Routes

| Route | Screen |
| --- | --- |
| `/` | Discover: rolling hero headline, Where / When / Vibe search pill, live featured card, Tonight Timeline, quick picks, friends rail, curated picks, Explore (filters + sticky radar map with card and pin highlight), host band |
| `/map` | Full-screen radar map with filter chips and a draggable bottom sheet (phones). On desktop it redirects to Explore on `/` |
| `/event/[id]` | Event detail: tinted glow, cover, facts, "Who's in the room" ring, location map (private homes show only the area), host card, more nearby, booking card / sticky booking bar, checkout |
| `/tickets` | Ticket stubs with QR codes (desktop) and wallet-style passes (phones), Upcoming / Past |
| `/host` | Host dashboard: count-up stats, events table, approve / decline join requests |
| `/host/new` | Create an event with live preview and title validation |

Checkout is a client component: a modal on desktop and a bottom sheet with a drag handle on phones (Pay, Details, Done with confetti and a QR ticket; request-to-join events go Hold, Message, Sent).

## Two layouts, one codebase

- **900 px and wider:** desktop site with sticky header, split list and map, sticky booking card.
- **Below 900 px:** a native-app layout: large-title app bars that collapse on scroll, bottom tab bar with a raised Tonight button, push / pop / tab slide transitions between routes (View Transitions API, with a plain navigation fallback), bottom sheets with drag handles, sticky booking bar, wallet-style passes, iOS-style segments and switches, 44 px touch targets and safe-area padding.

Both layouts are server-rendered from the same markup and switched with CSS media queries, so there are no hydration mismatches. JavaScript only checks the viewport inside event handlers and effects.

Dark theme is the default; the theme toggle is persisted and applied before first paint. `prefers-reduced-motion` turns off motion.

## Structure

```
src/
  app/                 App Router routes, layout (fonts, metadata), globals.css, not-found
  views/               One client component per screen (Discover, MapView, EventView, Tickets, Host, Create)
  components/
    Providers.tsx      App state (persisted), toast, native-style navigation
    Shell.tsx          Desktop header, footer, mobile tab bar, floating map pill
    Chrome.tsx         Mobile app bar, large title, modal / bottom sheet
    Bits.tsx           Cards, photo (next/image), date tile, urgency chip, save button, count-up, QR
    Radar.tsx          Radar map with photo pins
    Timeline.tsx       Tonight Timeline
    Checkout.tsx       Checkout flow
    Icon.tsx           Inline SVG icons
  data/events.ts       Events, tiers, demo tickets and requests
  lib/                 Formatting and filtering, map art, confetti and scroll helpers
  fonts/               Self-hosted variable fonts (Bricolage Grotesque, Manrope, JetBrains Mono)
public/img/            Event photos
```

Fonts are self-hosted with `next/font/local` (the same files Google Fonts serves), so builds do not need network access.
