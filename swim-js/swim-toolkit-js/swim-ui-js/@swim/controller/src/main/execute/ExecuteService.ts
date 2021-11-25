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
import type {ExecuteServiceObserver} from "./ExecuteServiceObserver";
import {ControllerContext} from "../controller/ControllerContext";
import {ControllerFlags, Controller} from "../"; // forward import

/** @public */
export class ExecuteService<C extends Controller = Controller> extends Service<C> {
  constructor() {
    super();
    this.flags = 0;
    this.controllerContext = ControllerContext.create();
    this.updateDelay = ExecuteService.MinUpdateDelay;
    this.compileTimer = 0;
    this.executeTimer = 0;

    this.runCompilePass = this.runCompilePass.bind(this);
    this.runExecutePass = this.runExecutePass.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
  }

  override readonly observerType?: Class<ExecuteServiceObserver<C>>;

  readonly flags: ControllerFlags;

  /** @internal */
  setFlags(flags: ControllerFlags): void {
    (this as Mutable<this>).flags = flags;
  }

  readonly controllerContext: ControllerContext;

  updatedControllerContext(): ControllerContext {
    const controllerContext = this.controllerContext;
    (controllerContext as Mutable<ControllerContext>).updateTime = performance.now();
    return controllerContext;
  }

  /** @internal */
  updateDelay: number;

  protected needsUpdate(updateFlags: ControllerFlags, immediate: boolean): ControllerFlags {
    return updateFlags;
  }

  requestUpdate(targetController: Controller, updateFlags: ControllerFlags, immediate: boolean): void {
    updateFlags = this.needsUpdate(updateFlags, immediate);
    let deltaUpdateFlags = this.flags & ~updateFlags & Controller.UpdateMask;
    if ((updateFlags & Controller.CompileMask) !== 0) {
      deltaUpdateFlags |= Controller.NeedsCompile;
    }
    if ((updateFlags & Controller.ExecuteMask) !== 0) {
      deltaUpdateFlags |= Controller.NeedsExecute;
    }
    this.setFlags(this.flags | deltaUpdateFlags);
    if (immediate && (this.flags & (Controller.CompilingFlag | Controller.ExecutingFlag)) === 0 && this.updateDelay <= ExecuteService.MaxCompileInterval) {
      this.runImmediatePass();
    } else {
      this.scheduleUpdate();
    }
  }

  protected scheduleUpdate(): void {
    const flags = this.flags;
    if ((flags & Controller.CompilingFlag) === 0 && (flags & Controller.CompileMask) !== 0) {
      this.scheduleCompilePass(this.updateDelay);
    } else if ((flags & Controller.ExecutingFlag) === 0 && (flags & Controller.ExecuteMask) !== 0) {
      this.scheduleExecutePass(ExecuteService.MinExecuteInterval);
    }
  }

  protected cancelUpdate(): void {
    this.cancelCompilePass();
    this.cancelExecutePass();
  }

  protected runImmediatePass(): void {
    if ((this.flags & Controller.CompileMask) !== 0) {
      this.cancelUpdate();
      this.runCompilePass(true);
    }
    if ((this.flags & Controller.ExecuteMask) !== 0 && this.updateDelay <= ExecuteService.MaxCompileInterval) {
      this.cancelUpdate();
      this.runExecutePass(true);
    }
  }

  /** @internal */
  compileTimer: number;

  protected scheduleCompilePass(updateDelay: number): void {
    if (this.compileTimer === 0) {
      this.compileTimer = setTimeout(this.runCompilePass, updateDelay) as any;
    }
  }

  protected cancelCompilePass(): void {
    if (this.compileTimer !== 0) {
      clearTimeout(this.compileTimer);
      this.compileTimer = 0;
    }
  }

  protected runCompilePass(immediate: boolean = false): void {
    this.setFlags(this.flags & ~Controller.CompileMask | Controller.CompilingFlag);
    try {
      const t0 = performance.now();
      const roots = this.roots;
      const controllerContext = this.controllerContext;
      (controllerContext as Mutable<ControllerContext>).updateTime = t0;
      for (let i = 0; i < roots.length; i += 1) {
        const root = roots[i]!;
        if ((root.flags & Controller.CompileMask) !== 0) {
          root.cascadeCompile(0, controllerContext);
        }
      }

      const t1 = performance.now();
      let compileDelay = Math.max(ExecuteService.MinCompileInterval, this.updateDelay);
      if (t1 - t0 > compileDelay) {
        this.updateDelay = Math.min(Math.max(2, this.updateDelay * 2), ExecuteService.MaxUpdateDelay);
      } else {
        this.updateDelay = Math.min(ExecuteService.MinUpdateDelay, this.updateDelay / 2);
      }

      this.cancelCompilePass();
      if ((this.flags & Controller.ExecuteMask) !== 0) {
        this.scheduleExecutePass(ExecuteService.MinExecuteInterval);
      } else if ((this.flags & Controller.CompileMask) !== 0) {
        if (immediate) {
          compileDelay = Math.max(ExecuteService.MaxCompileInterval, compileDelay);
        }
        this.cancelExecutePass();
        this.scheduleCompilePass(compileDelay);
      }
    } finally {
      this.setFlags(this.flags & ~Controller.CompilingFlag);
    }
  }

  /** @internal */
  executeTimer: number;

  protected scheduleExecutePass(updateDelay: number): void {
    if (this.executeTimer === 0) {
      this.executeTimer = setTimeout(this.runExecutePass, updateDelay) as any;
    }
  }

  protected cancelExecutePass(): void {
    if (this.executeTimer !== 0) {
      clearTimeout(this.executeTimer);
      this.executeTimer = 0;
    }
  }

  protected runExecutePass(immediate: boolean = false): void {
    this.setFlags(this.flags & ~Controller.ExecuteMask | Controller.ExecutingFlag);
    try {
      const time = performance.now();
      const controllerContext = this.controllerContext;
      (controllerContext as Mutable<ControllerContext>).updateTime = time;
      const roots = this.roots;
      for (let i = 0; i < roots.length; i += 1) {
        const root = roots[i]!;
        if ((root.flags & Controller.ExecuteMask) !== 0) {
          root.cascadeExecute(0, controllerContext);
        }
      }

      this.cancelExecutePass();
      if ((this.flags & Controller.CompileMask) !== 0) {
        let compileDelay = this.updateDelay;
        if (immediate) {
          compileDelay = Math.max(ExecuteService.MaxCompileInterval, compileDelay);
        }
        this.scheduleCompilePass(compileDelay);
      } else if ((this.flags & Controller.ExecuteMask) !== 0) {
        this.cancelCompilePass();
        this.scheduleExecutePass(ExecuteService.MaxExecuteInterval);
      }
    } finally {
      this.setFlags(this.flags & ~Controller.ExecutingFlag);
    }
  }

  get powerFlags(): ControllerFlags {
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
    this.updateDelay = ExecuteService.MinUpdateDelay;
  }

  protected override onAttachRoot(root: C): void {
    super.onAttachRoot(root);
    this.requestUpdate(root, root.flags & Controller.UpdateMask, false);
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
  static global<C extends Controller>(): ExecuteService<C> {
    return new ExecuteService();
  }

  /** @internal */
  static MinUpdateDelay: number = 0;
  /** @internal */
  static MaxUpdateDelay: number = 167;
  /** @internal */
  static MinCompileInterval: number = 12;
  /** @internal */
  static MaxCompileInterval: number = 33;
  /** @internal */
  static MinExecuteInterval: number = 4;
  /** @internal */
  static MaxExecuteInterval: number = 16;
}
