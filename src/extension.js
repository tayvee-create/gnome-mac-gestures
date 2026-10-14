import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as QuickSettings from 'resource:///org/gnome/shell/ui/quickSettings.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

const TOUCHPAD_SCHEMA = 'org.gnome.desktop.peripherals.touchpad';

// Mac trackpad defaults, applied while "Enable mac gestures" is on.
const MAC_TOUCHPAD = {
    'tap-to-click': new GLib.Variant('b', true),
    'natural-scroll': new GLib.Variant('b', true),
    'two-finger-scrolling-enabled': new GLib.Variant('b', true),
    'edge-scrolling-enabled': new GLib.Variant('b', false),
    'click-method': new GLib.Variant('s', 'fingers'),
    'tap-button-map': new GLib.Variant('s', 'lrm'),
};

// Thumb + three fingers.
const PINCH_FINGERS = 4;
const PINCH_IN_SCALE = 0.8;
const PINCH_OUT_SCALE = 1.25;

const GESTURE_MODES = Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW;

const MacGesturesToggle = GObject.registerClass(
class MacGesturesToggle extends QuickSettings.QuickToggle {
    _init(settings) {
        super._init({
            title: 'Mac Gestures',
            iconName: 'input-touchpad-symbolic',
            toggleMode: true,
        });
        settings.bind('enabled', this, 'checked', Gio.SettingsBindFlags.DEFAULT);
    }
});

const MacGesturesIndicator = GObject.registerClass(
class MacGesturesIndicator extends QuickSettings.SystemIndicator {
    _init(settings) {
        super._init();
        this.quickSettingsItems.push(new MacGesturesToggle(settings));
    }

    destroy() {
        this.quickSettingsItems.forEach(item => item.destroy());
        super.destroy();
    }
});

export default class MacGesturesExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._touchpad = new Gio.Settings({schema_id: TOUCHPAD_SCHEMA});
        this._pinchScale = 1;
        this._hiddenWindows = null;

        this._indicator = new MacGesturesIndicator(this._settings);
        Main.panel.statusArea.quickSettings.addExternalIndicator(this._indicator);

        this._settings.connectObject('changed::enabled',
            () => this._syncTouchpad(), this);
        this._syncTouchpad();

        global.stage.connectObject('captured-event',
            this._onCapturedEvent.bind(this), this);
    }

    disable() {
        // Touchpad settings are left as they are: disable() also runs when
        // the screen locks, and only the toggle should restore them.
        global.stage.disconnectObject(this);
        this._settings.disconnectObject(this);
        this._indicator.destroy();
        this._indicator = null;
        this._settings = null;
        this._touchpad = null;
        this._hiddenWindows = null;
    }

    _syncTouchpad() {
        const saved = this._settings.get_value('saved-touchpad');
        const enabled = this._settings.get_boolean('enabled');

        if (enabled && saved.n_children() === 0) {
            const previous = {};
            for (const [key, value] of Object.entries(MAC_TOUCHPAD)) {
                previous[key] = this._touchpad.get_value(key);
                this._touchpad.set_value(key, value);
            }
            this._settings.set_value('saved-touchpad',
                new GLib.Variant('a{sv}', previous));
        } else if (!enabled && saved.n_children() > 0) {
            for (const [key, value] of Object.entries(saved.deepUnpack()))
                this._touchpad.set_value(key, value);
            this._settings.reset('saved-touchpad');
        }
    }

    _onCapturedEvent(actor, event) {
        if (event.type() !== Clutter.EventType.TOUCHPAD_PINCH)
            return Clutter.EVENT_PROPAGATE;
        if (!this._settings.get_boolean('enabled'))
            return Clutter.EVENT_PROPAGATE;
        if (event.get_touchpad_gesture_finger_count() < PINCH_FINGERS)
            return Clutter.EVENT_PROPAGATE;
        if ((Main.actionMode & GESTURE_MODES) === 0)
            return Clutter.EVENT_PROPAGATE;

        switch (event.get_gesture_phase()) {
        case Clutter.TouchpadGesturePhase.BEGIN:
            this._pinchScale = 1;
            break;
        case Clutter.TouchpadGesturePhase.UPDATE:
            this._pinchScale = event.get_gesture_pinch_scale();
            break;
        case Clutter.TouchpadGesturePhase.END:
            if (this._pinchScale < PINCH_IN_SCALE)
                this._pinchIn();
            else if (this._pinchScale > PINCH_OUT_SCALE)
                this._spread();
            break;
        }

        return Clutter.EVENT_STOP;
    }

    // Like Launchpad: pinch thumb and three fingers together for the app grid.
    _pinchIn() {
        if (!Main.overview.dash.showAppsButton.checked || !Main.overview.visible)
            Main.overview.showApps();
    }

    // Spread closes the app grid or overview, otherwise toggles show desktop.
    _spread() {
        if (Main.overview.visible) {
            Main.overview.hide();
            return;
        }

        const hidden = this._hiddenWindows?.filter(w => w.get_compositor_private());
        this._hiddenWindows = null;
        if (hidden?.length && hidden.every(w => w.minimized)) {
            for (const window of hidden.reverse())
                window.unminimize();
            hidden.at(-1).activate(global.get_current_time());
            return;
        }

        const workspace = global.workspace_manager.get_active_workspace();
        const windows = global.display.get_tab_list(Meta.TabList.NORMAL, workspace)
            .filter(w => !w.minimized && w.can_minimize());
        windows.forEach(w => w.minimize());
        this._hiddenWindows = windows;
    }
}
