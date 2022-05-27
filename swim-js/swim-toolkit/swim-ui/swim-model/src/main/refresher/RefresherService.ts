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

import type {Mutable, Class} from "@swim/util";
import {FastenerClass, EventHandler, Service} from "@swim/component";
import {ModelFlags, Model} from "../model/Model";
import {ModelSet} from "../model/ModelSet";
import type {RefresherServiceObserver} from "./RefresherServiceObserver";

/** @public */
export class RefresherService extends Service {
  constructor() {
    super();
    this.updateFlags = 0;
    this.updateTime = performance.now();
    this.updateDelay = RefresherService.MinUpdateDelay;
    this.analyzeTimer = 0;
    this.refreshTimer = 0;

    this.runAnalyzePass = this.runAnalyzePass.bind(this);
    this.runRefreshPass = this.runRefreshPass.bind(this);
  }

  override readonly observerType?: Class<RefresherServiceObserver>;

  @ModelSet<RefresherService["roots"]>({
    initModel(rootModel: Model): void {
      this.owner.requestUpdate(rootModel, rootModel.flags & Model.UpdateMask, false);
    },
    willAttachModel(rootModel: Model): void {
      this.owner.callObservers("serviceWillAttachRoot", rootModel, this.owner);
    },
    didAttachModel(rootModel: Model): void {
      this.owner.callObservers("serviceDidAttachRoot", rootModel, this.owner);
    },
    willDetachModel(rootModel: Model): void {
      this.owner.callObservers("serviceWillDetachRoot", rootModel, this.owner);
    },
    didDetachModel(rootModel: Model): void {
      this.owner.callObservers("serviceDidDetachRoot", rootModel, this.owner);
    },
  })
  readonly roots!: ModelSet<this, Model>;
  static readonly roots: FastenerClass<RefresherService["roots"]>;

  /** @internal */
  readonly updateFlags: ModelFlags;

  /** @internal */
  setUpdateFlags(updateFlags: ModelFlags): void {
    (this as Mutable<this>).updateFlags = updateFlags;
  }

  readonly updateTime: number;

  /** @internal */
  updateDelay: number;

  protected needsUpdate(updateFlags: ModelFlags, immediate: boolean): ModelFlags {
    return updateFlags;
  }

  requestUpdate(target: Model, updateFlags: ModelFlags, immediate: boolean): void {
    updateFlags = this.needsUpdate(updateFlags, immediate);
    let deltaUpdateFlags = this.updateFlags & ~updateFlags & Model.UpdateMask;
    if ((updateFlags & Model.AnalyzeMask) !== 0) {
      deltaUpdateFlags |= Model.NeedsAnalyze;
    }
    if ((updateFlags & Model.RefreshMask) !== 0) {
      deltaUpdateFlags |= Model.NeedsRefresh;
    }
    this.setUpdateFlags(this.updateFlags | deltaUpdateFlags);
    if (immediate && (this.updateFlags & (Model.AnalyzingFlag | Model.RefreshingFlag)) === 0 && this.updateDelay <= RefresherService.MaxAnalyzeInterval) {
      this.runImmediatePass();
    } else {
      this.scheduleUpdate();
    }
  }

  protected scheduleUpdate(): void {
    const updateFlags = this.updateFlags;
    if ((updateFlags & Model.AnalyzingFlag) === 0 && (updateFlags & Model.AnalyzeMask) !== 0) {
      this.scheduleAnalyzePass(this.updateDelay);
    } else if ((updateFlags & Model.RefreshingFlag) === 0 && (updateFlags & Model.RefreshMask) !== 0) {
      this.scheduleRefreshPass(RefresherService.MinAnalyzeInterval);
    }
  }

  protected cancelUpdate(): void {
    this.cancelAnalyzePass();
    this.cancelRefreshPass();
  }

  protected runImmediatePass(): void {
    if ((this.updateFlags & Model.AnalyzeMask) !== 0) {
      this.cancelUpdate();
      this.runAnalyzePass(true);
    }
    if ((this.updateFlags & Model.RefreshMask) !== 0 && this.updateDelay <= RefresherService.MaxAnalyzeInterval) {
      this.cancelUpdate();
      this.runRefreshPass(true);
    }
  }

  /** @internal */
  analyzeTimer: number;

  protected scheduleAnalyzePass(updateDelay: number): void {
    if (this.analyzeTimer === 0) {
      this.analyzeTimer = setTimeout(this.runAnalyzePass, updateDelay) as any;
    }
  }

