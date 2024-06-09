// Copyright 2015-2024 Nstream, inc.
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

import type {Mutable} from "@swim/util";
import type {Class} from "@swim/util";
import {EventHandler} from "@swim/component";
import type {ServiceObserver} from "@swim/component";
import {Service} from "@swim/component";
import type {ControllerFlags} from "./Controller";
import {Controller} from "./Controller";
import {ControllerSet} from "./ControllerSet";

/** @public */
export interface ExecutorServiceObserver<S extends ExecutorService = ExecutorService> extends ServiceObserver<S> {
  serviceWillAttachRoot?(rootController: Controller, service: S): void;

  serviceDidAttachRoot?(rootController: Controller, service: S): void;

  serviceWillDetachRoot?(rootController: Controller, service: S): void;

  serviceDidDetachRoot?(rootController: Controller, service: S): void;
}

/** @public */
export class ExecutorService extends Service {
  constructor() {
    super();
    this.updateFlags = 0;
    this.updateTime = performance.now();
    this.updateDelay = ExecutorService.MinUpdateDelay;
    this.compileTimer = 0;
    this.executeTimer = 0;

    this.runCompilePass = this.runCompilePass.bind(this);
    this.runExecutePass = this.runExecutePass.bind(this);
  }

  declare readonly observerType?: Class<ExecutorServiceObserver>;

  @ControllerSet({
    initController(rootController: Controller): void {
      this.owner.requestUpdate(rootController, rootController.flags & Controller.UpdateMask, false);
    },
    willAttachController(rootController: Controller): void {
      this.owner.callObservers("serviceWillAttachRoot", rootController, this.owner);
    },
    didAttachController(rootController: Controller): void {
      this.owner.callObservers("serviceDidAttachRoot", rootController, this.owner);
    },
    willDetachController(rootController: Controller): void {
      this.owner.callObservers("serviceWillDetachRoot", rootController, this.owner);
    },
    didDetachController(rootController: Controller): void {
      this.owner.callObservers("serviceDidDetachRoot", rootController, this.owner);
    },
  })
  readonly roots!: ControllerSet<this, Controller>;

  /** @internal */
  readonly updateFlags: ControllerFlags;

  /** @internal */
  setUpdateFlags(updateFlags: ControllerFlags): void {
    (this as Mutable<this>).updateFlags = updateFlags;
  }

  readonly updateTime: number;

  /** @internal */
  updateDelay: number;

  protected needsUpdate(updateFlags: ControllerFlags, immediate: boolean): ControllerFlags {
    return updateFlags;
  }

  requestUpdate(targetController: Controller, updateFlags: ControllerFlags, immediate: boolean): void {
    updateFlags = this.needsUpdate(updateFlags, immediate);
    let deltaUpdateFlags = this.updateFlags & ~updateFlags & Controller.UpdateMask;
    if ((updateFlags & Controller.CompileMask) !== 0) {
      deltaUpdateFlags |= Controller.NeedsCompile;
    }
    if ((updateFlags & Controller.ExecuteMask) !== 0) {
      deltaUpdateFlags |= Controller.NeedsExecute;
    }
    this.setUpdateFlags(this.updateFlags | deltaUpdateFlags);
    if (immediate && (this.updateFlags & (Controller.CompilingFlag | Controller.ExecutingFlag)) === 0 && this.updateDelay <= ExecutorService.MaxCompileInterval) {
      this.runImmediatePass();
    } else {
      this.scheduleUpdate();
    }
  }

  protected scheduleUpdate(): void {
    const flags = this.updateFlags;
    if ((flags & Controller.CompilingFlag) === 0 && (flags & Controller.CompileMask) !== 0) {
      this.scheduleCompilePass(this.updateDelay);
    } else if ((flags & Controller.ExecutingFlag) === 0 && (flags & Controller.ExecuteMask) !== 0) {
      this.scheduleExecutePass(ExecutorService.MinExecuteInterval);
    }
  }

