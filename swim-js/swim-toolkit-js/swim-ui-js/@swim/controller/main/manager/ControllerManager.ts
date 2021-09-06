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

import {Arrays} from "@swim/util";
import type {Controller} from "../Controller";
import type {ControllerManagerObserverType, ControllerManagerObserver} from "./ControllerManagerObserver";

export abstract class ControllerManager<C extends Controller = Controller> {
  constructor() {
    Object.defineProperty(this, "rootControllers", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "controllerManagerObservers", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
  }

  readonly controllerManagerObservers!: ReadonlyArray<ControllerManagerObserver>;

  addControllerManagerObserver(controllerManagerObserver: ControllerManagerObserverType<this>): void {
    const oldControllerManagerObservers = this.controllerManagerObservers;
    const newControllerManagerObservers = Arrays.inserted(controllerManagerObserver, oldControllerManagerObservers);
    if (oldControllerManagerObservers !== newControllerManagerObservers) {
      this.willAddControllerManagerObserver(controllerManagerObserver);
      Object.defineProperty(this, "controllerManagerObservers", {
        value: newControllerManagerObservers,
        enumerable: true,
        configurable: true,
      });
      this.onAddControllerManagerObserver(controllerManagerObserver);
      this.didAddControllerManagerObserver(controllerManagerObserver);
    }
  }

  protected willAddControllerManagerObserver(controllerManagerObserver: ControllerManagerObserverType<this>): void {
    // hook
  }

  protected onAddControllerManagerObserver(controllerManagerObserver: ControllerManagerObserverType<this>): void {
    // hook
  }

  protected didAddControllerManagerObserver(controllerManagerObserver: ControllerManagerObserverType<this>): void {
    // hook
  }

  removeControllerManagerObserver(controllerManagerObserver: ControllerManagerObserverType<this>): void {
    const oldControllerManagerObservers = this.controllerManagerObservers;
    const newControllerManagerObservers = Arrays.removed(controllerManagerObserver, oldControllerManagerObservers);
    if (oldControllerManagerObservers !== newControllerManagerObservers) {
      this.willRemoveControllerManagerObserver(controllerManagerObserver);
      Object.defineProperty(this, "controllerManagerObservers", {
        value: newControllerManagerObservers,
        enumerable: true,
        configurable: true,
      });
      this.onRemoveControllerManagerObserver(controllerManagerObserver);
      this.didRemoveControllerManagerObserver(controllerManagerObserver);
    }
  }

  protected willRemoveControllerManagerObserver(controllerManagerObserver: ControllerManagerObserverType<this>): void {
    // hook
  }

  protected onRemoveControllerManagerObserver(controllerManagerObserver: ControllerManagerObserverType<this>): void {
    // hook
  }

  protected didRemoveControllerManagerObserver(controllerManagerObserver: ControllerManagerObserverType<this>): void {
    // hook
  }

  protected willObserve<T>(callback: (this: this, controllerManagerObserver: ControllerManagerObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const controllerManagerObservers = this.controllerManagerObservers;
    for (let i = 0, n = controllerManagerObservers.length; i < n; i += 1) {
      const controllerManagerObserver = controllerManagerObservers[i];
      result = callback.call(this, controllerManagerObserver as ControllerManagerObserverType<this>) as T | undefined;
      if (result !== void 0) {
        return result;
      }
    }
    return result;
  }

  protected didObserve<T>(callback: (this: this, controllerManagerObserver: ControllerManagerObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const controllerManagerObservers = this.controllerManagerObservers;
    for (let i = 0, n = controllerManagerObservers.length; i < n; i += 1) {
      const controllerManagerObserver = controllerManagerObservers[i];
      result = callback.call(this, controllerManagerObserver as ControllerManagerObserverType<this>) as T | undefined;
      if (result !== void 0) {
        return result;
      }
    }
    return result;
  }

  isAttached(): boolean {
    return this.rootControllers.length !== 0;
  }

  protected willAttach(): void {
    const controllerManagerObservers = this.controllerManagerObservers;
    for (let i = 0, n = controllerManagerObservers.length; i < n; i += 1) {
      const controllerManagerObserver = controllerManagerObservers[i]!;
      if (controllerManagerObserver.controllerManagerWillAttach !== void 0) {
        controllerManagerObserver.controllerManagerWillAttach(this);
      }
    }
  }

  protected onAttach(): void {
    // hook
  }

  protected didAttach(): void {
    const controllerManagerObservers = this.controllerManagerObservers;
    for (let i = 0, n = controllerManagerObservers.length; i < n; i += 1) {
      const controllerManagerObserver = controllerManagerObservers[i]!;
      if (controllerManagerObserver.controllerManagerDidAttach !== void 0) {
        controllerManagerObserver.controllerManagerDidAttach(this);
      }
    }
  }

  protected willDetach(): void {
    const controllerManagerObservers = this.controllerManagerObservers;
    for (let i = 0, n = controllerManagerObservers.length; i < n; i += 1) {
      const controllerManagerObserver = controllerManagerObservers[i]!;
      if (controllerManagerObserver.controllerManagerWillDetach !== void 0) {
        controllerManagerObserver.controllerManagerWillDetach(this);
      }
    }
  }

  protected onDetach(): void {
    // hook
  }

  protected didDetach(): void {
    const controllerManagerObservers = this.controllerManagerObservers;
    for (let i = 0, n = controllerManagerObservers.length; i < n; i += 1) {
      const controllerManagerObserver = controllerManagerObservers[i]!;
      if (controllerManagerObserver.controllerManagerDidDetach !== void 0) {
        controllerManagerObserver.controllerManagerDidDetach(this);
      }
    }
  }

  readonly rootControllers!: ReadonlyArray<C>;

  insertRootController(rootController: C): void {
    const oldRootControllers = this.rootControllers;
    const newRootControllers = Arrays.inserted(rootController, oldRootControllers);
    if (oldRootControllers !== newRootControllers) {
      const needsAttach = oldRootControllers.length === 0;
      if (needsAttach) {
        this.willAttach();
      }
      this.willInsertRootController(rootController);
      Object.defineProperty(this, "rootControllers", {
        value: newRootControllers,
        enumerable: true,
        configurable: true,
      });
      if (needsAttach) {
        this.onAttach();
      }
      this.onInsertRootController(rootController);
      this.didInsertRootController(rootController);
      if (needsAttach) {
        this.didAttach();
      }
    }
  }

  protected willInsertRootController(rootController: C): void {
    const controllerManagerObservers = this.controllerManagerObservers;
    for (let i = 0, n = controllerManagerObservers.length; i < n; i += 1) {
      const controllerManagerObserver = controllerManagerObservers[i]!;
      if (controllerManagerObserver.controllerManagerWillInsertRootController !== void 0) {
        controllerManagerObserver.controllerManagerWillInsertRootController(rootController, this);
      }
    }
  }

  protected onInsertRootController(rootController: C): void {
    // hook
  }

  protected didInsertRootController(rootController: C): void {
    const controllerManagerObservers = this.controllerManagerObservers;
    for (let i = 0, n = controllerManagerObservers.length; i < n; i += 1) {
      const controllerManagerObserver = controllerManagerObservers[i]!;
      if (controllerManagerObserver.controllerManagerDidInsertRootController !== void 0) {
        controllerManagerObserver.controllerManagerDidInsertRootController(rootController, this);
      }
    }
  }

  removeRootController(rootController: C): void {
    const oldRootControllers = this.rootControllers;
    const newRootControllers = Arrays.removed(rootController, oldRootControllers);
    if (oldRootControllers !== newRootControllers) {
      const needsDetach = oldRootControllers.length === 1;
      if (needsDetach) {
        this.willDetach();
      }
      this.willRemoveRootController(rootController);
      Object.defineProperty(this, "rootControllers", {
        value: newRootControllers,
        enumerable: true,
        configurable: true,
      });
      if (needsDetach) {
        this.onDetach();
      }
      this.onRemoveRootController(rootController);
      this.didRemoveRootController(rootController);
      if (needsDetach) {
        this.didDetach();
      }
    }
  }

  protected willRemoveRootController(rootController: C): void {
    const controllerManagerObservers = this.controllerManagerObservers;
    for (let i = 0, n = controllerManagerObservers.length; i < n; i += 1) {
      const controllerManagerObserver = controllerManagerObservers[i]!;
      if (controllerManagerObserver.controllerManagerWillRemoveRootController !== void 0) {
        controllerManagerObserver.controllerManagerWillRemoveRootController(rootController, this);
      }
    }
  }

  protected onRemoveRootController(rootController: C): void {
    // hook
  }

  protected didRemoveRootController(rootController: C): void {
    this.didObserve(function (controllerManagerObserver: ControllerManagerObserver): void {
      if (controllerManagerObserver.controllerManagerDidRemoveRootController !== void 0) {
        controllerManagerObserver.controllerManagerDidRemoveRootController(rootController, this);
      }
    });
    const controllerManagerObservers = this.controllerManagerObservers;
    for (let i = 0, n = controllerManagerObservers.length; i < n; i += 1) {
      const controllerManagerObserver = controllerManagerObservers[i]!;
      if (controllerManagerObserver.controllerManagerDidRemoveRootController !== void 0) {
        controllerManagerObserver.controllerManagerDidRemoveRootController(rootController, this);
      }
    }
  }
}
