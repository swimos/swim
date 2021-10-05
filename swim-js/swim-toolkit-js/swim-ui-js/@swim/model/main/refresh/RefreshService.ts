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
import type {RefreshServiceObserver} from "./RefreshServiceObserver";
import type {ModelContext} from "../model/ModelContext";
import {ModelFlags, Model} from "../"; // forward import

export class RefreshService<M extends Model = Model> extends Service<M> {
  constructor() {
    super();
    this.flags = 0;
    this.modelContext = this.createModelContext();
    this.updateDelay = RefreshService.MinUpdateDelay;
    this.analyzeTimer = 0;
    this.refreshTimer = 0;

    this.runAnalyzePass = this.runAnalyzePass.bind(this);
    this.runRefreshPass = this.runRefreshPass.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
  }

  override readonly observerType?: Class<RefreshServiceObserver<M>>;

  readonly flags: ModelFlags;

  /** @internal */
  setFlags(flags: ModelFlags): void {
    (this as Mutable<this>).flags = flags;
  }

  readonly modelContext: ModelContext;

  protected createModelContext(): ModelContext {
    return {
      updateTime: 0,
    };
  }

  updatedModelContext(): ModelContext {
    const modelContext = this.modelContext;
    (modelContext as Mutable<ModelContext>).updateTime = performance.now();
    return modelContext;
  }

  /** @internal */
  updateDelay: number;

  protected needsUpdate(updateFlags: ModelFlags, immediate: boolean): ModelFlags {
    return updateFlags;
  }

  requestUpdate(target: Model, updateFlags: ModelFlags, immediate: boolean): void {
    updateFlags = this.needsUpdate(updateFlags, immediate);
    let deltaUpdateFlags = this.flags & ~updateFlags & Model.UpdateMask;
    if ((updateFlags & Model.AnalyzeMask) !== 0) {
      deltaUpdateFlags |= Model.NeedsAnalyze;
    }
    if ((updateFlags & Model.RefreshMask) !== 0) {
      deltaUpdateFlags |= Model.NeedsRefresh;
    }
    this.setFlags(this.flags | deltaUpdateFlags);
    if (immediate && (this.flags & Model.TraversingFlag) === 0
        && this.updateDelay <= RefreshService.MaxAnalyzeInterval) {
      this.runImmediatePass();
    } else {
      this.scheduleUpdate();
    }
  }

  protected scheduleUpdate(): void {
    const flags = this.flags;
    if ((flags & Model.AnalyzingFlag) === 0 && (flags & Model.AnalyzeMask) !== 0) {
      this.scheduleAnalyzePass(this.updateDelay);
    } else if ((flags & Model.RefreshingFlag) === 0 && (flags & Model.RefreshMask) !== 0) {
      this.scheduleRefreshPass(RefreshService.MinAnalyzeInterval);
    }
  }

  protected cancelUpdate(): void {
    this.cancelAnalyzePass();
    this.cancelRefreshPass();
  }

  protected runImmediatePass(): void {
    this.setFlags(this.flags | Model.ImmediateFlag);
    try {
      if ((this.flags & Model.AnalyzeMask) !== 0) {
        this.cancelUpdate();
        this.runAnalyzePass(true);
      }
      if ((this.flags & Model.RefreshMask) !== 0
          && this.updateDelay <= RefreshService.MaxAnalyzeInterval) {
        this.cancelUpdate();
        this.runRefreshPass(true);
      }
    } finally {
      this.setFlags(this.flags & ~Model.ImmediateFlag);
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
    this.setFlags(this.flags & ~Model.AnalyzeMask | (Model.TraversingFlag | Model.AnalyzingFlag));
    try {
      const t0 = performance.now();
      const roots = this.roots;
      const modelContext = this.modelContext;
      (modelContext as Mutable<ModelContext>).updateTime = t0;
      for (let i = 0; i < roots.length; i += 1) {
        const root = roots[i]!;
        if ((root.flags & Model.AnalyzeMask) !== 0) {
          root.cascadeAnalyze(0, modelContext);
        }
      }

      const t1 = performance.now();
      let analyzeDelay = Math.max(RefreshService.MinAnalyzeInterval, this.updateDelay);
      if (t1 - t0 > analyzeDelay) {
        this.updateDelay = Math.min(Math.max(2, this.updateDelay * 2), RefreshService.MaxUpdateDelay);
      } else {
        this.updateDelay = Math.min(RefreshService.MinUpdateDelay, this.updateDelay / 2);
      }

      this.cancelAnalyzePass();
      if ((this.flags & Model.RefreshMask) !== 0) {
        this.scheduleRefreshPass(RefreshService.MinRefreshInterval);
      } else if ((this.flags & Model.AnalyzeMask) !== 0) {
        if (immediate) {
          analyzeDelay = Math.max(RefreshService.MaxAnalyzeInterval, analyzeDelay);
        }
        this.cancelRefreshPass();
        this.scheduleAnalyzePass(analyzeDelay);
      }
    } finally {
      this.setFlags(this.flags & ~(Model.TraversingFlag | Model.AnalyzingFlag));
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
    this.setFlags(this.flags & ~Model.RefreshMask | (Model.TraversingFlag | Model.RefreshingFlag));
    try {
      const time = performance.now();
      const modelContext = this.modelContext;
      (modelContext as Mutable<ModelContext>).updateTime = time;
      const roots = this.roots;
      for (let i = 0; i < roots.length; i += 1) {
        const root = roots[i]!;
        if ((root.flags & Model.RefreshMask) !== 0) {
          root.cascadeRefresh(0, modelContext);
        }
      }

      this.cancelRefreshPass();
      if ((this.flags & Model.AnalyzeMask) !== 0) {
        let analyzeDelay = this.updateDelay;
        if (immediate) {
          analyzeDelay = Math.max(RefreshService.MaxAnalyzeInterval, analyzeDelay);
        }
        this.scheduleAnalyzePass(analyzeDelay);
      } else if ((this.flags & Model.RefreshMask) !== 0) {
        this.cancelAnalyzePass();
        this.scheduleRefreshPass(RefreshService.MaxRefreshInterval);
      }
    } finally {
      this.setFlags(this.flags & ~(Model.TraversingFlag | Model.RefreshingFlag));
    }
  }

  get powerFlags(): ModelFlags {
    return 0;
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
    this.updateDelay = RefreshService.MinUpdateDelay;
  }

  protected override onAttachRoot(root: M): void {
    super.onAttachRoot(root);
    this.requestUpdate(root, root.flags & Model.UpdateMask, false);
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

  @Lazy
  static global<M extends Model>(): RefreshService<M> {
    return new RefreshService();
  }

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
