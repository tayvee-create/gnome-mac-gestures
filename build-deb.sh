#!/bin/sh
# Builds dist/gnome-mac-gestures_<version>_all.deb.
set -eu
cd "$(dirname "$0")"

UUID=gnome-mac-gestures@tayvee-create.github.io
VERSION=$(sed -n 's/^Version: //p' debian/control)
ROOT=build/root
EXT=$ROOT/usr/share/gnome-shell/extensions/$UUID

rm -rf build
mkdir -p "$EXT/schemas" "$ROOT/DEBIAN" "$ROOT/usr/bin" "$ROOT/usr/share/applications" "$ROOT/usr/share/glib-2.0/schemas" dist

install -m 644 src/metadata.json src/extension.js src/prefs.js "$EXT/"
install -m 644 src/schemas/*.gschema.xml "$EXT/schemas/"
glib-compile-schemas --strict "$EXT/schemas"
chmod -R u=rwX,go=rX "$ROOT"

install -m 755 gnome-mac-gestures-settings "$ROOT/usr/bin/"
install -m 644 gnome-mac-gestures.desktop "$ROOT/usr/share/applications/"
install -m 644 90_gnome-mac-gestures.gschema.override "$ROOT/usr/share/glib-2.0/schemas/"
install -m 644 debian/control "$ROOT/DEBIAN/"
install -m 755 debian/postinst "$ROOT/DEBIAN/"

dpkg-deb --root-owner-group --build "$ROOT" "dist/gnome-mac-gestures_${VERSION}_all.deb"
