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

import {Controller} from "../Controller";
import {ControllerManager} from "../manager/ControllerManager";
import type {StorageManagerObserver} from "./StorageManagerObserver";

export abstract class StorageManager<C extends Controller = Controller> extends ControllerManager<C> {
  abstract get(key: string): string | undefined;

  abstract set(key: string, newValue: string | undefined): string | undefined;

  protected willSet(key: string, newValue: string | undefined, oldValue: string | undefined): void {
    const controllerManagerObservers = this.controllerManagerObservers;
    for (let i = 0, n = controllerManagerObservers.length; i < n; i += 1) {
      const controllerManagerObserver = controllerManagerObservers[i]!;
      if (controllerManagerObserver.storageManagerWillSet !== void 0) {
        controllerManagerObserver.storageManagerWillSet(key, newValue, oldValue, this);
      }
    }
  }

  protected onSet(key: string, newValue: string | undefined, oldValue: string | undefined): void {
    const rootControllers = this.rootControllers;
    for (let i = 0, n = rootControllers.length; i < n; i += 1) {
      rootControllers[i]!.requireUpdate(Controller.NeedsRevise);
    }
  }

  protected didSet(key: string, newValue: string | undefined, oldValue: string | undefined): void {
    const controllerManagerObservers = this.controllerManagerObservers;
    for (let i = 0, n = controllerManagerObservers.length; i < n; i += 1) {
      const controllerManagerObserver = controllerManagerObservers[i]!;
      if (controllerManagerObserver.storageManagerDidSet !== void 0) {
        controllerManagerObserver.storageManagerDidSet(key, newValue, oldValue, this);
      }
    }
  }

  abstract clear(): void;

  protected willClear(): void {
    const controllerManagerObservers = this.controllerManagerObservers;
    for (let i = 0, n = controllerManagerObservers.length; i < n; i += 1) {
      const controllerManagerObserver = controllerManagerObservers[i]!;
      if (controllerManagerObserver.storageManagerWillClear !== void 0) {
        controllerManagerObserver.storageManagerWillClear(this);
      }
    }
  }

  protected onClear(): void {
    const rootControllers = this.rootControllers;
    for (let i = 0, n = rootControllers.length; i < n; i += 1) {
      rootControllers[i]!.requireUpdate(Controller.NeedsRevise);
    }
  }

  protected didClear(): void {
    const controllerManagerObservers = this.controllerManagerObservers;
    for (let i = 0, n = controllerManagerObservers.length; i < n; i += 1) {
      const controllerManagerObserver = controllerManagerObservers[i]!;
      if (controllerManagerObserver.storageManagerDidClear !== void 0) {
        controllerManagerObserver.storageManagerDidClear(this);
      }
    }
  }

  override readonly controllerManagerObservers!: ReadonlyArray<StorageManagerObserver>;
}
