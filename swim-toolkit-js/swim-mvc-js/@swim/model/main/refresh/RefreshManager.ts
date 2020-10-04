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

import {ModelContext} from "../ModelContext";
import {ModelFlags, Model} from "../Model";
import {ModelManager} from "../manager/ModelManager";
import {RefreshContext} from "./RefreshContext";
import {RefreshManagerObserver} from "./RefreshManagerObserver";

export class RefreshManager<M extends Model = Model> extends ModelManager<M> {
  /** @hidden */
  readonly _modelContext: RefreshContext;
  /** @hidden */
  _rootFlags: ModelFlags;
  /** @hidden */
  _analyzeTimer: number;
  /** @hidden */
  _refreshTimer: number;
  /** @hidden */
  _updateDelay: number;

  constructor() {
    super();
    this.runAnalyzePass = this.runAnalyzePass.bind(this);
    this.runRefreshPass = this.runRefreshPass.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);

    this._modelContext = this.initModelContext();
    this._rootFlags = 0;
    this._analyzeTimer = 0;
    this._refreshTimer = 0;
    this._updateDelay = RefreshManager.MinUpdateDelay;
  }

  protected initModelContext(): RefreshContext {
    return {
      updateTime: 0,
    };
  }

  get modelContext(): ModelContext {
    return this._modelContext;
  }

  get powerFlags(): ModelFlags {
    return 0;
  }

  protected onPower(): void {
    this.powerRootModels();
  }

  protected powerRootModels(): void {
    const rootModels = this._rootModels;
    for (let i = 0, n = rootModels.length; i < n; i += 1) {
      const rootModel = rootModels[i];
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
    this._updateDelay = RefreshManager.MinUpdateDelay;
    this.unpowerRootModels();
  }

  protected unpowerRootModels(): void {
    const rootModels = this._rootModels;
    for (let i = 0, n = rootModels.length; i < n; i += 1) {
      const rootModel = rootModels[i];
      if (rootModel.isPowered()) {
        this.unpowerRootModel(rootModel);
      }
    }
  }

  protected unpowerRootModel(rootModel: M): void {
    rootModel.cascadeUnpower();
  }

  get rootFlags(): ModelFlags {
    return this._rootFlags;
  }

  requestUpdate(targetModel: Model, updateFlags: ModelFlags, immediate: boolean): void {
    updateFlags = this.willRequestUpdate(targetModel, updateFlags, immediate) & Model.UpdateMask;
    this._rootFlags |= updateFlags;
    if ((this._rootFlags & Model.UpdateMask) !== 0) {
      if (immediate && this._updateDelay <= RefreshManager.MaxAnalyzeInterval
          && (this._rootFlags & (Model.TraversingFlag | Model.ImmediateFlag)) === 0) {
        this.runImmediatePass();
      } else {
        this.scheduleUpdate();
      }
    }
    this.didRequestUpdate(targetModel, updateFlags, immediate);
  }

  protected willRequestUpdate(targetModel: Model, updateFlags: ModelFlags, immediate: boolean): ModelFlags {
    return updateFlags | this.modifyUpdate(targetModel, updateFlags);
  }

  protected didRequestUpdate(targetModel: Model, updateFlags: ModelFlags, immediate: boolean): void {
    // hook
  }

  protected modifyUpdate(targetModel: Model, updateFlags: ModelFlags): ModelFlags {
    let additionalFlags = 0;
    if ((updateFlags & Model.AnalyzeMask) !== 0) {
      additionalFlags |= Model.NeedsAnalyze;
    }
    if ((updateFlags & Model.RefreshMask) !== 0) {
      additionalFlags |= Model.NeedsRefresh;
    }
    return additionalFlags;
  }

  protected scheduleUpdate(): void {
    const updateFlags = this._rootFlags;
    if (this._analyzeTimer === 0 && this._refreshTimer === 0
        && (updateFlags & Model.UpdatingMask) === 0
        && (updateFlags & Model.UpdateMask) !== 0) {
      this._analyzeTimer = setTimeout(this.runAnalyzePass, this._updateDelay) as any;
    }
  }

  protected cancelUpdate(): void {
    if (this._analyzeTimer !== 0) {
      clearTimeout(this._analyzeTimer);
      this._analyzeTimer = 0;
    }
    if (this._refreshTimer !== 0) {
      clearTimeout(this._refreshTimer);
      this._refreshTimer = 0;
    }
  }

  protected runImmediatePass(): void {
    this._rootFlags |= Model.ImmediateFlag;
    try {
      if ((this._rootFlags & Model.AnalyzeMask) !== 0) {
        this.cancelUpdate();
        this.runAnalyzePass(true);
      }
      if ((this._rootFlags & Model.RefreshMask) !== 0
          && this._updateDelay <= RefreshManager.MaxAnalyzeInterval) {
        this.cancelUpdate();
        this.runRefreshPass(true);
      }
    } finally {
      this._rootFlags &= ~Model.ImmediateFlag;
    }
  }

  protected runAnalyzePass(immediate: boolean = false): void {
    const rootModels = this._rootModels;
    this._rootFlags |= Model.TraversingFlag | Model.AnalyzingFlag;
    this._rootFlags &= ~Model.AnalyzeMask;
    try {
      const t0 = performance.now();
      for (let i = 0; i < rootModels.length; i += 1) {
        const rootModel = rootModels[i];
        if ((rootModel.modelFlags & Model.AnalyzeMask) !== 0) {
          const modelContext = rootModel.modelContext as RefreshContext;
          modelContext.updateTime = t0;
          rootModel.cascadeAnalyze(0, modelContext);
        }
      }

      const t1 = performance.now();
      let analyzeDelay = Math.max(RefreshManager.MinAnalyzeInterval, this._updateDelay);
      if (t1 - t0 > analyzeDelay) {
        this._updateDelay = Math.min(Math.max(2, this._updateDelay * 2), RefreshManager.MaxUpdateDelay);
      } else {
        this._updateDelay = Math.min(RefreshManager.MinUpdateDelay, this._updateDelay / 2);
      }

      this.cancelUpdate();
      if ((this._rootFlags & Model.RefreshMask) !== 0) {
        this._refreshTimer = setTimeout(this.runRefreshPass, RefreshManager.MinRefreshInterval) as any;
      } else if ((this._rootFlags & Model.AnalyzeMask) !== 0) {
        if (immediate) {
          analyzeDelay = Math.max(RefreshManager.MaxAnalyzeInterval, analyzeDelay);
        }
        this._analyzeTimer = setTimeout(this.runAnalyzePass, analyzeDelay) as any;
      }
    } finally {
      this._rootFlags &= ~(Model.TraversingFlag | Model.AnalyzingFlag);
    }
  }

  protected runRefreshPass(immediate: boolean = false): void {
    const rootModels = this._rootModels;
    this._rootFlags |= Model.TraversingFlag | Model.RefreshingFlag;
    this._rootFlags &= ~Model.RefreshMask;
    try {
      const time = performance.now();
      for (let i = 0; i < rootModels.length; i += 1) {
        const rootModel = rootModels[i];
        if ((rootModel.modelFlags & Model.RefreshMask) !== 0) {
          const modelContext = rootModel.modelContext as RefreshContext;
          modelContext.updateTime = time;
          rootModel.cascadeRefresh(0, modelContext);
        }
      }

      this.cancelUpdate();
      if ((this._rootFlags & Model.AnalyzeMask) !== 0) {
        let analyzeDelay = this._updateDelay;
        if (immediate) {
          analyzeDelay = Math.max(RefreshManager.MaxAnalyzeInterval, analyzeDelay);
        }
        this._analyzeTimer = setTimeout(this.runAnalyzePass, analyzeDelay) as any;
      } else if ((this._rootFlags & Model.RefreshMask) !== 0) {
        this._refreshTimer = setTimeout(this.runRefreshPass, RefreshManager.MaxRefreshInterval) as any;
      }
    } finally {
      this._rootFlags &= ~(Model.TraversingFlag | Model.RefreshingFlag);
    }
  }

  // @ts-ignore
  declare readonly modelManagerObservers: ReadonlyArray<RefreshManagerObserver>;

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

  protected onInsertRootModel(rootModel: M): void {
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

  private static _global?: RefreshManager<any>;
  static global<M extends Model>(): RefreshManager<M> {
    if (RefreshManager._global === void 0) {
      RefreshManager._global = new RefreshManager();
    }
    return RefreshManager._global;
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
ModelManager.Refresh = RefreshManager;
