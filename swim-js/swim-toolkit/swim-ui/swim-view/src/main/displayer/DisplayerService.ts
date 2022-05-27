// Copyright 2015-2022 Swim.inc
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

import type {Mutable, Class, Observes} from "@swim/util";
import {Affinity, FastenerClass, EventHandler, Provider, Service} from "@swim/component";
import type {ViewIdiom} from "../view/ViewIdiom";
import type {ViewInsets} from "../view/ViewInsets";
import {ViewFlags, View} from "../view/View";
import {ViewSet} from "../view/ViewSet";
import type {LayoutViewport} from "../viewport/LayoutViewport";
import type {VisualViewport} from "../viewport/VisualViewport";
import type {ViewportOrientation} from "../viewport/ViewportOrientation";
import {ViewportService} from "../viewport/ViewportService";
import type {DisplayerServiceObserver} from "./DisplayerServiceObserver";

/** @public */
export class DisplayerService extends Service {
  constructor() {
    super();
    this.updateFlags = 0;
    this.updateTime = performance.now();
    this.updateDelay = DisplayerService.MinUpdateDelay;
    this.processTimer = 0;
    this.displayFrame = 0;

    this.runProcessPass = this.runProcessPass.bind(this);
    this.runDisplayPass = this.runDisplayPass.bind(this);
  }

  override readonly observerType?: Class<DisplayerServiceObserver>;

  @ViewSet<DisplayerService["roots"]>({
    initView(rootView: View): void {
      this.owner.requestUpdate(rootView, rootView.flags & View.UpdateMask, false);
      const safeArea = this.owner.viewport.getService().safeArea.value;
      rootView.edgeInsets.setValue(safeArea, Affinity.Inherited);
    },
    willAttachView(rootView: View): void {
      this.owner.callObservers("serviceWillAttachRoot", rootView, this.owner);
    },
    didAttachView(rootView: View): void {
      this.owner.callObservers("serviceDidAttachRoot", rootView, this.owner);
    },
    willDetachView(rootView: View): void {
      this.owner.callObservers("serviceWillDetachRoot", rootView, this.owner);
    },
    didDetachView(rootView: View): void {
      this.owner.callObservers("serviceDidDetachRoot", rootView, this.owner);
    },
    updateSafeArea(safeArea: ViewInsets): void {
      const rootViews = this.owner.roots.views;
      for (const viewId in rootViews) {
        const rootView = rootViews[viewId]!;
        rootView.edgeInsets.setValue(safeArea, Affinity.Inherited);
      }
    },
  })
  readonly roots!: ViewSet<this, View> & {
    /** @internal */
    updateSafeArea(safeArea: ViewInsets): void,
  };
  static readonly roots: FastenerClass<DisplayerService["roots"]>;

  @Provider<DisplayerService["viewport"]>({
    serviceType: ViewportService,
    lazy: false,
    observes: true,
    initService(viewportService: ViewportService): void {
      this.owner.roots.updateSafeArea(viewportService.safeArea.value);
    },
    serviceDidScrollLayoutViewport(layoutViewport: LayoutViewport): void {
      const rootViews = this.owner.roots.views;
      for (const viewId in rootViews) {
        const rootView = rootViews[viewId]!;
        rootView.requireUpdate(View.NeedsScroll);
      }
    },
    serviceDidResizeLayoutViewport(layoutViewport: LayoutViewport): void {
      const rootViews = this.owner.roots.views;
      for (const viewId in rootViews) {
        const rootView = rootViews[viewId]!;
        rootView.requireUpdate(View.NeedsResize | View.NeedsScroll);
      }
    },
    serviceDidResizeVisualViewport(visualViewport: VisualViewport): void {
      // hook
    },
    serviceDidResizeViewportSafeArea(safeArea: ViewInsets): void {
      this.owner.roots.updateSafeArea(safeArea);
    },
    serviceDidSetViewportOrientation(orientation: ViewportOrientation): void {
      const rootViews = this.owner.roots.views;
      for (const viewId in rootViews) {
        const rootView = rootViews[viewId]!;
        rootView.requireUpdate(View.NeedsResize | View.NeedsScroll | View.NeedsLayout);
      }
    },
    serviceDidSetViewIdiom(viewIdiom: ViewIdiom): void {
      const rootViews = this.owner.roots.views;
      for (const viewId in rootViews) {
        const rootView = rootViews[viewId]!;
        rootView.requireUpdate(View.NeedsResize | View.NeedsLayout);
      }
    }
  })
  readonly viewport!: Provider<this, ViewportService> & Observes<ViewportService>;
  static readonly viewport: FastenerClass<DisplayerService["viewport"]>;

  /** @internal */
  readonly updateFlags: ViewFlags;

  /** @internal */
  setUpdateFlags(updateFlags: ViewFlags): void {
    (this as Mutable<this>).updateFlags = updateFlags;
  }

  readonly updateTime: number;

  /** @internal */
  updateDelay: number;

  protected needsUpdate(updateFlags: ViewFlags, immediate: boolean): ViewFlags {
    return updateFlags;
  }

