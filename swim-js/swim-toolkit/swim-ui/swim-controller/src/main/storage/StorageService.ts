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

import {Class, Lazy} from "@swim/util";
import {Service} from "@swim/component";
import type {StorageServiceObserver} from "./StorageServiceObserver";
import {WebStorageService} from "../"; // forward import
import {EphemeralStorageService} from "../"; // forward import
import {Controller} from "../"; // forward import

/** @public */
export abstract class StorageService<C extends Controller = Controller> extends Service<C> {
  override readonly observerType?: Class<StorageServiceObserver<C>>;

  abstract get(key: string): string | undefined;

  abstract set(key: string, newValue: string | undefined): string | undefined;

  protected willSet(key: string, newValue: string | undefined, oldValue: string | undefined): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillStore !== void 0) {
        observer.serviceWillStore(key, newValue, oldValue, this);
      }
    }
  }

  protected onSet(key: string, newValue: string | undefined, oldValue: string | undefined): void {
    const roots = this.roots;
    for (let i = 0, n = roots.length; i < n; i += 1) {
      roots[i]!.requireUpdate(Controller.NeedsRevise);
    }
  }

  protected didSet(key: string, newValue: string | undefined, oldValue: string | undefined): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceDidStore!== void 0) {
        observer.serviceDidStore(key, newValue, oldValue, this);
      }
    }
  }

  abstract clear(): void;

  protected willClear(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillClear !== void 0) {
        observer.serviceWillClear(this);
      }
    }
  }

  protected onClear(): void {
    const roots = this.roots;
    for (let i = 0, n = roots.length; i < n; i += 1) {
      roots[i]!.requireUpdate(Controller.NeedsRevise);
    }
  }

  protected didClear(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceDidClear !== void 0) {
        observer.serviceDidClear(this);
      }
    }
  }

  @Lazy
  static global<C extends Controller>(): StorageService<C> {
    let service: StorageService<C> | null = WebStorageService.local();
    if (service === null) {
      service = new EphemeralStorageService();
    }
    return service;
  }
}
