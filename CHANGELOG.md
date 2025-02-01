## 0.3.0
- Switch between card, list and tile view for actions page (homepage).
- Habit ID generation improvement: random 64-bit integer (previously 53-bit).
- "Last Day" as a slot in monthly habits: habit that appears on the last day of each month.
- Automated  tests for database functions.
- Using dexie for db connection management (previously indexedDB directly, which used to break after a while).
- Toggle an action state saves UI's value instead of toggling DB's value.
- Added privacy policy.
- Dropbox sync support - allows syncing data across devices (implicit grant flow, 4-hour access tokens).
- Added a dedicated "done" column in actions table, allowing untoggled actions to sync properly.
- Improved phase labels and the alignment of weekly cycles.

## 0.2.0
- Basic Habit management with cycles, toggling actions, pace metrics, dark theme.
- Show version number in settings.

## 0.1.0
- Boilerplate setup with Vite, React, TailwindCSS and Shadcn UI.