  requestUpdate(target: View, updateFlags: ViewFlags, immediate: boolean): void {
    updateFlags = this.needsUpdate(updateFlags, immediate);
    let deltaUpdateFlags = this.updateFlags & ~updateFlags & View.UpdateMask;
    if ((updateFlags & View.ProcessMask) !== 0) {
      deltaUpdateFlags |= View.NeedsProcess;
    }
    if ((updateFlags & View.DisplayMask) !== 0) {
      deltaUpdateFlags |= View.NeedsDisplay;
    }
    this.setUpdateFlags(this.updateFlags | deltaUpdateFlags);
    if (immediate && (this.updateFlags & (View.ProcessingFlag | View.DisplayingFlag)) === 0 && this.updateDelay <= DisplayerService.MaxProcessInterval) {
      this.runImmediatePass();
    } else {
      this.scheduleUpdate();
    }
  }

  protected scheduleUpdate(): void {
    const updateFlags = this.updateFlags;
    if ((updateFlags & View.ProcessingFlag) === 0 && (updateFlags & View.ProcessMask) !== 0) {
      this.scheduleProcessPass(this.updateDelay);
    } else if ((updateFlags & View.DisplayingFlag) === 0 && (updateFlags & View.DisplayMask) !== 0) {
      this.scheduleDisplayPass();
    }
  }

  protected cancelUpdate(): void {
    this.cancelProcessPass();
    this.cancelDisplayPass();
  }

  protected runImmediatePass(): void {
    if ((this.updateFlags & View.ProcessMask) !== 0) {
      this.cancelUpdate();
      this.runProcessPass(true);
    }
    if ((this.updateFlags & View.DisplayMask) !== 0 && this.updateDelay <= DisplayerService.MaxProcessInterval) {
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
    if (!immediate) {
      this.processTimer = 0;
    }
    this.setUpdateFlags(this.updateFlags & ~View.ProcessMask | View.ProcessingFlag);
    try {
      const t0 = performance.now();
      (this as Mutable<this>).updateTime = t0;

      const rootViews = this.roots.views;
      for (const viewId in rootViews) {
        const rootView = rootViews[viewId]!;
        if ((rootView.flags & View.ProcessMask) !== 0) {
          rootView.cascadeProcess(0);
        }
      }

      const t1 = performance.now();
      let processDelay = Math.max(DisplayerService.MinProcessInterval, this.updateDelay);
      if (t1 - t0 > processDelay) {
        this.updateDelay = Math.min(Math.max(2, this.updateDelay * 2), DisplayerService.MaxUpdateDelay);
      } else {
        this.updateDelay = Math.min(DisplayerService.MinUpdateDelay, this.updateDelay / 2);
      }

      this.cancelProcessPass();
      if ((this.updateFlags & View.DisplayMask) !== 0) {
        this.scheduleDisplayPass();
      } else if ((this.updateFlags & View.ProcessMask) !== 0) {
        if (immediate) {
          processDelay = Math.max(DisplayerService.MaxProcessInterval, processDelay);
        }
        this.cancelDisplayPass();
        this.scheduleProcessPass(processDelay);
      }
    } finally {
      this.setUpdateFlags(this.updateFlags & ~View.ProcessingFlag);
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
    if (!immediate) {
      this.displayFrame = 0;
    }
    this.setUpdateFlags(this.updateFlags & ~View.DisplayMask | View.DisplayingFlag);
    try {
      if (time === void 0) {
        time = performance.now();
      }
      (this as Mutable<this>).updateTime = time;

      const rootViews = this.roots.views;
      for (const viewId in rootViews) {
        const rootView = rootViews[viewId]!;
        if ((rootView.flags & View.DisplayMask) !== 0) {
          rootView.cascadeDisplay(0);
        }
      }

      this.cancelDisplayPass();
      if ((this.updateFlags & View.ProcessMask) !== 0) {
        let processDelay = this.updateDelay;
        if (immediate) {
          processDelay = Math.max(DisplayerService.MaxProcessInterval, processDelay);
        }
        this.scheduleProcessPass(processDelay);
      } else if ((this.updateFlags & View.DisplayMask) !== 0) {
        this.cancelProcessPass();
        this.scheduleDisplayPass();
      }
    } finally {
      this.setUpdateFlags(this.updateFlags & ~View.DisplayingFlag);
    }
  }

  get powerFlags(): ViewFlags {
    return View.NeedsResize | View.NeedsScroll;
  }

  power(): void {
    const rootViews = this.roots.views;
    for (const viewId in rootViews) {
      const rootView = rootViews[viewId]!;
      rootView.requireUpdate(this.powerFlags);
    }
  }

  unpower(): void {
    this.cancelUpdate();
    this.updateDelay = DisplayerService.MinUpdateDelay;
  }

  @EventHandler<DisplayerService["visibilityChange"]>({
    type: "visibilitychange",
    initTarget(): EventTarget | null {
      if (typeof document !== "undefined") {
        return document;
      } else {
        return null;
      }
    },
    handle(event: Event): void {
      if (document.visibilityState === "visible") {
        this.owner.power();
      } else {
        this.owner.unpower();
      }
    },
  })
  readonly visibilityChange!: EventHandler<this>;
  static readonly visibilityChange: FastenerClass<DisplayerService["visibilityChange"]>;

  /** @internal */
  static MinUpdateDelay: number = 0;
  /** @internal */
  static MaxUpdateDelay: number = 167;
  /** @internal */
  static MinProcessInterval: number = 12;
  /** @internal */
  static MaxProcessInterval: number = 33;
}
