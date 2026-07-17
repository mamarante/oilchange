# Oil Change

A cross-platform (iOS/Android, via Expo) mobile app for tracking vehicle oil change history and
reminding you when the next one is due, based on mileage and/or time elapsed — whichever comes
first.

## Stack

- **Expo SDK 57** + **expo-router** (file-based navigation, under `src/app/`)
- **TypeScript**, strict mode
- **expo-sqlite** for local, on-device relational storage (vehicles + service logs)
- **expo-notifications** for local (device-only) reminders — no push server required
- No backend/server. All data lives on-device.

## Getting started

```sh
npm install
npm start
```

Then open in Expo Go, an iOS Simulator, or an Android Emulator.

## Project layout

```
src/
  app/                    expo-router routes (file-based)
    (tabs)/               bottom tabs: Vehicles list, Settings
    vehicle/new.tsx        add-vehicle form
    vehicle/[id]/          vehicle detail, edit, history, odometer update
    vehicle/[id]/log/      add/edit oil-change log entries
  components/             presentational + form components
  context/AppDataContext.tsx   loads/mutates vehicles & logs, keeps reminders in sync
  hooks/use-due-status.ts      derives DueStatus per vehicle from context data
  notifications/          expo-notifications scheduling logic
  storage/                expo-sqlite schema + repositories (vehicles, oil_change_logs)
  types/                  shared domain types
  utils/dueStatus.ts       "whichever comes first" mileage/date due calculation
  utils/date.ts            date-only (YYYY-MM-DD) helpers
```

## How due-date calculation works

`src/utils/dueStatus.ts` computes, per vehicle:

1. A **baseline** mileage/date — the most recent logged oil change, or (if none logged yet) the
   vehicle's baseline odometer reading and profile creation date.
2. `nextDueMileage` / `nextDueDate` — baseline + the vehicle's configured interval, unless a
   manual override is set on the vehicle profile.
3. A `level` (`ok` / `due_soon` / `overdue` / `unknown`) using **whichever track is worse** —
   mileage or date — so "due soon" fires as soon as either threshold is crossed.

## Reminders

Reminders are **local notifications only** (no account, no push server):

- A date-based reminder is scheduled for `nextDueDate` minus the vehicle's configured lead time
  (default 7 days), and rescheduled any time the vehicle or its logs change.
- A recurring "update your mileage" nudge is scheduled per vehicle every 14 days, since the app
  has no live odometer connection and mileage-based due dates depend on the user keeping the
  odometer reading current.
- Updating the odometer immediately checks whether the vehicle just crossed into "due soon" /
  "overdue" by mileage and fires an immediate notification if so.
- Reminders support a **Snooze 1 day** action (in addition to the OS default dismiss).

## Not included in this MVP

- **SMS reminders (Twilio)** — the original spec lists this as optional. Sending SMS requires a
  backend to hold provider credentials securely; since this app is intentionally local-only with
  no server, SMS is left as a Phase 2 feature once a backend exists. This is documented in the
  Settings tab.
- Receipt photos, PDF export, other maintenance types, cost tracking, home screen widget — called
  out as Phase 2 in the original spec.
