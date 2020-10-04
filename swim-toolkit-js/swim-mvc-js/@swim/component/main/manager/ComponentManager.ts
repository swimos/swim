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
import {ComponentManagerObserver} from "./ComponentManagerObserver";
import {ExecuteManager} from "../execute/ExecuteManager";
import {HistoryManager} from "../history/HistoryManager";

export type ComponentManagerObserverType<CM extends ComponentManager> =
  CM extends {readonly componentManagerObservers: ReadonlyArray<infer CMO>} ? CMO : unknown;

export abstract class ComponentManager<C extends Component = Component> {
  /** @hidden */
  readonly _rootComponents: C[];
  /** @hidden */
  _componentManagerObservers?: ComponentManagerObserverType<this>[];

  constructor() {
    this._rootComponents = [];
  }

  get componentManagerObservers(): ReadonlyArray<ComponentManagerObserver> {
    let componentManagerObservers = this._componentManagerObservers;
    if (componentManagerObservers === void 0) {
      componentManagerObservers = [];
      this._componentManagerObservers = componentManagerObservers;
    }
    return componentManagerObservers;
  }

  addComponentManagerObserver(componentManagerObserver: ComponentManagerObserverType<this>): void {
    let componentManagerObservers = this._componentManagerObservers;
    let index: number;
    if (componentManagerObservers === void 0) {
      componentManagerObservers = [];
      this._componentManagerObservers = componentManagerObservers;
      index = -1;
    } else {
      index = componentManagerObservers.indexOf(componentManagerObserver);
    }
    if (index < 0) {
      this.willAddComponentManagerObserver(componentManagerObserver);
      componentManagerObservers.push(componentManagerObserver);
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
    const componentManagerObservers = this._componentManagerObservers;
    if (componentManagerObservers !== void 0) {
      const index = componentManagerObservers.indexOf(componentManagerObserver);
      if (index >= 0) {
        this.willRemoveComponentManagerObserver(componentManagerObserver);
        componentManagerObservers.splice(index, 1);
        this.onRemoveComponentManagerObserver(componentManagerObserver);
        this.didRemoveComponentManagerObserver(componentManagerObserver);
      }
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
    const componentManagerObservers = this._componentManagerObservers;
    if (componentManagerObservers !== void 0) {
      let i = 0;
      while (i < componentManagerObservers.length) {
        const componentManagerObserver = componentManagerObservers[i];
        result = callback.call(this, componentManagerObserver);
        if (result !== void 0) {
          return result;
        }
        if (componentManagerObserver === componentManagerObservers[i]) {
          i += 1;
        }
      }
    }
    return result;
  }

  protected didObserve<T>(callback: (this: this, componentManagerObserver: ComponentManagerObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const componentManagerObservers = this._componentManagerObservers;
    if (componentManagerObservers !== void 0) {
      let i = 0;
      while (i < componentManagerObservers.length) {
        const componentManagerObserver = componentManagerObservers[i];
        result = callback.call(this, componentManagerObserver);
        if (result !== void 0) {
          return result;
        }
        if (componentManagerObserver === componentManagerObservers[i]) {
          i += 1;
        }
      }
    }
    return result;
  }

  isAttached(): boolean {
    return this._rootComponents.length !== 0;
  }

  protected willAttach(): void {
    this.willObserve(function (componentManagerObserver: ComponentManagerObserver): void {
      if (componentManagerObserver.componentManagerWillAttach !== void 0) {
        componentManagerObserver.componentManagerWillAttach(this);
      }
    });
  }

  protected onAttach(): void {
    // hook
  }

  protected didAttach(): void {
    this.didObserve(function (componentManagerObserver: ComponentManagerObserver): void {
      if (componentManagerObserver.componentManagerDidAttach !== void 0) {
        componentManagerObserver.componentManagerDidAttach(this);
      }
    });
  }

  protected willDetach(): void {
    this.willObserve(function (componentManagerObserver: ComponentManagerObserver): void {
      if (componentManagerObserver.componentManagerWillDetach !== void 0) {
        componentManagerObserver.componentManagerWillDetach(this);
      }
    });
  }

  protected onDetach(): void {
    // hook
  }

  protected didDetach(): void {
    this.didObserve(function (componentManagerObserver: ComponentManagerObserver): void {
      if (componentManagerObserver.componentManagerDidDetach !== void 0) {
        componentManagerObserver.componentManagerDidDetach(this);
      }
    });
  }

  get rootComponents(): ReadonlyArray<C> {
    return this._rootComponents;
  }

  insertRootComponent(rootComponent: C): void {
    const rootComponents = this._rootComponents;
    const index = rootComponents.indexOf(rootComponent);
    if (index < 0) {
      const needsAttach = rootComponents.length === 0;
      if (needsAttach) {
        this.willAttach();
      }
      this.willInsertRootComponent(rootComponent);
      rootComponents.push(rootComponent);
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
    this.willObserve(function (componentManagerObserver: ComponentManagerObserver): void {
      if (componentManagerObserver.componentManagerWillInsertRootComponent !== void 0) {
        componentManagerObserver.componentManagerWillInsertRootComponent(rootComponent, this);
      }
    });
  }

  protected onInsertRootComponent(rootComponent: C): void {
    // hook
  }

  protected didInsertRootComponent(rootComponent: C): void {
    this.didObserve(function (componentManagerObserver: ComponentManagerObserver): void {
      if (componentManagerObserver.componentManagerDidInsertRootComponent !== void 0) {
        componentManagerObserver.componentManagerDidInsertRootComponent(rootComponent, this);
      }
    });
  }

  removeRootComponent(rootComponent: C): void {
    const rootComponents = this._rootComponents;
    const index = rootComponents.indexOf(rootComponent);
    if (index >= 0) {
      const needsDetach = rootComponents.length === 1;
      if (needsDetach) {
        this.willDetach();
      }
      this.willRemoveRootComponent(rootComponent);
      rootComponents.splice(index, 1);
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
    this.willObserve(function (componentManagerObserver: ComponentManagerObserver): void {
      if (componentManagerObserver.componentManagerWillRemoveRootComponent !== void 0) {
        componentManagerObserver.componentManagerWillRemoveRootComponent(rootComponent, this);
      }
    });
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
  }

  // Forward type declarations
  /** @hidden */
  static Execute: typeof ExecuteManager; // defined by ExecuteManager
  /** @hidden */
  static History: typeof HistoryManager; // defined by HistoryManager
}
Component.Manager = ComponentManager;
