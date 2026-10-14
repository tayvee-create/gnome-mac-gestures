# Gnome Mac Gestures

Mac-style trackpad gestures for GNOME, switched on with one toggle.

Made for anyone moving from a Mac to Linux whose fingers still expect a MacBook trackpad.

## What it does

Turn on **Mac Gestures** in Quick Settings (the top-right menu) and you get:

| Gesture | What happens |
|---|---|
| One-finger tap | Click |
| Two-finger click or tap | Right-click |
| Two-finger drag | Scroll, in the natural (Mac) direction |
| Pinch thumb and three fingers together | App grid, like Launchpad |
| Spread thumb and three fingers apart | Show desktop; spread again to bring windows back |

Turning it off puts your previous touchpad settings back.

These already work in GNOME, so you don't need this extension for them:

- Three- or four-finger swipe up: overview, like Mission Control
- Three- or four-finger swipe left or right: switch workspaces

Pinch to zoom, rotate, and two-finger swipe back/forward work only in apps that support them, such as Firefox.

Not available yet: App Exposé, the Notification Center edge swipe, smart zoom, three-finger tap to look up, three-finger drag, and Force Click.

## Install

Download the latest `.deb` from [Releases](https://github.com/tayvee-create/gnome-mac-gestures/releases) and install it:

```sh
sudo apt install ./gnome-mac-gestures_1.0.0_all.deb
```

Log out and back in, then turn on **Mac Gestures** in Quick Settings. You can also open **Gnome Mac Gestures** from the app grid to see the full list of gestures.

Requires GNOME 48, 49 or 50 (tested on Ubuntu 26.04 with GNOME 50).

## Build from source

```sh
./build-deb.sh
```

The package is written to `dist/`.

## Licence

GPL-2.0-or-later. See [LICENSE](LICENSE).

Mac is a trademark of Apple Inc. This project isn't affiliated with or endorsed by Apple.
