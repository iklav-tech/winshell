# Contributing to WinShell

WinShell targets Ubuntu 24.04 LTS and GNOME Shell 46, with Wayland as the
primary session. Contributions should improve native GNOME integration without
turning the project into a Windows emulator or copying proprietary Microsoft
assets.

## Development setup

Install GJS, GNOME extension tools, GLib schema tools and Node.js, then run the
repository checks before changing the real desktop profile:

```bash
./tests/check.sh
./scripts/doctor.sh
```

The complete automated suite uses temporary XDG directories for install and
appearance tests. Do not point tests at another user's profile or use `sudo`.

## Change workflow

1. Read `AGENTS.md`, `specs/INDEX.md`, the architecture specification and the
   version specification relevant to the change.
2. Inspect the implementation and record existing behavior before editing.
3. Keep GNOME-version-specific APIs in `modules/shellCompat.js`; keep pure logic
   in `.mjs` modules that can be exercised with Node.js.
4. Release every actor, signal, GLib source, keybinding, proxy and chrome entry
   during disable. Use asynchronous D-Bus and service calls in the Shell process.
5. When changing a GSettings key, update the schema, preferences, every consumer,
   tests and documentation together. Preserve existing user values on upgrade.
6. Update README, CHANGELOG, installer messages, verification evidence and both
   metadata versions for a release change.

Use four spaces and semicolons in JavaScript. Prefer small cohesive modules and
supported GNOME interfaces. Keep appearance and Nautilus integration outside the
Shell runtime where their lifecycle belongs to another process.

## Validation

Run at least:

```bash
./tests/check.sh
node --test tests/*.test.mjs
bash -n scripts/*.sh tests/*.sh
glib-compile-schemas --strict --dry-run schemas
```

Automated checks are not GNOME runtime evidence. Changes that touch the Shell
must also be tested in a disposable GNOME 46 session: install locally, sign out
and in on Wayland, exercise repeated enable/disable cycles, and inspect the user
journal. Record X11 differences when X11 is feasible.

## Safety and review

- Install only below user-owned XDG paths; never write to `/usr` or require root.
- Do not destroy another extension's actors or leave it disabled after rollback.
- Keep original or redistributable artwork with its license notice.
- Do not include generated schemas, logs, backups or local diagnostic files.
- Do not commit, tag, publish or declare a stable release without explicit
  authorization and the required runtime evidence.

Describe changed files, tests, evidence, limitations, rollback and remaining
manual validation in the review handoff.
