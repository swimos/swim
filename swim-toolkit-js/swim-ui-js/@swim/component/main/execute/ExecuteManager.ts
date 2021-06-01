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
import {ComponentFlags, Component} from "../Component";
import {ComponentManager} from "../manager/ComponentManager";
import type {ExecuteContext} from "./ExecuteContext";
import type {ExecuteManagerObserver} from "./ExecuteManagerObserver";

export class ExecuteManager<C extends Component = Component> extends ComponentManager<C> {
  constructor() {
    super();
    Object.defineProperty(this, "componentContext", {
      value: this.initComponentContext(),
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

  readonly componentContext!: ExecuteContext;

  protected initComponentContext(): ExecuteContext {
    return {
      updateTime: 0,
    };
  }

  updatedComponentContext(): ExecuteContext {
    const componentContext = this.componentContext;
    componentContext.updateTime = performance.now();
    return componentContext;
  }

  get powerFlags(): ComponentFlags {
    return 0;
  }

  protected onPower(): void {
    this.powerRootComponents();
  }

  protected powerRootComponents(): void {
    const rootComponents = this.rootComponents;
    for (let i = 0, n = rootComponents.length; i < n; i += 1) {
      const rootComponent = rootComponents[i]!;
      if (!rootComponent.isPowered()) {
        this.powerRootComponent(rootComponent);
      }
    }
  }

  protected powerRootComponent(rootComponent: C): void {
    rootComponent.cascadePower();
    rootComponent.requireUpdate(this.powerFlags);
  }

  protected onUnpower(): void {
    this.cancelUpdate();
    this.updateDelay = ExecuteManager.MinUpdateDelay;
    this.unpowerRootComponents();
  }

  protected unpowerRootComponents(): void {
    const rootComponents = this.rootComponents;
    for (let i = 0, n = rootComponents.length; i < n; i += 1) {
      const rootComponent = rootComponents[i]!;
      if (rootComponent.isPowered()) {
        this.unpowerRootComponent(rootComponent);
      }
    }
  }

  protected unpowerRootComponent(rootComponent: C): void {
    rootComponent.cascadeUnpower();
  }

  readonly rootFlags!: ComponentFlags;

  /** @hidden */
  setRootFlags(rootFlags: ComponentFlags): void {
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

  requestUpdate(targetComponent: Component, updateFlags: ComponentFlags, immediate: boolean): void {
    this.willRequestUpdate(targetComponent, updateFlags, immediate);
    if ((updateFlags & Component.CompileMask) !== 0) {
      this.setRootFlags(this.rootFlags | Component.NeedsCompile);
    }
    if ((updateFlags & Component.ExecuteMask) !== 0) {
      this.setRootFlags(this.rootFlags | Component.NeedsExecute);
    }
    if ((this.rootFlags & Component.UpdateMask) !== 0) {
      this.onRequestUpdate(targetComponent, updateFlags, immediate);
      if (immediate && this.updateDelay <= ExecuteManager.MaxCompileInterval
          && (this.rootFlags & (Component.TraversingFlag | Component.ImmediateFlag)) === 0) {
        this.runImmediatePass();
      } else {
        this.scheduleUpdate();
      }
    }
    this.didRequestUpdate(targetComponent, updateFlags, immediate);
  }

  protected willRequestUpdate(targetComponent: Component, updateFlags: ComponentFlags, immediate: boolean): void {
    // hook
  }

  protected onRequestUpdate(targetComponent: Component, updateFlags: ComponentFlags, immediate: boolean): void {
    // hook
  }

  protected didRequestUpdate(targetComponent: Component, updateFlags: ComponentFlags, immediate: boolean): void {
    // hook
  }

  protected scheduleUpdate(): void {
    const updateFlags = this.rootFlags;
    if (this.compileTimer === 0 && this.executeTimer === 0
        && (updateFlags & Component.UpdatingMask) === 0
        && (updateFlags & Component.UpdateMask) !== 0) {
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
    this.setRootFlags(this.rootFlags | Component.ImmediateFlag);
    try {
      if ((this.rootFlags & Component.CompileMask) !== 0) {
        this.cancelUpdate();
        this.runCompilePass(true);
      }
      if ((this.rootFlags & Component.ExecuteMask) !== 0
          && this.updateDelay <= ExecuteManager.MaxCompileInterval) {
        this.cancelUpdate();
        this.runExecutePass(true);
      }
    } finally {
      this.setRootFlags(this.rootFlags & ~Component.ImmediateFlag);
    }
  }

  protected runCompilePass(immediate: boolean = false): void {
    const rootComponents = this.rootComponents;
    this.setRootFlags(this.rootFlags & ~Component.CompileMask | (Component.TraversingFlag | Component.CompilingFlag));
    try {
      const t0 = performance.now();
      const componentContext = this.componentContext;
      componentContext.updateTime = t0;

      for (let i = 0; i < rootComponents.length; i += 1) {
        const rootComponent = rootComponents[i]!;
        if ((rootComponent.componentFlags & Component.CompileMask) !== 0) {
          rootComponent.cascadeCompile(0, componentContext);
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
      if ((this.rootFlags & Component.ExecuteMask) !== 0) {
        this.executeTimer = setTimeout(this.runExecutePass, ExecuteManager.MinExecuteInterval) as any;
      } else if ((this.rootFlags & Component.CompileMask) !== 0) {
        if (immediate) {
          compileDelay = Math.max(ExecuteManager.MaxCompileInterval, compileDelay);
        }
        this.compileTimer = setTimeout(this.runCompilePass, compileDelay) as any;
      }
    } finally {
      this.setRootFlags(this.rootFlags & ~(Component.TraversingFlag | Component.CompilingFlag));
    }
  }

  protected runExecutePass(immediate: boolean = false): void {
    const rootComponents = this.rootComponents;
    this.setRootFlags(this.rootFlags & ~Component.ExecuteMask | (Component.TraversingFlag | Component.ExecutingFlag));
    try {
      const time = performance.now();
      const componentContext = this.componentContext;
      componentContext.updateTime = time;

      for (let i = 0; i < rootComponents.length; i += 1) {
        const rootComponent = rootComponents[i]!;
        if ((rootComponent.componentFlags & Component.ExecuteMask) !== 0) {
          rootComponent.cascadeExecute(0, componentContext);
        }
      }

      this.cancelUpdate();
      if ((this.rootFlags & Component.CompileMask) !== 0) {
        let compileDelay = this.updateDelay;
        if (immediate) {
          compileDelay = Math.max(ExecuteManager.MaxCompileInterval, compileDelay);
        }
        this.compileTimer = setTimeout(this.runCompilePass, compileDelay) as any;
      } else if ((this.rootFlags & Component.ExecuteMask) !== 0) {
        this.executeTimer = setTimeout(this.runExecutePass, ExecuteManager.MaxExecuteInterval) as any;
      }
    } finally {
      this.setRootFlags(this.rootFlags & ~(Component.TraversingFlag | Component.ExecutingFlag));
    }
  }

  override readonly componentManagerObservers!: ReadonlyArray<ExecuteManagerObserver>;

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

  protected override onInsertRootComponent(rootComponent: C): void {
    super.onInsertRootComponent(rootComponent);
    this.requestUpdate(rootComponent, rootComponent.componentFlags & Component.UpdateMask, false);
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
  static global<C extends Component>(): ExecuteManager<C> {
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
