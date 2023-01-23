// Copyright 2015-2023 Swim.inc
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

import type {Class} from "@swim/util";
import {Service} from "@swim/component";
import type {StorageServiceObserver} from "./StorageServiceObserver";
import {WebStorageService} from "../"; // forward import
import {EphemeralStorageService} from "../"; // forward import

/** @public */
export abstract class StorageService extends Service {
  override readonly observerType?: Class<StorageServiceObserver>;

  abstract get(key: string): string | undefined;

  abstract set(key: string, newValue: string | undefined): string | undefined;

  protected willSet(key: string, newValue: string | undefined, oldValue: string | undefined): void {
    this.callObservers("serviceWillStore", key, newValue, oldValue, this);
  }

  protected onSet(key: string, newValue: string | undefined, oldValue: string | undefined): void {
    // hook
  }

  protected didSet(key: string, newValue: string | undefined, oldValue: string | undefined): void {
    this.callObservers("serviceDidStore", key, newValue, oldValue, this);
  }

  abstract clear(): void;

  protected willClear(): void {
    this.callObservers("serviceWillClear", this);
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillClear !== void 0) {
        observer.serviceWillClear(this);
      }
    }
  }

  protected onClear(): void {
    // hook
  }

  protected didClear(): void {
    this.callObservers("serviceDidClear", this);
  }

  static override create(): StorageService;
  static override create(): StorageService;
  static override create(): StorageService {
    let service: StorageService | null = WebStorageService.local();
    if (service === null) {
      service = new EphemeralStorageService();
    }
    return service;
  }
}
