import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const BUILT_IN = 'Built into GNOME';
const ADDED = 'Added by Mac Gestures';
const IN_APPS = 'Supported apps only';
const UNAVAILABLE = 'Not available';

const GESTURES = [
    ['Tap to click', 'One-finger tap', ADDED],
    ['Secondary click', 'Two-finger click or tap', ADDED],
    ['Scroll', 'Two-finger drag, natural direction', ADDED],
    ['Zoom in or out', 'Two-finger pinch', IN_APPS],
    ['Smart zoom', 'Two-finger double-tap', UNAVAILABLE],
    ['Rotate', 'Two-finger rotate', IN_APPS],
    ['Back and forward', 'Two-finger swipe left or right', IN_APPS],
    ['Notification Center', 'Two-finger swipe in from the right edge', UNAVAILABLE],
    ['Look up', 'Three-finger tap (middle click on Linux)', UNAVAILABLE],
    ['Mission Control', 'Three- or four-finger swipe up', BUILT_IN],
    ['App Exposé', 'Three- or four-finger swipe down', UNAVAILABLE],
    ['Switch desktops', 'Three- or four-finger swipe left or right', BUILT_IN],
    ['Launchpad', 'Pinch thumb and three fingers together', ADDED],
    ['Show desktop', 'Spread thumb and three fingers apart', ADDED],
    ['Three-finger drag', 'Drag with three fingers', UNAVAILABLE],
    ['Force click', 'Press harder', UNAVAILABLE],
];

export default class MacGesturesPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        const page = new Adw.PreferencesPage();

        const toggleGroup = new Adw.PreferencesGroup({
            description: 'Turns on tap to click, two-finger right-click, natural scrolling and Mac-style multi-finger gestures. Your previous touchpad settings come back when you turn it off.',
        });
        const toggle = new Adw.SwitchRow({title: 'Enable mac gestures'});
        settings.bind('enabled', toggle, 'active', Gio.SettingsBindFlags.DEFAULT);
        toggleGroup.add(toggle);
        page.add(toggleGroup);

        const gestureGroup = new Adw.PreferencesGroup({title: 'Gestures'});
        for (const [title, subtitle, status] of GESTURES) {
            const row = new Adw.ActionRow({title, subtitle});
            row.add_suffix(new Gtk.Label({
                label: status,
                css_classes: status === UNAVAILABLE ? ['dim-label'] : [],
            }));
            gestureGroup.add(row);
        }
        page.add(gestureGroup);

        window.add(page);
    }
}
