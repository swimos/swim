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

import {Mutable, Class, Lazy, Service} from "@swim/util";
import type {DisplayServiceObserver} from "./DisplayServiceObserver";
import type {ViewContext} from "../view/ViewContext";
import {ViewFlags, View} from "../"; // forward import

/** @public */
export class DisplayService<V extends View = View> extends Service<V> {
  constructor() {
    super();
    this.flags = 0;
    this.updateDelay = DisplayService.MinUpdateDelay;
    this.processTimer = 0;
    this.displayFrame = 0;

    this.runProcessPass = this.runProcessPass.bind(this);
    this.runDisplayPass = this.runDisplayPass.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
  }

  override readonly observerType?: Class<DisplayServiceObserver<V>>;

  /** @internal */
  readonly flags: ViewFlags;

  /** @internal */
  setFlags(flags: ViewFlags): void {
    (this as Mutable<this>).flags = flags;
  }

  updatedViewContext(viewContext: ViewContext): ViewContext {
    (viewContext as Mutable<ViewContext>).updateTime = performance.now();
    return viewContext;
  }

  /** @internal */
  updateDelay: number;

  protected needsUpdate(updateFlags: ViewFlags, immediate: boolean): ViewFlags {
    return updateFlags;
  }

  requestUpdate(targetView: View, updateFlags: ViewFlags, immediate: boolean): void {
    updateFlags = this.needsUpdate(updateFlags, immediate);
    let deltaUpdateFlags = this.flags & ~updateFlags & View.UpdateMask;
    if ((updateFlags & View.ProcessMask) !== 0) {
      deltaUpdateFlags |= View.NeedsProcess;
    }
    if ((updateFlags & View.DisplayMask) !== 0) {
      deltaUpdateFlags |= View.NeedsDisplay;
    }
    this.setFlags(this.flags | deltaUpdateFlags);
    if (immediate && (this.flags & (View.ProcessingFlag | View.DisplayingFlag)) === 0 && this.updateDelay <= DisplayService.MaxProcessInterval) {
      this.runImmediatePass();
    } else {
      this.scheduleUpdate();
    }
  }

  protected scheduleUpdate(): void {
    const flags = this.flags;
    if ((flags & View.ProcessingFlag) === 0 && (flags & View.ProcessMask) !== 0) {
      this.scheduleProcessPass(this.updateDelay);
    } else if ((flags & View.DisplayingFlag) === 0 && (flags & View.DisplayMask) !== 0) {
      this.scheduleDisplayPass();
    }
  }

  protected cancelUpdate(): void {
    this.cancelProcessPass();
    this.cancelDisplayPass();
  }

  protected runImmediatePass(): void {
    if ((this.flags & View.ProcessMask) !== 0) {
      this.cancelUpdate();
      this.runProcessPass(true);
    }
    if ((this.flags & View.DisplayMask) !== 0 && this.updateDelay <= DisplayService.MaxProcessInterval) {
      this.cancelUpdate();
      this.runDisplayPass(void 0, true);
    }
  }

  /** @internal */
  processTimer: number;

  protected scheduleProcessPass(updateDelay: number): void {
    if (this.processTimer === 0) {
      this.processTimer = setTimeout(this.runProcessPass, updateDelay) as any;
    }
  }

  protected cancelProcessPass(): void {
    if (this.processTimer !== 0) {
      clearTimeout(this.processTimer);
      this.processTimer = 0;
    }
  }

  protected runProcessPass(immediate: boolean = false): void {
    this.setFlags(this.flags & ~View.ProcessMask | View.ProcessingFlag);
    try {
      const t0 = performance.now();
      const roots = this.roots;
      for (let i = 0; i < roots.length; i += 1) {
        const root = roots[i]!;
        if ((root.flags & View.ProcessMask) !== 0) {
          const viewContext = root.viewportProvider.viewContext;
          (viewContext as Mutable<ViewContext>).updateTime = t0;
          root.cascadeProcess(0, viewContext);
        }
      }

      const t1 = performance.now();
      let processDelay = Math.max(DisplayService.MinProcessInterval, this.updateDelay);
      if (t1 - t0 > processDelay) {
        this.updateDelay = Math.min(Math.max(2, this.updateDelay * 2), DisplayService.MaxUpdateDelay);
      } else {
        this.updateDelay = Math.min(DisplayService.MinUpdateDelay, this.updateDelay / 2);
      }

      this.cancelProcessPass();
      if ((this.flags & View.DisplayMask) !== 0) {
        this.scheduleDisplayPass();
      } else if ((this.flags & View.ProcessMask) !== 0) {
        if (immediate) {
          processDelay = Math.max(DisplayService.MaxProcessInterval, processDelay);
        }
        this.cancelDisplayPass();
        this.scheduleProcessPass(processDelay);
      }
    } finally {
      this.setFlags(this.flags & ~View.ProcessingFlag);
    }
  }

  /** @internal */
  displayFrame: number;

  protected scheduleDisplayPass(): void {
    if (this.displayFrame === 0) {
      this.displayFrame = requestAnimationFrame(this.runDisplayPass);
    }
  }

  protected cancelDisplayPass(): void {
    if (this.displayFrame !== 0) {
      cancelAnimationFrame(this.displayFrame);
      this.displayFrame = 0;
    }
  }

  protected runDisplayPass(time?: number, immediate: boolean = false): void {
    this.setFlags(this.flags & ~View.DisplayMask | View.DisplayingFlag);
    try {
      if (time === void 0) {
        time = performance.now();
      }
      const roots = this.roots;
      for (let i = 0; i < roots.length; i += 1) {
        const root = roots[i]!;
        if ((root.flags & View.DisplayMask) !== 0) {
          const viewContext = root.viewportProvider.viewContext;
          (viewContext as Mutable<ViewContext>).updateTime = time;
          root.cascadeDisplay(0, viewContext);
        }
      }

      this.cancelDisplayPass();
      if ((this.flags & View.ProcessMask) !== 0) {
        let processDelay = this.updateDelay;
        if (immediate) {
          processDelay = Math.max(DisplayService.MaxProcessInterval, processDelay);
        }
        this.scheduleProcessPass(processDelay);
      } else if ((this.flags & View.DisplayMask) !== 0) {
        this.cancelProcessPass();
        this.scheduleDisplayPass();
      }
    } finally {
      this.setFlags(this.flags & ~View.DisplayingFlag);
    }
  }

  get powerFlags(): ViewFlags {
    return View.NeedsResize | View.NeedsScroll;
  }

  power(): void {
    const roots = this.roots;
    for (let i = 0, n = roots.length; i < n; i += 1) {
      const root = roots[i]!;
      root.requireUpdate(this.powerFlags);
    }
  }

  unpower(): void {
    this.cancelUpdate();
    this.updateDelay = DisplayService.MinUpdateDelay;
  }

  protected override onAttachRoot(root: V): void {
    super.onAttachRoot(root);
    this.requestUpdate(root, root.flags & View.UpdateMask, false);
  }

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

  /** @internal */
  protected onVisibilityChange(): void {
    if (document.visibilityState === "visible") {
      this.power();
    } else {
      this.unpower();
    }
  }

  /** @internal */
  static MinUpdateDelay: number = 0;
  /** @internal */
  static MaxUpdateDelay: number = 167;
  /** @internal */
  static MinProcessInterval: number = 12;
  /** @internal */
  static MaxProcessInterval: number = 33;

  @Lazy
  static global<V extends View>(): DisplayService<V> {
    return new DisplayService();
  }
}