  protected cancelUpdate(): void {
    this.cancelCompilePass();
    this.cancelExecutePass();
  }

  protected runImmediatePass(): void {
    if ((this.updateFlags & Controller.CompileMask) !== 0) {
      this.cancelUpdate();
      this.runCompilePass(true);
    }
    if ((this.updateFlags & Controller.ExecuteMask) !== 0 && this.updateDelay <= ExecutorService.MaxCompileInterval) {
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
    if (!immediate) {
      this.compileTimer = 0;
    }
    this.setUpdateFlags(this.updateFlags & ~Controller.CompileMask | Controller.CompilingFlag);
    try {
      const t0 = performance.now();
      (this as Mutable<this>).updateTime = t0;

      const rootControllers = this.roots.controllers;
      for (const controllerId in rootControllers) {
        const rootController = rootControllers[controllerId]!;
        if ((rootController.flags & Controller.CompileMask) !== 0) {
          rootController.cascadeCompile(0);
        }
      }

      const t1 = performance.now();
      let compileDelay = Math.max(ExecutorService.MinCompileInterval, this.updateDelay);
      if (t1 - t0 > compileDelay) {
        this.updateDelay = Math.min(Math.max(2, this.updateDelay * 2), ExecutorService.MaxUpdateDelay);
      } else {
        this.updateDelay = Math.min(ExecutorService.MinUpdateDelay, this.updateDelay / 2);
      }

      this.cancelCompilePass();
      if ((this.updateFlags & Controller.ExecuteMask) !== 0) {
        this.scheduleExecutePass(ExecutorService.MinExecuteInterval);
      } else if ((this.updateFlags & Controller.CompileMask) !== 0) {
        if (immediate) {
          compileDelay = Math.max(ExecutorService.MaxCompileInterval, compileDelay);
        }
        this.cancelExecutePass();
        this.scheduleCompilePass(compileDelay);
      }
    } finally {
      this.setUpdateFlags(this.updateFlags & ~Controller.CompilingFlag);
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
    if (!immediate) {
      this.executeTimer = 0;
    }
    this.setUpdateFlags(this.updateFlags & ~Controller.ExecuteMask | Controller.ExecutingFlag);
    try {
      const time = performance.now();
      (this as Mutable<this>).updateTime = time;

      const rootControllers = this.roots.controllers;
      for (const controllerId in rootControllers) {
        const rootController = rootControllers[controllerId]!;
        if ((rootController.flags & Controller.ExecuteMask) !== 0) {
          rootController.cascadeExecute(0);
        }
      }

      this.cancelExecutePass();
      if ((this.updateFlags & Controller.CompileMask) !== 0) {
        let compileDelay = this.updateDelay;
        if (immediate) {
          compileDelay = Math.max(ExecutorService.MaxCompileInterval, compileDelay);
        }
        this.scheduleCompilePass(compileDelay);
      } else if ((this.updateFlags & Controller.ExecuteMask) !== 0) {
        this.cancelCompilePass();
        this.scheduleExecutePass(ExecutorService.MaxExecuteInterval);
      }
    } finally {
      this.setUpdateFlags(this.updateFlags & ~Controller.ExecutingFlag);
    }
  }

  get powerFlags(): ControllerFlags {
    return 0;
  }

  power(): void {
    const rootControllers = this.roots.controllers;
    for (const controllerId in rootControllers) {
      const rootController = rootControllers[controllerId]!;
      rootController.requireUpdate(this.powerFlags);
    }
  }

  unpower(): void {
    this.cancelUpdate();
    this.updateDelay = ExecutorService.MinUpdateDelay;
  }

  @EventHandler({
    eventType: "visibilitychange",
    target: typeof document !== "undefined" ? document : null,
    handle(event: Event): void {
      if (document.visibilityState === "visible") {
        this.owner.power();
      } else {
        this.owner.unpower();
      }
    },
  })
  readonly visibilityChange!: EventHandler<this>;

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
