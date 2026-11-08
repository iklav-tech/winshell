# Desktop icon integration

WinShell integrates with Desktop Icons NG (DING) through its public GSettings
schema. It never draws desktop icons itself and never disables another desktop
provider. The preferences page reports provider availability and only changes
Home, Trash and mounted-volume visibility after the user applies appearance.

Supported schema: `org.gnome.shell.extensions.ding`. Provider-specific context
menus, drag-and-drop and shortcut behavior remain owned by DING.
