// Copyright 2015-2021 Swim Inc.
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

import {Lazy} from "@swim/util";
import type {ViewContext} from "../ViewContext";
import {ViewFlags, View} from "../View";
import {ViewManager} from "../manager/ViewManager";
import type {DisplayContext} from "./DisplayContext";
import type {DisplayManagerObserver} from "./DisplayManagerObserver";

export class DisplayManager<V extends View = View> extends ViewManager<V> {
  constructor() {
    super();
    Object.defineProperty(this, "rootFlags", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
    this.processTimer = 0;
    this.displayFrame = 0;
    this.updateDelay = DisplayManager.MinUpdateDelay;

    this.runProcessPass = this.runProcessPass.bind(this);
    this.runDisplayPass = this.runDisplayPass.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
  }

  updatedViewContext(viewContext: ViewContext): ViewContext {
    (viewContext as DisplayContext).updateTime = performance.now();
    return viewContext;
  }

  get powerFlags(): ViewFlags {
    return View.NeedsResize | View.NeedsScroll;
  }

  protected onPower(): void {
    this.powerRootViews();
  }

  protected powerRootViews(): void {
    const rootViews = this.rootViews;
    for (let i = 0, n = rootViews.length; i < n; i += 1) {
      const rootView = rootViews[i]!;
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
    this.updateDelay = DisplayManager.MinUpdateDelay;
    this.unpowerRootViews();
  }

  protected unpowerRootViews(): void {
    const rootViews = this.rootViews;
    for (let i = 0, n = rootViews.length; i < n; i += 1) {
      const rootView = rootViews[i]!;
      if (rootView.isPowered()) {
        this.unpowerRootView(rootView);
      }
    }
  }

  protected unpowerRootView(rootView: V): void {
    rootView.cascadeUnpower();
  }

  readonly rootFlags!: ViewFlags;

  /** @hidden */
  setRootFlags(rootFlags: ViewFlags): void {
    Object.defineProperty(this, "rootFlags", {
      value: rootFlags,
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
  processTimer: number;

  /** @hidden */
  displayFrame: number;

  /** @hidden */
  updateDelay: number;

  protected needsUpdate(updateFlags: ViewFlags, immediate: boolean): ViewFlags {
    return updateFlags;
  }

  requestUpdate(targetView: View, updateFlags: ViewFlags, immediate: boolean): void {
    updateFlags = this.needsUpdate(updateFlags, immediate);
    let deltaUpdateFlags = this.rootFlags & ~updateFlags & View.UpdateMask;
    if ((updateFlags & View.ProcessMask) !== 0) {
      deltaUpdateFlags |= View.NeedsProcess;
    }
    if ((updateFlags & View.DisplayMask) !== 0) {
      deltaUpdateFlags |= View.NeedsDisplay;
    }
    if (deltaUpdateFlags !== 0 || immediate) {
      this.setRootFlags(this.rootFlags | deltaUpdateFlags);
      if (immediate && this.updateDelay <= DisplayManager.MaxProcessInterval
          && (this.rootFlags & (View.TraversingFlag | View.ImmediateFlag)) === 0) {
        this.runImmediatePass();
      } else {
        this.scheduleUpdate();
      }
    }
  }

  protected scheduleUpdate(): void {
    const rootFlags = this.rootFlags;
    if (this.processTimer === 0 && this.displayFrame === 0
        && (rootFlags & View.UpdatingMask) === 0
        && (rootFlags & View.UpdateMask) !== 0) {
      this.processTimer = setTimeout(this.runProcessPass, this.updateDelay) as any;
    }
  }

  protected cancelUpdate(): void {
    if (this.processTimer !== 0) {
      clearTimeout(this.processTimer);
      this.processTimer = 0;
    }
    if (this.displayFrame !== 0) {
      cancelAnimationFrame(this.displayFrame);
      this.displayFrame = 0;
    }
  }

  protected runImmediatePass(): void {
    this.setRootFlags(this.rootFlags | View.ImmediateFlag);
    try {
      if ((this.rootFlags & View.ProcessMask) !== 0) {
        this.cancelUpdate();
        this.runProcessPass(true);
      }
      if ((this.rootFlags & View.DisplayMask) !== 0
          && this.updateDelay <= DisplayManager.MaxProcessInterval) {
        this.cancelUpdate();
        this.runDisplayPass(void 0, true);
      }
    } finally {
      this.setRootFlags(this.rootFlags & ~View.ImmediateFlag);
    }
  }

  protected runProcessPass(immediate: boolean = false): void {
    this.setRootFlags(this.rootFlags & ~View.ProcessMask | (View.TraversingFlag | View.ProcessingFlag));
    try {
      const t0 = performance.now();
      const rootViews = this.rootViews;
      for (let i = 0; i < rootViews.length; i += 1) {
        const rootView = rootViews[i]!;
        if ((rootView.viewFlags & View.ProcessMask) !== 0) {
          const viewContext = rootView.viewportService.viewContext as DisplayContext;
          viewContext.updateTime = t0;
          rootView.cascadeProcess(0, viewContext);
        }
      }

      const t1 = performance.now();
      let processDelay = Math.max(DisplayManager.MinProcessInterval, this.updateDelay);
      if (t1 - t0 > processDelay) {
        this.updateDelay = Math.min(Math.max(2, this.updateDelay * 2), DisplayManager.MaxUpdateDelay);
      } else {
        this.updateDelay = Math.min(DisplayManager.MinUpdateDelay, this.updateDelay / 2);
      }

      this.cancelUpdate();
      if ((this.rootFlags & View.DisplayMask) !== 0) {
        this.displayFrame = requestAnimationFrame(this.runDisplayPass);
      } else if ((this.rootFlags & View.ProcessMask) !== 0) {
        if (immediate) {
          processDelay = Math.max(DisplayManager.MaxProcessInterval, processDelay);
        }
        this.processTimer = setTimeout(this.runProcessPass, processDelay) as any;
      }
    } finally {
      this.setRootFlags(this.rootFlags & ~(View.TraversingFlag | View.ProcessingFlag));
    }
  }

  protected runDisplayPass(time?: number, immediate: boolean = false): void {
    this.setRootFlags(this.rootFlags & ~View.DisplayMask | (View.TraversingFlag | View.DisplayingFlag));
    try {
      if (time === void 0) {
        time = performance.now();
      }
      const rootViews = this.rootViews;
      for (let i = 0; i < rootViews.length; i += 1) {
        const rootView = rootViews[i]!;
        if ((rootView.viewFlags & View.DisplayMask) !== 0) {
          const viewContext = rootView.viewportService.viewContext as DisplayContext;
          viewContext.updateTime = time;
          rootView.cascadeDisplay(0, viewContext);
        }
      }

      this.cancelUpdate();
      if ((this.rootFlags & View.ProcessMask) !== 0) {
        let processDelay = this.updateDelay;
        if (immediate) {
          processDelay = Math.max(DisplayManager.MaxProcessInterval, processDelay);
        }
        this.processTimer = setTimeout(this.runProcessPass, processDelay) as any;
      } else if ((this.rootFlags & View.DisplayMask) !== 0) {
        this.displayFrame = requestAnimationFrame(this.runDisplayPass);
      }
    } finally {
      this.setRootFlags(this.rootFlags & ~(View.TraversingFlag | View.DisplayingFlag));
    }
  }

  override readonly viewManagerObservers!: ReadonlyArray<DisplayManagerObserver>;

  protected override onAttach(): void {
    super.onAttach();
    this.attachEvents();
  }

  protected override onDetach(): void {
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

  protected override onInsertRootView(rootView: V): void {
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

  /** @hidden */
  static MinUpdateDelay: number = 0;
  /** @hidden */
  static MaxUpdateDelay: number = 167;
  /** @hidden */
  static MinProcessInterval: number = 12;
  /** @hidden */
  static MaxProcessInterval: number = 33;

  @Lazy
  static global<V extends View>(): DisplayManager<V> {
    return new DisplayManager();
  }
}
