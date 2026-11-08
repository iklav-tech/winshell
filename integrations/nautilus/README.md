# Nautilus integration

The optional `winshell-nautilus.py` plugin uses the supported
`Nautilus.MenuProvider` API and runs in Nautilus' extension process, never in
GNOME Shell. It adds an entry that opens appearance management. Folder and file
icons come from the selected `WinShell Icons` theme through the standard icon
theme mechanism.

Install with `./scripts/install.sh --with-nautilus`. This requires the
distribution's `python3-nautilus` package and a Nautilus restart. No Nautilus
source, private Libadwaita widgets or system library is patched.