  protected cancelAnalyzePass(): void {
    if (this.analyzeTimer !== 0) {
      clearTimeout(this.analyzeTimer);
      this.analyzeTimer = 0;
    }
  }

  protected runAnalyzePass(immediate: boolean = false): void {
    if (!immediate) {
      this.analyzeTimer = 0;
    }
    this.setUpdateFlags(this.updateFlags & ~Model.AnalyzeMask | Model.AnalyzingFlag);
    try {
      const t0 = performance.now();
      (this as Mutable<this>).updateTime = t0;

      const rootModels = this.roots.models;
      for (const modelId in rootModels) {
        const rootModel = rootModels[modelId]!;
        if ((rootModel.flags & Model.AnalyzeMask) !== 0) {
          rootModel.cascadeAnalyze(0);
        }
      }

      const t1 = performance.now();
      let analyzeDelay = Math.max(RefresherService.MinAnalyzeInterval, this.updateDelay);
      if (t1 - t0 > analyzeDelay) {
        this.updateDelay = Math.min(Math.max(2, this.updateDelay * 2), RefresherService.MaxUpdateDelay);
      } else {
        this.updateDelay = Math.min(RefresherService.MinUpdateDelay, this.updateDelay / 2);
      }

      this.cancelAnalyzePass();
      if ((this.updateFlags & Model.RefreshMask) !== 0) {
        this.scheduleRefreshPass(RefresherService.MinRefreshInterval);
      } else if ((this.updateFlags & Model.AnalyzeMask) !== 0) {
        if (immediate) {
          analyzeDelay = Math.max(RefresherService.MaxAnalyzeInterval, analyzeDelay);
        }
        this.cancelRefreshPass();
        this.scheduleAnalyzePass(analyzeDelay);
      }
    } finally {
      this.setUpdateFlags(this.updateFlags & ~Model.AnalyzingFlag);
    }
  }

  /** @internal */
  refreshTimer: number;

  protected scheduleRefreshPass(updateDelay: number): void {
    if (this.refreshTimer === 0) {
      this.refreshTimer = setTimeout(this.runRefreshPass, updateDelay) as any;
    }
  }

  protected cancelRefreshPass(): void {
    if (this.refreshTimer !== 0) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = 0;
    }
  }

  protected runRefreshPass(immediate: boolean = false): void {
    if (!immediate) {
      this.refreshTimer = 0;
    }
    this.setUpdateFlags(this.updateFlags & ~Model.RefreshMask | Model.RefreshingFlag);
    try {
      const time = performance.now();
      (this as Mutable<this>).updateTime = time;

      const rootModels = this.roots.models;
      for (const modelId in rootModels) {
        const rootModel = rootModels[modelId]!;
        if ((rootModel.flags & Model.RefreshMask) !== 0) {
          rootModel.cascadeRefresh(0);
        }
      }

      this.cancelRefreshPass();
      if ((this.updateFlags & Model.AnalyzeMask) !== 0) {
        let analyzeDelay = this.updateDelay;
        if (immediate) {
          analyzeDelay = Math.max(RefresherService.MaxAnalyzeInterval, analyzeDelay);
        }
        this.scheduleAnalyzePass(analyzeDelay);
      } else if ((this.updateFlags & Model.RefreshMask) !== 0) {
        this.cancelAnalyzePass();
        this.scheduleRefreshPass(RefresherService.MaxRefreshInterval);
      }
    } finally {
      this.setUpdateFlags(this.updateFlags & ~Model.RefreshingFlag);
    }
  }

  get powerFlags(): ModelFlags {
    return 0;
  }

  power(): void {
    const rootModels = this.roots.models;
    for (const modelId in rootModels) {
      const rootModel = rootModels[modelId]!;
      rootModel.requireUpdate(this.powerFlags);
    }
  }

  unpower(): void {
    this.cancelUpdate();
    this.updateDelay = RefresherService.MinUpdateDelay;
  }

  @EventHandler<RefresherService["visibilityChange"]>({
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
  static readonly visibilityChange: FastenerClass<RefresherService["visibilityChange"]>;

  /** @internal */
  static MinUpdateDelay: number = 0;
  /** @internal */
  static MaxUpdateDelay: number = 167;
  /** @internal */
  static MinAnalyzeInterval: number = 12;
  /** @internal */
  static MaxAnalyzeInterval: number = 33;
  /** @internal */
  static MinRefreshInterval: number = 4;
  /** @internal */
  static MaxRefreshInterval: number = 16;
}
