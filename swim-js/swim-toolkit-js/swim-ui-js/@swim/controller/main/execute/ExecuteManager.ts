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
import {ControllerFlags, Controller} from "../Controller";
import {ControllerManager} from "../manager/ControllerManager";
import type {ExecuteContext} from "./ExecuteContext";
import type {ExecuteManagerObserver} from "./ExecuteManagerObserver";

export class ExecuteManager<C extends Controller = Controller> extends ControllerManager<C> {
  constructor() {
    super();
    Object.defineProperty(this, "controllerContext", {
      value: this.initControllerContext(),
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "rootFlags", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
    this.compileTimer = 0;
    this.executeTimer = 0;
    this.updateDelay = ExecuteManager.MinUpdateDelay;

    this.runCompilePass = this.runCompilePass.bind(this);
    this.runExecutePass = this.runExecutePass.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
  }

  readonly controllerContext!: ExecuteContext;

  protected initControllerContext(): ExecuteContext {
    return {
      updateTime: 0,
    };
  }

  updatedControllerContext(): ExecuteContext {
    const controllerContext = this.controllerContext;
    controllerContext.updateTime = performance.now();
    return controllerContext;
  }

  get powerFlags(): ControllerFlags {
    return 0;
  }

  protected onPower(): void {
    this.powerRootControllers();
  }

  protected powerRootControllers(): void {
    const rootControllers = this.rootControllers;
    for (let i = 0, n = rootControllers.length; i < n; i += 1) {
      const rootController = rootControllers[i]!;
      if (!rootController.isPowered()) {
        this.powerRootController(rootController);
      }
    }
  }

  protected powerRootController(rootController: C): void {
    rootController.cascadePower();
    rootController.requireUpdate(this.powerFlags);
  }

  protected onUnpower(): void {
    this.cancelUpdate();
    this.updateDelay = ExecuteManager.MinUpdateDelay;
    this.unpowerRootControllers();
  }

  protected unpowerRootControllers(): void {
    const rootControllers = this.rootControllers;
    for (let i = 0, n = rootControllers.length; i < n; i += 1) {
      const rootController = rootControllers[i]!;
      if (rootController.isPowered()) {
        this.unpowerRootController(rootController);
      }
    }
  }

  protected unpowerRootController(rootController: C): void {
    rootController.cascadeUnpower();
  }

  readonly rootFlags!: ControllerFlags;

  /** @hidden */
  setRootFlags(rootFlags: ControllerFlags): void {
    Object.defineProperty(this, "rootFlags", {
      value: rootFlags,
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
  compileTimer: number;

  /** @hidden */
  executeTimer: number;

  /** @hidden */
  updateDelay: number;

  protected needsUpdate(targetController: Controller, updateFlags: ControllerFlags, immediate: boolean): ControllerFlags {
    return updateFlags;
  }

  requestUpdate(targetController: Controller, updateFlags: ControllerFlags, immediate: boolean): void {
    updateFlags = this.needsUpdate(targetController, updateFlags, immediate);
    let deltaUpdateFlags = this.rootFlags & ~updateFlags & Controller.UpdateMask;
    if ((updateFlags & Controller.CompileMask) !== 0) {
      deltaUpdateFlags |= Controller.NeedsCompile;
    }
    if ((updateFlags & Controller.ExecuteMask) !== 0) {
      deltaUpdateFlags |= Controller.NeedsExecute;
    }
    if (deltaUpdateFlags !== 0 || immediate) {
      this.setRootFlags(this.rootFlags | deltaUpdateFlags);
      if (immediate && this.updateDelay <= ExecuteManager.MaxCompileInterval
          && (this.rootFlags & (Controller.TraversingFlag | Controller.ImmediateFlag)) === 0) {
        this.runImmediatePass();
      } else {
        this.scheduleUpdate();
      }
    }
  }

  protected scheduleUpdate(): void {
    const updateFlags = this.rootFlags;
    if (this.compileTimer === 0 && this.executeTimer === 0
        && (updateFlags & Controller.UpdatingMask) === 0
        && (updateFlags & Controller.UpdateMask) !== 0) {
      this.compileTimer = setTimeout(this.runCompilePass, this.updateDelay) as any;
    }
  }

  protected cancelUpdate(): void {
    if (this.compileTimer !== 0) {
      clearTimeout(this.compileTimer);
      this.compileTimer = 0;
    }
    if (this.executeTimer !== 0) {
      clearTimeout(this.executeTimer);
      this.executeTimer = 0;
    }
  }

  protected runImmediatePass(): void {
    this.setRootFlags(this.rootFlags | Controller.ImmediateFlag);
    try {
      if ((this.rootFlags & Controller.CompileMask) !== 0) {
        this.cancelUpdate();
        this.runCompilePass(true);
      }
      if ((this.rootFlags & Controller.ExecuteMask) !== 0
          && this.updateDelay <= ExecuteManager.MaxCompileInterval) {
        this.cancelUpdate();
        this.runExecutePass(true);
      }
    } finally {
      this.setRootFlags(this.rootFlags & ~Controller.ImmediateFlag);
    }
  }

  protected runCompilePass(immediate: boolean = false): void {
    const rootControllers = this.rootControllers;
    this.setRootFlags(this.rootFlags & ~Controller.CompileMask | (Controller.TraversingFlag | Controller.CompilingFlag));
    try {
      const t0 = performance.now();
      const controllerContext = this.controllerContext;
      controllerContext.updateTime = t0;

      for (let i = 0; i < rootControllers.length; i += 1) {
        const rootController = rootControllers[i]!;
        if ((rootController.controllerFlags & Controller.CompileMask) !== 0) {
          rootController.cascadeCompile(0, controllerContext);
        }
      }

      const t1 = performance.now();
      let compileDelay = Math.max(ExecuteManager.MinCompileInterval, this.updateDelay);
      if (t1 - t0 > compileDelay) {
        this.updateDelay = Math.min(Math.max(2, this.updateDelay * 2), ExecuteManager.MaxUpdateDelay);
      } else {
        this.updateDelay = Math.min(ExecuteManager.MinUpdateDelay, this.updateDelay / 2);
      }

      this.cancelUpdate();
      if ((this.rootFlags & Controller.ExecuteMask) !== 0) {
        this.executeTimer = setTimeout(this.runExecutePass, ExecuteManager.MinExecuteInterval) as any;
      } else if ((this.rootFlags & Controller.CompileMask) !== 0) {
        if (immediate) {
          compileDelay = Math.max(ExecuteManager.MaxCompileInterval, compileDelay);
        }
        this.compileTimer = setTimeout(this.runCompilePass, compileDelay) as any;
      }
    } finally {
      this.setRootFlags(this.rootFlags & ~(Controller.TraversingFlag | Controller.CompilingFlag));
    }
  }

  protected runExecutePass(immediate: boolean = false): void {
    const rootControllers = this.rootControllers;
    this.setRootFlags(this.rootFlags & ~Controller.ExecuteMask | (Controller.TraversingFlag | Controller.ExecutingFlag));
    try {
      const time = performance.now();
      const controllerContext = this.controllerContext;
      controllerContext.updateTime = time;

      for (let i = 0; i < rootControllers.length; i += 1) {
        const rootController = rootControllers[i]!;
        if ((rootController.controllerFlags & Controller.ExecuteMask) !== 0) {
          rootController.cascadeExecute(0, controllerContext);
        }
      }

      this.cancelUpdate();
      if ((this.rootFlags & Controller.CompileMask) !== 0) {
        let compileDelay = this.updateDelay;
        if (immediate) {
          compileDelay = Math.max(ExecuteManager.MaxCompileInterval, compileDelay);
        }
        this.compileTimer = setTimeout(this.runCompilePass, compileDelay) as any;
      } else if ((this.rootFlags & Controller.ExecuteMask) !== 0) {
        this.executeTimer = setTimeout(this.runExecutePass, ExecuteManager.MaxExecuteInterval) as any;
      }
    } finally {
      this.setRootFlags(this.rootFlags & ~(Controller.TraversingFlag | Controller.ExecutingFlag));
    }
  }

  override readonly controllerManagerObservers!: ReadonlyArray<ExecuteManagerObserver>;

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

  protected override onInsertRootController(rootController: C): void {
    super.onInsertRootController(rootController);
    this.requestUpdate(rootController, rootController.controllerFlags & Controller.UpdateMask, false);
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
  static global<C extends Controller>(): ExecuteManager<C> {
    return new ExecuteManager();
  }

  /** @hidden */
  static MinUpdateDelay: number = 0;
  /** @hidden */
  static MaxUpdateDelay: number = 167;
  /** @hidden */
  static MinCompileInterval: number = 12;
  /** @hidden */
  static MaxCompileInterval: number = 33;
  /** @hidden */
  static MinExecuteInterval: number = 4;
  /** @hidden */
  static MaxExecuteInterval: number = 16;
}
