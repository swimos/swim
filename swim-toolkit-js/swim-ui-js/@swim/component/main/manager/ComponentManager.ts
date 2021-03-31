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

import {Arrays} from "@swim/util";
import type {Component} from "../Component";
import type {ComponentManagerObserverType, ComponentManagerObserver} from "./ComponentManagerObserver";

export abstract class ComponentManager<C extends Component = Component> {
  constructor() {
    Object.defineProperty(this, "rootComponents", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "componentManagerObservers", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly componentManagerObservers: ReadonlyArray<ComponentManagerObserver>;

  addComponentManagerObserver(componentManagerObserver: ComponentManagerObserverType<this>): void {
    const oldComponentManagerObservers = this.componentManagerObservers;
    const newComponentManagerObservers = Arrays.inserted(componentManagerObserver, oldComponentManagerObservers);
    if (oldComponentManagerObservers !== newComponentManagerObservers) {
      this.willAddComponentManagerObserver(componentManagerObserver);
      Object.defineProperty(this, "componentManagerObservers", {
        value: newComponentManagerObservers,
        enumerable: true,
        configurable: true,
      });
      this.onAddComponentManagerObserver(componentManagerObserver);
      this.didAddComponentManagerObserver(componentManagerObserver);
    }
  }

  protected willAddComponentManagerObserver(componentManagerObserver: ComponentManagerObserverType<this>): void {
    // hook
  }

  protected onAddComponentManagerObserver(componentManagerObserver: ComponentManagerObserverType<this>): void {
    // hook
  }

  protected didAddComponentManagerObserver(componentManagerObserver: ComponentManagerObserverType<this>): void {
    // hook
  }

  removeComponentManagerObserver(componentManagerObserver: ComponentManagerObserverType<this>): void {
    const oldComponentManagerObservers = this.componentManagerObservers;
    const newComponentManagerObservers = Arrays.removed(componentManagerObserver, oldComponentManagerObservers);
    if (oldComponentManagerObservers !== newComponentManagerObservers) {
      this.willRemoveComponentManagerObserver(componentManagerObserver);
      Object.defineProperty(this, "componentManagerObservers", {
        value: newComponentManagerObservers,
        enumerable: true,
        configurable: true,
      });
      this.onRemoveComponentManagerObserver(componentManagerObserver);
      this.didRemoveComponentManagerObserver(componentManagerObserver);
    }
  }

  protected willRemoveComponentManagerObserver(componentManagerObserver: ComponentManagerObserverType<this>): void {
    // hook
  }

  protected onRemoveComponentManagerObserver(componentManagerObserver: ComponentManagerObserverType<this>): void {
    // hook
  }

  protected didRemoveComponentManagerObserver(componentManagerObserver: ComponentManagerObserverType<this>): void {
    // hook
  }

  protected willObserve<T>(callback: (this: this, componentManagerObserver: ComponentManagerObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const componentManagerObservers = this.componentManagerObservers;
    for (let i = 0, n = componentManagerObservers.length; i < n; i += 1) {
      const componentManagerObserver = componentManagerObservers[i];
      result = callback.call(this, componentManagerObserver as ComponentManagerObserverType<this>) as T | undefined;
      if (result !== void 0) {
        return result;
      }
    }
    return result;
  }

  protected didObserve<T>(callback: (this: this, componentManagerObserver: ComponentManagerObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const componentManagerObservers = this.componentManagerObservers;
    for (let i = 0, n = componentManagerObservers.length; i < n; i += 1) {
      const componentManagerObserver = componentManagerObservers[i];
      result = callback.call(this, componentManagerObserver as ComponentManagerObserverType<this>) as T | undefined;
      if (result !== void 0) {
        return result;
      }
    }
    return result;
  }

  isAttached(): boolean {
    return this.rootComponents.length !== 0;
  }

  protected willAttach(): void {
    const componentManagerObservers = this.componentManagerObservers;
    for (let i = 0, n = componentManagerObservers.length; i < n; i += 1) {
      const componentManagerObserver = componentManagerObservers[i]!;
      if (componentManagerObserver.componentManagerWillAttach !== void 0) {
        componentManagerObserver.componentManagerWillAttach(this);
      }
    }
  }

  protected onAttach(): void {
    // hook
  }

  protected didAttach(): void {
    const componentManagerObservers = this.componentManagerObservers;
    for (let i = 0, n = componentManagerObservers.length; i < n; i += 1) {
      const componentManagerObserver = componentManagerObservers[i]!;
      if (componentManagerObserver.componentManagerDidAttach !== void 0) {
        componentManagerObserver.componentManagerDidAttach(this);
      }
    }
  }

  protected willDetach(): void {
    const componentManagerObservers = this.componentManagerObservers;
    for (let i = 0, n = componentManagerObservers.length; i < n; i += 1) {
      const componentManagerObserver = componentManagerObservers[i]!;
      if (componentManagerObserver.componentManagerWillDetach !== void 0) {
        componentManagerObserver.componentManagerWillDetach(this);
      }
    }
  }

  protected onDetach(): void {
    // hook
  }

  protected didDetach(): void {
    const componentManagerObservers = this.componentManagerObservers;
    for (let i = 0, n = componentManagerObservers.length; i < n; i += 1) {
      const componentManagerObserver = componentManagerObservers[i]!;
      if (componentManagerObserver.componentManagerDidDetach !== void 0) {
        componentManagerObserver.componentManagerDidDetach(this);
      }
    }
  }

  declare readonly rootComponents: ReadonlyArray<C>;

  insertRootComponent(rootComponent: C): void {
    const oldRootComponents = this.rootComponents;
    const newRootComponents = Arrays.inserted(rootComponent, oldRootComponents);
    if (oldRootComponents !== newRootComponents) {
      const needsAttach = oldRootComponents.length === 0;
      if (needsAttach) {
        this.willAttach();
      }
      this.willInsertRootComponent(rootComponent);
      Object.defineProperty(this, "rootComponents", {
        value: newRootComponents,
        enumerable: true,
        configurable: true,
      });
      if (needsAttach) {
        this.onAttach();
      }
      this.onInsertRootComponent(rootComponent);
      this.didInsertRootComponent(rootComponent);
      if (needsAttach) {
        this.didAttach();
      }
    }
  }

  protected willInsertRootComponent(rootComponent: C): void {
    const componentManagerObservers = this.componentManagerObservers;
    for (let i = 0, n = componentManagerObservers.length; i < n; i += 1) {
      const componentManagerObserver = componentManagerObservers[i]!;
      if (componentManagerObserver.componentManagerWillInsertRootComponent !== void 0) {
        componentManagerObserver.componentManagerWillInsertRootComponent(rootComponent, this);
      }
    }
  }

  protected onInsertRootComponent(rootComponent: C): void {
    // hook
  }

  protected didInsertRootComponent(rootComponent: C): void {
    const componentManagerObservers = this.componentManagerObservers;
    for (let i = 0, n = componentManagerObservers.length; i < n; i += 1) {
      const componentManagerObserver = componentManagerObservers[i]!;
      if (componentManagerObserver.componentManagerDidInsertRootComponent !== void 0) {
        componentManagerObserver.componentManagerDidInsertRootComponent(rootComponent, this);
      }
    }
  }

  removeRootComponent(rootComponent: C): void {
    const oldRootComponents = this.rootComponents;
    const newRootComponents = Arrays.removed(rootComponent, oldRootComponents);
    if (oldRootComponents !== newRootComponents) {
      const needsDetach = oldRootComponents.length === 1;
      if (needsDetach) {
        this.willDetach();
      }
      this.willRemoveRootComponent(rootComponent);
      Object.defineProperty(this, "rootComponents", {
        value: newRootComponents,
        enumerable: true,
        configurable: true,
      });
      if (needsDetach) {
        this.onDetach();
      }
      this.onRemoveRootComponent(rootComponent);
      this.didRemoveRootComponent(rootComponent);
      if (needsDetach) {
        this.didDetach();
      }
    }
  }

  protected willRemoveRootComponent(rootComponent: C): void {
    const componentManagerObservers = this.componentManagerObservers;
    for (let i = 0, n = componentManagerObservers.length; i < n; i += 1) {
      const componentManagerObserver = componentManagerObservers[i]!;
      if (componentManagerObserver.componentManagerWillRemoveRootComponent !== void 0) {
        componentManagerObserver.componentManagerWillRemoveRootComponent(rootComponent, this);
      }
    }
  }

  protected onRemoveRootComponent(rootComponent: C): void {
    // hook
  }

  protected didRemoveRootComponent(rootComponent: C): void {
    this.didObserve(function (componentManagerObserver: ComponentManagerObserver): void {
      if (componentManagerObserver.componentManagerDidRemoveRootComponent !== void 0) {
        componentManagerObserver.componentManagerDidRemoveRootComponent(rootComponent, this);
      }
    });
    const componentManagerObservers = this.componentManagerObservers;
    for (let i = 0, n = componentManagerObservers.length; i < n; i += 1) {
      const componentManagerObserver = componentManagerObservers[i]!;
      if (componentManagerObserver.componentManagerDidRemoveRootComponent !== void 0) {
        componentManagerObserver.componentManagerDidRemoveRootComponent(rootComponent, this);
      }
    }
  }
}
