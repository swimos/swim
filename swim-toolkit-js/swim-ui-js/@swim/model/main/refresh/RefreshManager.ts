// Copyright 2015-2021 Swim inc.
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
import {ModelFlags, Model} from "../Model";
import {ModelManager} from "../manager/ModelManager";
import type {RefreshContext} from "./RefreshContext";
import type {RefreshManagerObserver} from "./RefreshManagerObserver";

export class RefreshManager<M extends Model = Model> extends ModelManager<M> {
  constructor() {
    super();
    Object.defineProperty(this, "modelContext", {
      value: this.initModelContext(),
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "rootFlags", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
    this.analyzeTimer = 0;
    this.refreshTimer = 0;
    this.updateDelay = RefreshManager.MinUpdateDelay;

    this.runAnalyzePass = this.runAnalyzePass.bind(this);
    this.runRefreshPass = this.runRefreshPass.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
  }

  readonly modelContext!: RefreshContext;

  protected initModelContext(): RefreshContext {
    return {
      updateTime: 0,
    };
  }

  updatedModelContext(): RefreshContext {
    const modelContext = this.modelContext;
    modelContext.updateTime = performance.now();
    return modelContext;
  }

  get powerFlags(): ModelFlags {
    return 0;
  }

  protected onPower(): void {
    this.powerRootModels();
  }

  protected powerRootModels(): void {
    const rootModels = this.rootModels;
    for (let i = 0, n = rootModels.length; i < n; i += 1) {
      const rootModel = rootModels[i]!;
      if (!rootModel.isPowered()) {
        this.powerRootModel(rootModel);
      }
    }
  }

  protected powerRootModel(rootModel: M): void {
    rootModel.cascadePower();
    rootModel.requireUpdate(this.powerFlags);
  }

  protected onUnpower(): void {
    this.cancelUpdate();
    this.updateDelay = RefreshManager.MinUpdateDelay;
    this.unpowerRootModels();
  }

  protected unpowerRootModels(): void {
    const rootModels = this.rootModels;
    for (let i = 0, n = rootModels.length; i < n; i += 1) {
      const rootModel = rootModels[i]!;
      if (rootModel.isPowered()) {
        this.unpowerRootModel(rootModel);
      }
    }
  }

  protected unpowerRootModel(rootModel: M): void {
    rootModel.cascadeUnpower();
  }

  readonly rootFlags!: ModelFlags;

  /** @hidden */
  setRootFlags(rootFlags: ModelFlags): void {
    Object.defineProperty(this, "rootFlags", {
      value: rootFlags,
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
  analyzeTimer: number;

  /** @hidden */
  refreshTimer: number;

  /** @hidden */
  updateDelay: number;

  requestUpdate(targetModel: Model, updateFlags: ModelFlags, immediate: boolean): void {
    this.willRequestUpdate(targetModel, updateFlags, immediate);
    if ((updateFlags & Model.AnalyzeMask) !== 0) {
      this.setRootFlags(this.rootFlags | Model.NeedsAnalyze);
    }
    if ((updateFlags & Model.RefreshMask) !== 0) {
      this.setRootFlags(this.rootFlags | Model.NeedsRefresh);
    }
    if ((this.rootFlags & Model.UpdateMask) !== 0) {
      this.onRequestUpdate(targetModel, updateFlags, immediate);
      if (immediate && this.updateDelay <= RefreshManager.MaxAnalyzeInterval
          && (this.rootFlags & (Model.TraversingFlag | Model.ImmediateFlag)) === 0) {
        this.runImmediatePass();
      } else {
        this.scheduleUpdate();
      }
    }
    this.didRequestUpdate(targetModel, updateFlags, immediate);
  }

  protected willRequestUpdate(targetModel: Model, updateFlags: ModelFlags, immediate: boolean): void {
    // hook
  }

  protected onRequestUpdate(targetModel: Model, updateFlags: ModelFlags, immediate: boolean): void {
    // hook
  }

  protected didRequestUpdate(targetModel: Model, updateFlags: ModelFlags, immediate: boolean): void {
    // hook
  }

  protected scheduleUpdate(): void {
    const updateFlags = this.rootFlags;
    if (this.analyzeTimer === 0 && this.refreshTimer === 0
        && (updateFlags & Model.UpdatingMask) === 0
        && (updateFlags & Model.UpdateMask) !== 0) {
      this.analyzeTimer = setTimeout(this.runAnalyzePass, this.updateDelay) as any;
    }
  }

  protected cancelUpdate(): void {
    if (this.analyzeTimer !== 0) {
      clearTimeout(this.analyzeTimer);
      this.analyzeTimer = 0;
    }
    if (this.refreshTimer !== 0) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = 0;
    }
  }

  protected runImmediatePass(): void {
    this.setRootFlags(this.rootFlags | Model.ImmediateFlag);
    try {
      if ((this.rootFlags & Model.AnalyzeMask) !== 0) {
        this.cancelUpdate();
        this.runAnalyzePass(true);
      }
      if ((this.rootFlags & Model.RefreshMask) !== 0
          && this.updateDelay <= RefreshManager.MaxAnalyzeInterval) {
        this.cancelUpdate();
        this.runRefreshPass(true);
      }
    } finally {
      this.setRootFlags(this.rootFlags & ~Model.ImmediateFlag);
    }
  }

  protected runAnalyzePass(immediate: boolean = false): void {
    const rootModels = this.rootModels;
    this.setRootFlags(this.rootFlags & ~Model.AnalyzeMask | (Model.TraversingFlag | Model.AnalyzingFlag));
    try {
      const t0 = performance.now();
      const modelContext = this.modelContext;
      modelContext.updateTime = t0;

      for (let i = 0; i < rootModels.length; i += 1) {
        const rootModel = rootModels[i]!;
        if ((rootModel.modelFlags & Model.AnalyzeMask) !== 0) {
          rootModel.cascadeAnalyze(0, modelContext);
        }
      }

      const t1 = performance.now();
      let analyzeDelay = Math.max(RefreshManager.MinAnalyzeInterval, this.updateDelay);
      if (t1 - t0 > analyzeDelay) {
        this.updateDelay = Math.min(Math.max(2, this.updateDelay * 2), RefreshManager.MaxUpdateDelay);
      } else {
        this.updateDelay = Math.min(RefreshManager.MinUpdateDelay, this.updateDelay / 2);
      }

      this.cancelUpdate();
      if ((this.rootFlags & Model.RefreshMask) !== 0) {
        this.refreshTimer = setTimeout(this.runRefreshPass, RefreshManager.MinRefreshInterval) as any;
      } else if ((this.rootFlags & Model.AnalyzeMask) !== 0) {
        if (immediate) {
          analyzeDelay = Math.max(RefreshManager.MaxAnalyzeInterval, analyzeDelay);
        }
        this.analyzeTimer = setTimeout(this.runAnalyzePass, analyzeDelay) as any;
      }
    } finally {
      this.setRootFlags(this.rootFlags & ~(Model.TraversingFlag | Model.AnalyzingFlag));
    }
  }

  protected runRefreshPass(immediate: boolean = false): void {
    const rootModels = this.rootModels;
    this.setRootFlags(this.rootFlags & ~Model.RefreshMask | (Model.TraversingFlag | Model.RefreshingFlag));
    try {
      const time = performance.now();
      const modelContext = this.modelContext;
      modelContext.updateTime = time;

      for (let i = 0; i < rootModels.length; i += 1) {
        const rootModel = rootModels[i]!;
        if ((rootModel.modelFlags & Model.RefreshMask) !== 0) {
          rootModel.cascadeRefresh(0, modelContext);
        }
      }

      this.cancelUpdate();
      if ((this.rootFlags & Model.AnalyzeMask) !== 0) {
        let analyzeDelay = this.updateDelay;
        if (immediate) {
          analyzeDelay = Math.max(RefreshManager.MaxAnalyzeInterval, analyzeDelay);
        }
        this.analyzeTimer = setTimeout(this.runAnalyzePass, analyzeDelay) as any;
      } else if ((this.rootFlags & Model.RefreshMask) !== 0) {
        this.refreshTimer = setTimeout(this.runRefreshPass, RefreshManager.MaxRefreshInterval) as any;
      }
    } finally {
      this.setRootFlags(this.rootFlags & ~(Model.TraversingFlag | Model.RefreshingFlag));
    }
  }

  override readonly modelManagerObservers!: ReadonlyArray<RefreshManagerObserver>;

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

  protected override onInsertRootModel(rootModel: M): void {
    super.onInsertRootModel(rootModel);
    this.requestUpdate(rootModel, rootModel.modelFlags & Model.UpdateMask, false);
  }

  /** @hidden */
  protected onVisibilityChange(): void {
    if (document.visibilityState === "visible") {
      this.onPower();
    } else {
      this.onUnpower();
    }
  }

  @Lazy
  static global<M extends Model>(): RefreshManager<M> {
    return new RefreshManager();
  }

  /** @hidden */
  static MinUpdateDelay: number = 0;
  /** @hidden */
  static MaxUpdateDelay: number = 167;
  /** @hidden */
  static MinAnalyzeInterval: number = 12;
  /** @hidden */
  static MaxAnalyzeInterval: number = 33;
  /** @hidden */
  static MinRefreshInterval: number = 4;
  /** @hidden */
  static MaxRefreshInterval: number = 16;
}
