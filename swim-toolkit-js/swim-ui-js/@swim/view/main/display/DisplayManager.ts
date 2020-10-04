// Copyright 2015-2020 Swim inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {ViewFlags, View} from "../View";
import {ViewManager} from "../manager/ViewManager";
import {DisplayContext} from "./DisplayContext";
import {DisplayManagerObserver} from "./DisplayManagerObserver";

export class DisplayManager<V extends View = View> extends ViewManager<V> {
  /** @hidden */
  _rootFlags: ViewFlags;
  /** @hidden */
  _processTimer: number;
  /** @hidden */
  _displayFrame: number;
  /** @hidden */
  _updateDelay: number;

  constructor() {
    super();
    this.runProcessPass = this.runProcessPass.bind(this);
    this.runDisplayPass = this.runDisplayPass.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);

    this._rootFlags = 0;
    this._processTimer = 0;
    this._displayFrame = 0;
    this._updateDelay = DisplayManager.MinUpdateDelay;
  }

  get powerFlags(): ViewFlags {
    return View.NeedsResize | View.NeedsScroll;
  }

  protected onPower(): void {
    this.powerRootViews();
  }

  protected powerRootViews(): void {
    const rootViews = this._rootViews;
    for (let i = 0, n = rootViews.length; i < n; i += 1) {
      const rootView = rootViews[i];
      if (!rootView.isPowered()) {
        this.powerRootView(rootView);
      }
    }
  }

  protected powerRootView(rootView: V): void {
    rootView.cascadePower();
    rootView.requireUpdate(this.powerFlags);
  }

  protected onUnpower(): void {
    this.cancelUpdate();
    this._updateDelay = DisplayManager.MinUpdateDelay;
    this.unpowerRootViews();
  }

  protected unpowerRootViews(): void {
    const rootViews = this._rootViews;
    for (let i = 0, n = rootViews.length; i < n; i += 1) {
      const rootView = rootViews[i];
      if (rootView.isPowered()) {
        this.unpowerRootView(rootView);
      }
    }
  }

  protected unpowerRootView(rootView: V): void {
    rootView.cascadeUnpower();
  }

  get rootFlags(): ViewFlags {
    return this._rootFlags;
  }

  requestUpdate(targetView: View, updateFlags: ViewFlags, immediate: boolean): void {
    updateFlags = this.willRequestUpdate(targetView, updateFlags, immediate) & View.UpdateMask;
    this._rootFlags |= updateFlags;
    if ((this._rootFlags & View.UpdateMask) !== 0) {
      if (immediate && this._updateDelay <= DisplayManager.MaxProcessInterval
          && (this._rootFlags & (View.TraversingFlag | View.ImmediateFlag)) === 0) {
        this.runImmediatePass();
      } else {
        this.scheduleUpdate();
      }
    }
    this.didRequestUpdate(targetView, updateFlags, immediate);
  }

  protected willRequestUpdate(targetView: View, updateFlags: ViewFlags, immediate: boolean): ViewFlags {
    return updateFlags | this.modifyUpdate(targetView, updateFlags);
  }

  protected didRequestUpdate(targetView: View, updateFlags: ViewFlags, immediate: boolean): void {
    // hook
  }

  protected modifyUpdate(targetView: View, updateFlags: ViewFlags): ViewFlags {
    let additionalFlags = 0;
    if ((updateFlags & View.ProcessMask) !== 0) {
      additionalFlags |= View.NeedsProcess;
    }
    if ((updateFlags & View.DisplayMask) !== 0) {
      additionalFlags |= View.NeedsDisplay;
    }
    return additionalFlags;
  }

  protected scheduleUpdate(): void {
    const rootFlags = this._rootFlags;
    if (this._processTimer === 0 && this._displayFrame === 0
        && (rootFlags & View.UpdatingMask) === 0
        && (rootFlags & View.UpdateMask) !== 0) {
      this._processTimer = setTimeout(this.runProcessPass, this._updateDelay) as any;
    }
  }

  protected cancelUpdate(): void {
    if (this._processTimer !== 0) {
      clearTimeout(this._processTimer);
      this._processTimer = 0;
    }
    if (this._displayFrame !== 0) {
      cancelAnimationFrame(this._displayFrame);
      this._displayFrame = 0;
    }
  }

  protected runImmediatePass(): void {
    this._rootFlags |= View.ImmediateFlag;
    try {
      if ((this._rootFlags & View.ProcessMask) !== 0) {
        this.cancelUpdate();
        this.runProcessPass(true);
      }
      if ((this._rootFlags & View.DisplayMask) !== 0
          && this._updateDelay <= DisplayManager.MaxProcessInterval) {
        this.cancelUpdate();
        this.runDisplayPass(void 0, true);
      }
    } finally {
      this._rootFlags &= ~View.ImmediateFlag;
    }
  }

  protected runProcessPass(immediate: boolean = false): void {
    const rootViews = this._rootViews;
    this._rootFlags |= View.TraversingFlag | View.ProcessingFlag;
    this._rootFlags &= ~View.ProcessMask;
    try {
      const t0 = performance.now();
      for (let i = 0; i < rootViews.length; i += 1) {
        const rootView = rootViews[i];
        if ((rootView.viewFlags & View.ProcessMask) !== 0) {
          const viewContext = rootView.viewContext as DisplayContext;
          viewContext.updateTime = t0;
          rootView.cascadeProcess(0, viewContext);
        }
      }

      const t1 = performance.now();
      let processDelay = Math.max(DisplayManager.MinProcessInterval, this._updateDelay);
      if (t1 - t0 > processDelay) {
        this._updateDelay = Math.min(Math.max(2, this._updateDelay * 2), DisplayManager.MaxUpdateDelay);
      } else {
        this._updateDelay = Math.min(DisplayManager.MinUpdateDelay, this._updateDelay / 2);
      }

      this.cancelUpdate();
      if ((this._rootFlags & View.DisplayMask) !== 0) {
        this._displayFrame = requestAnimationFrame(this.runDisplayPass);
      } else if ((this._rootFlags & View.ProcessMask) !== 0) {
        if (immediate) {
          processDelay = Math.max(DisplayManager.MaxProcessInterval, processDelay);
        }
        this._processTimer = setTimeout(this.runProcessPass, processDelay) as any;
      }
    } finally {
      this._rootFlags &= ~(View.TraversingFlag | View.ProcessingFlag);
    }
  }

  protected runDisplayPass(time?: number, immediate: boolean = false): void {
    const rootViews = this._rootViews;
    this._rootFlags |= View.TraversingFlag | View.DisplayingFlag;
    this._rootFlags &= ~View.DisplayMask;
    try {
      if (time === void 0) {
        time = performance.now();
      }
      for (let i = 0; i < rootViews.length; i += 1) {
        const rootView = rootViews[i];
        if ((rootView.viewFlags & View.DisplayMask) !== 0) {
          const viewContext = rootView.viewContext as DisplayContext;
          viewContext.updateTime = time;
          rootView.cascadeDisplay(0, viewContext);
        }
      }

      this.cancelUpdate();
      if ((this._rootFlags & View.ProcessMask) !== 0) {
        let processDelay = this._updateDelay;
        if (immediate) {
          processDelay = Math.max(DisplayManager.MaxProcessInterval, processDelay);
        }
        this._processTimer = setTimeout(this.runProcessPass, processDelay) as any;
      } else if ((this._rootFlags & View.DisplayMask) !== 0) {
        this._displayFrame = requestAnimationFrame(this.runDisplayPass);
      }
    } finally {
      this._rootFlags &= ~(View.TraversingFlag | View.DisplayingFlag);
    }
  }

  // @ts-ignore
  declare readonly viewManagerObservers: ReadonlyArray<DisplayManagerObserver>;

  protected onAttach(): void {
    super.onAttach();
    this.attachEvents();
  }

  protected onDetach(): void {
    this.detachEvents();
    super.onDetach();
  }

  protected attachEvents(): void {
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this.onVisibilityChange);
    }
  }

  protected detachEvents(): void {
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.onVisibilityChange);
    }
  }

  protected onInsertRootView(rootView: V): void {
    super.onInsertRootView(rootView);
    this.requestUpdate(rootView, rootView.viewFlags & View.UpdateMask, false);
  }

  /** @hidden */
  protected onVisibilityChange(): void {
    if (document.visibilityState === "visible") {
      this.onPower();
    } else {
      this.onUnpower();
    }
  }

  private static _global?: DisplayManager<any>;
  static global<V extends View>(): DisplayManager<V> {
    if (DisplayManager._global === void 0) {
      DisplayManager._global = new DisplayManager();
    }
    return DisplayManager._global;
  }

  /** @hidden */
  static MinUpdateDelay: number = 0;
  /** @hidden */
  static MaxUpdateDelay: number = 167;
  /** @hidden */
  static MinProcessInterval: number = 12;
  /** @hidden */
  static MaxProcessInterval: number = 33;
}
ViewManager.Display = DisplayManager;
