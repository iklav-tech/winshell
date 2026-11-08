# Changelog

## v0.5.4 — 2026-11-08

### Added

- Capability detection for notification activation, dismissal and action
  callbacks, with pure tests for supported and unsupported projections.
- A SPEC 0.2.0 contract covering real service actions, calendar navigation,
  context actions, notification synchronization/fallbacks and cleanup.
- Retrospective SPEC 0.2.0 evidence and a v0.5.4 verification checklist.

### Changed

- MessageTray/source/notification signal connections are now guarded so an
  unavailable internal signal does not abort taskbar construction.
- Notification actions and “Limpar tudo” are only interactive when the Shell
  object exposes the corresponding operation; unavailable source enumeration is
  represented explicitly instead of as an empty notification history.
- Metadata integer version advanced from 10 to 11 with `version-name` 0.5.4;
  README, installer, tests and technical documentation were synchronized.

### Validation status

- Static, unit, schema, asset and isolated XDG tests pass.
- GNOME 46/Wayland and X11 runtime validation remains pending and is not claimed.

## v0.5.3 — 2026-11-08

### Added

- A pure shell-foundation model and focused tests for application search,
  pinned-first ordering, pin/unpin transitions and taskbar activate/minimize
  decisions.
- A visible and accessible “Em execução” state for running applications in the
  Start list.
- Retrospective SPEC 0.1.0 evidence and a v0.5.3 release verification checklist.

### Changed

- Start search and context-menu pinning now share the tested pure model without
  changing their persisted GSettings contract.
- Metadata integer version advanced from 9 to 10 with `version-name` 0.5.3;
  README, installer, tests and technical documentation were synchronized.

### Validation status

- Static, unit, schema, asset and isolated XDG tests pass.
- GNOME 46/Wayland and X11 runtime validation remains pending and is not claimed.

## v0.5.2 — 2026-11-08

### Added

- A repository contribution guide covering architecture boundaries, lifecycle,
  local-only operation, release synchronization and GNOME runtime validation.
- A SPEC 0.0.1 bootstrap contract test for UUID, Shell 46 metadata, ES Modules,
  lifecycle cleanup, user-local paths, rollback guards and required project files.
- Historical bootstrap evidence plus a v0.5.2 release verification checklist.

### Changed

- Optional Nautilus dependencies are now validated before the installer writes
  any WinShell destination, avoiding a rejected optional request leaving core
  files behind.
- Metadata integer version advanced from 8 to 9 with `version-name` 0.5.2; README,
  installer, tests and technical documentation were synchronized.

### Validation status

- Static, unit, schema, asset and isolated XDG tests pass.
- GNOME 46/Wayland and X11 runtime validation remains pending and is not claimed.

## v0.5.1 — 2026-11-08

### Added

- A single GNOME Shell 46 compatibility boundary for version-specific Shell,
  extension manager, MessageTray, GVC, Slider, panel and chrome APIs.
- Pure popup geometry with tests for negative monitor origins, fractional logical
  anchors, edge clamping, oversized surfaces and invalid displays.
- SPEC 00 verification evidence and automated architecture-quality contracts.

### Changed

- Popups now focus their first interactive child, restore the previous focus on
  close and explicitly unregister Shell chrome during destruction.
- Taskbar construction and monitor rebuilds now roll back partially created bars;
  hotplug failures are isolated and surfaced without escaping the signal callback.
- Metadata integer version advanced from 7 to 8 with `version-name` 0.5.1; the
  installer, README, tests and technical documentation were synchronized.

### Fixed

- Regenerated declared icon assets, including terminal/settings originals and
  their aliases, that made the v0.5.0 baseline suite fail.
- Taskbar and popup chrome no longer rely on actor destruction as implicit cleanup.

### Validation status

- Static, unit, schema, asset and isolated XDG tests pass.
- GNOME 46/Wayland and X11 runtime validation remains pending and is not claimed.

## v0.5.0 — 2026-11-08

### Added

- Independent `WinShell` and `WinShell-Dark` GTK3/GTK4/GNOME Shell theme packages generated from shared design tokens.
- Original CC0 `WinShell Icons` SVG theme with Adwaita/hicolor fallbacks and original CC0 Light/Dark vector wallpapers.
- Appearance preferences for theme mode, visual preset, icons, wallpaper preview/position, DING and optional Nautilus integration.
- Versioned user appearance backup/apply/restore helper with idempotence, missing-schema handling and external-change conflicts.
- DING provider detection and explicit Home, Trash and mounted-volume integration through its public GSettings schema.
- Optional Nautilus 4 `MenuProvider`, isolated from the GNOME Shell process and gated by a user configuration flag.
- Isolated tests for appearance selection, providers, asset integrity, generation, backup/restore and idempotent install/uninstall.

### Changed

- Extension CSS now has generated Light/Dark semantic styling, visible focus indicators and balanced/subtle/high-contrast presets.
- Installer now places extension, themes, icons, wallpapers and helper in user-local XDG paths and supports optional Nautilus installation.
- Uninstall restores tracked appearance by default and refuses to delete installed themes when newer external changes need a decision.
- Preferences now include a dedicated Appearance page; global GNOME changes only occur after an explicit Apply action.
- Metadata integer version advanced from 6 to 7 with `version-name` 0.5.0.

### Safety and compatibility

- Existing schema keys and v0.4.x values are preserved; all new user preferences have defaults.
- No root privileges, system-file replacement, Nautilus patching or Libadwaita CSS injection is used.
- GTK4/Libadwaita and DING provider limitations are documented instead of represented as unsupported emulation.

### Limitations

- Visual/runtime acceptance remains pending on a disposable Ubuntu 24.04 GNOME Shell 46 Wayland session.
- The Nautilus plugin provides a supported preferences action and icon-theme integration, not private-widget restyling.
- WinShell detects but does not install/enable DING or disable unknown desktop icon providers.

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
