# Changelog

## v0.4.2 — 2026-11-08

### Added

- Automatic, warn-only and disabled taskbar conflict policies in GSettings and GTK4/Libadwaita preferences.
- Runtime detection for Ubuntu Dock, Dash to Dock and Dash to Panel through GNOME Shell's extension manager.
- Persistent ownership records for docks disabled by WinShell, enabling lifecycle restoration without touching third-party actors.
- Unit tests for conflict policy, reversible records, negative/non-zero monitor origins and unique per-monitor topology.

### Changed

- Taskbar geometry now comes from a validated pure helper and always anchors to the corresponding monitor's logical bottom edge.
- Multi-monitor rebuilds derive a unique index set and safely support the transient zero-monitor state.
- Metadata integer version advanced from 5 to 6 with `version-name` 0.4.2.

### Fixed

- WinShell no longer leaves a supported dock visible behind its own taskbar in Automatic mode.
- Disabling WinShell restores only taskbar extensions that WinShell recorded as previously active.
- GNOME Shell 46 extension-order rebasing no longer triggers premature dock restoration or loses the original top-panel visibility state.

### Limitations

- Visual/runtime acceptance scenarios remain pending in a disposable GNOME Shell 46 Wayland session.
- Unknown third-party panels are not modified; administrative policy can prevent automatic changes and produces a warning.
- A Shell process crash can defer restoration until the next WinShell lifecycle; manual recovery commands are documented in README.

## v0.4.1 — 2026-11-08

### Added

- Functional Quick Settings adapters for NetworkManager Wi‑Fi, Bluetooth/rfkill, GVC audio, GNOME brightness, UPower battery and Do Not Disturb.
- Native WinShell monthly calendar with locale-aware alignment, navigation and day selection.
- Grouped, actionable and dismissible notification center synchronized with GNOME Shell sources.
- Window-aware context actions and desktop-entry actions.
- Unit-testable models and coverage for calendar, notifications, context menus and Quick Settings state.

### Changed

- The taskbar clock now opens the WinShell calendar/notification center.
- System controls are shared across per-monitor taskbars and cleaned up with the manager lifecycle.
- Context menus, flyouts and calendar gained coordinated light/dark styling.
- Metadata integer version advanced from 4 to 5 with `version-name` 0.4.1.

### Fixed

- Notification ordering now uses timestamps across sources.
- UI refreshes follow external service changes and notification lifecycle signals.
- Pending refresh sources and service signal handlers are disconnected during disable.

### Limitations

- Runtime behavior still requires manual validation on Ubuntu 24.04 / GNOME Shell 46 / Wayland.
- New/secured Wi‑Fi credentials, Bluetooth pairing and advanced service configuration remain in GNOME Settings.
- Notification history remains owned by GNOME Shell; WinShell does not persist a parallel copy.

## v0.4.0

- Added graphical Snap Layout templates, window preview integration, the `snap-layouts` preference and geometry tests.
