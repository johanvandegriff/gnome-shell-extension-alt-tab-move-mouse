// Copyright (C) 2021  Taiki Sugawara

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import Clutter from 'gi://Clutter'
import Mtk from 'gi://Mtk'
import Meta from 'gi://Meta';

import {
  Extension,
  InjectionManager,
} from "resource:///org/gnome/shell/extensions/extension.js";


export default class AltTabMoveMouseExtension extends Extension {
  enable() {
    this._injectionManager = new InjectionManager();
    const seat = Clutter.get_default_backend().get_default_seat();
    this.vdevice = seat.create_virtual_device(
      Clutter.InputDeviceType.POINTER_DEVICE
    );

    this._injectionManager.overrideMethod(
      Meta.Window.prototype,
      "activate",
      (originalMethod) => {
        let that = this;
        return function (...args) {
          that.movePointerMaybe(this);
          originalMethod.call(this, ...args);
        };
      }
    );
  }

  disable() {
      this._injectionManager.clear();
      this._injectionManager = null;
      this.vdevice = null;
  }

  movePointerMaybe(window) {
    if (!this.pointerAlreadyOnWindow(window)) {
      const rect = window.get_frame_rect();
      const x = rect.x + rect.width / 2;
      const y = rect.y + rect.height / 2;

      this.vdevice.notify_absolute_motion(global.get_current_time(), x, y);
    }
  }

  pointerAlreadyOnWindow(window) {
    const [x, y] = global.get_pointer();
    const rect = new Mtk.Rectangle({ x, y, width: 1, height: 1 });
    return rect.intersect(window.get_frame_rect())[0];
  }
}
