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

import {Component} from "../Component";
import {ComponentManager} from "../manager/ComponentManager";
import type {StorageManagerObserver} from "./StorageManagerObserver";

export abstract class StorageManager<C extends Component = Component> extends ComponentManager<C> {
  abstract get(key: string): string | undefined;

  abstract set(key: string, newValue: string | undefined): string | undefined;

  protected willSet(key: string, newValue: string | undefined, oldValue: string | undefined): void {
    const componentManagerObservers = this.componentManagerObservers;
    for (let i = 0, n = componentManagerObservers.length; i < n; i += 1) {
      const componentManagerObserver = componentManagerObservers[i]!;
      if (componentManagerObserver.storageManagerWillSet !== void 0) {
        componentManagerObserver.storageManagerWillSet(key, newValue, oldValue, this);
      }
    }
  }

  protected onSet(key: string, newValue: string | undefined, oldValue: string | undefined): void {
    const rootComponents = this.rootComponents;
    for (let i = 0, n = rootComponents.length; i < n; i += 1) {
      rootComponents[i]!.requireUpdate(Component.NeedsRevise);
    }
  }

  protected didSet(key: string, newValue: string | undefined, oldValue: string | undefined): void {
    const componentManagerObservers = this.componentManagerObservers;
    for (let i = 0, n = componentManagerObservers.length; i < n; i += 1) {
      const componentManagerObserver = componentManagerObservers[i]!;
      if (componentManagerObserver.storageManagerDidSet !== void 0) {
        componentManagerObserver.storageManagerDidSet(key, newValue, oldValue, this);
      }
    }
  }

  abstract clear(): void;

  protected willClear(): void {
    const componentManagerObservers = this.componentManagerObservers;
    for (let i = 0, n = componentManagerObservers.length; i < n; i += 1) {
      const componentManagerObserver = componentManagerObservers[i]!;
      if (componentManagerObserver.storageManagerWillClear !== void 0) {
        componentManagerObserver.storageManagerWillClear(this);
      }
    }
  }

  protected onClear(): void {
    const rootComponents = this.rootComponents;
    for (let i = 0, n = rootComponents.length; i < n; i += 1) {
      rootComponents[i]!.requireUpdate(Component.NeedsRevise);
    }
  }

  protected didClear(): void {
    const componentManagerObservers = this.componentManagerObservers;
    for (let i = 0, n = componentManagerObservers.length; i < n; i += 1) {
      const componentManagerObserver = componentManagerObservers[i]!;
      if (componentManagerObserver.storageManagerDidClear !== void 0) {
        componentManagerObserver.storageManagerDidClear(this);
      }
    }
  }

  declare readonly componentManagerObservers: ReadonlyArray<StorageManagerObserver>;
}
