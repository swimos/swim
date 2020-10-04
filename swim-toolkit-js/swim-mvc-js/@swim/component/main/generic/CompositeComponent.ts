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

import {ComponentContextType} from "../ComponentContext";
import {ComponentFlags, Component} from "../Component";
import {GenericComponent} from "./GenericComponent";

export class CompositeComponent extends GenericComponent {
  /** @hidden */
  readonly _childComponents: Component[];
  /** @hidden */
  _childComponentMap?: {[key: string]: Component | undefined};

  constructor() {
    super();
    this._childComponents = [];
  }

  get childComponentCount(): number {
    return this._childComponents.length;
  }

  get childComponents(): ReadonlyArray<Component> {
    return this._childComponents;
  }

  forEachChildComponent<T, S = unknown>(callback: (this: S, childComponent: Component) => T | void,
                                        thisArg?: S): T | undefined {
    let result: T | undefined;
    const childComponents = this._childComponents;
    if (childComponents.length !== 0) {
      let i = 0;
      do {
        const childComponent = childComponents[i];
        result = callback.call(thisArg, childComponent);
        if (result !== void 0) {
          return result;
        }
        if (i < childComponents.length) {
          if (childComponents[i] === childComponent) {
            i += 1;
          }
          continue;
        }
        break;
      } while (true);
    }
    return result;
  }

  firstChildComponent(): Component | null {
    const childComponents = this._childComponents;
    return childComponents.length !== 0 ? childComponents[0] : null;
  }

  lastChildComponent(): Component | null {
    const childComponents = this._childComponents;
    return childComponents.length !== 0 ? childComponents[childComponents.length - 1] : null;
  }

  nextChildComponent(targetComponent: Component): Component | null {
    const childComponents = this._childComponents;
    const targetIndex = childComponents.indexOf(targetComponent);
    return targetIndex >= 0 && targetIndex + 1 < childComponents.length ? childComponents[targetIndex + 1] : null;
  }

  previousChildComponent(targetComponent: Component): Component | null {
    const childComponents = this._childComponents;
    const targetIndex = childComponents.indexOf(targetComponent);
    return targetIndex - 1 >= 0 ? childComponents[targetIndex - 1] : null;
  }

  getChildComponent(key: string): Component | null {
    const childComponentMap = this._childComponentMap;
    if (childComponentMap !== void 0) {
      const childComponent = childComponentMap[key];
      if (childComponent !== void 0) {
        return childComponent;
      }
    }
    return null;
  }

  setChildComponent(key: string, newChildComponent: Component | null): Component | null {
    if (newChildComponent !== null) {
      newChildComponent.remove();
    }
    let index = -1;
    let oldChildComponent: Component | null = null;
    let targetComponent: Component | null = null;
    const childComponents = this._childComponents;
    const childComponentMap = this._childComponentMap;
    if (childComponentMap !== void 0) {
      const childComponent = childComponentMap[key];
      if (childComponent !== void 0) {
        index = childComponents.indexOf(childComponent);
        // assert(index >= 0);
        oldChildComponent = childComponent;
        targetComponent = childComponents[index + 1] || null;
        this.willRemoveChildComponent(childComponent);
        childComponent.setParentComponent(null, this);
        this.removeChildComponentMap(childComponent);
        childComponents.splice(index, 1);
        this.onRemoveChildComponent(childComponent);
        this.didRemoveChildComponent(childComponent);
        childComponent.setKey(void 0);
      }
    }
    if (newChildComponent !== null) {
      newChildComponent.setKey(key);
      this.willInsertChildComponent(newChildComponent, targetComponent);
      if (index >= 0) {
        childComponents.splice(index, 0, newChildComponent);
      } else {
        childComponents.push(newChildComponent);
      }
      this.insertChildComponentMap(newChildComponent);
      newChildComponent.setParentComponent(this, null);
      this.onInsertChildComponent(newChildComponent, targetComponent);
      this.didInsertChildComponent(newChildComponent, targetComponent);
      newChildComponent.cascadeInsert();
    }
    return oldChildComponent;
  }

  /** @hidden */
  protected insertChildComponentMap(childComponent: Component): void {
    const key = childComponent.key;
    if (key !== void 0) {
      let childComponentMap = this._childComponentMap;
      if (childComponentMap === void 0) {
        childComponentMap = {};
        this._childComponentMap = childComponentMap;
      }
      childComponentMap[key] = childComponent;
    }
  }

  /** @hidden */
  protected removeChildComponentMap(childComponent: Component): void {
    const childComponentMap = this._childComponentMap;
    if (childComponentMap !== void 0) {
      const key = childComponent.key;
      if (key !== void 0) {
        delete childComponentMap[key];
      }
    }
  }

  appendChildComponent(childComponent: Component, key?: string): void {
    childComponent.remove();
    if (key !== void 0) {
      this.removeChildComponent(key);
      childComponent.setKey(key);
    }
    this.willInsertChildComponent(childComponent, null);
    this._childComponents.push(childComponent);
    this.insertChildComponentMap(childComponent);
    childComponent.setParentComponent(this, null);
    this.onInsertChildComponent(childComponent, null);
    this.didInsertChildComponent(childComponent, null);
    childComponent.cascadeInsert();
  }

  prependChildComponent(childComponent: Component, key?: string): void {
    childComponent.remove();
    if (key !== void 0) {
      this.removeChildComponent(key);
      childComponent.setKey(key);
    }
    const childComponents = this._childComponents;
    const targetComponent = childComponents.length !== 0 ? childComponents[0] : null;
    this.willInsertChildComponent(childComponent, targetComponent);
    childComponents.unshift(childComponent);
    this.insertChildComponentMap(childComponent);
    childComponent.setParentComponent(this, targetComponent);
    this.onInsertChildComponent(childComponent, targetComponent);
    this.didInsertChildComponent(childComponent, targetComponent);
    childComponent.cascadeInsert();
  }

  insertChildComponent(childComponent: Component, targetComponent: Component | null, key?: string): void {
    if (targetComponent !== null && targetComponent.parentComponent !== this) {
      throw new TypeError("" + targetComponent);
    }
    childComponent.remove();
    if (key !== void 0) {
      this.removeChildComponent(key);
      childComponent.setKey(key);
    }
    this.willInsertChildComponent(childComponent, targetComponent);
    const childComponents = this._childComponents;
    const index = targetComponent !== null ? childComponents.indexOf(targetComponent) : -1;
    if (index >= 0) {
      childComponents.splice(index, 0, childComponent);
    } else {
      childComponents.push(childComponent);
    }
    this.insertChildComponentMap(childComponent);
    childComponent.setParentComponent(this, null);
    this.onInsertChildComponent(childComponent, targetComponent);
    this.didInsertChildComponent(childComponent, targetComponent);
    childComponent.cascadeInsert();
  }

  removeChildComponent(key: string): Component | null;
  removeChildComponent(childComponent: Component): void;
  removeChildComponent(key: string | Component): Component | null | void {
    let childComponent: Component | null;
    if (typeof key === "string") {
      childComponent = this.getChildComponent(key);
      if (childComponent === null) {
        return null;
      }
    } else {
      childComponent = key;
    }
    if (childComponent.parentComponent !== this) {
      throw new Error("not a child component");
    }
    this.willRemoveChildComponent(childComponent);
    childComponent.setParentComponent(null, this);
    this.removeChildComponentMap(childComponent);
    const childComponents = this._childComponents;
    const index = childComponents.indexOf(childComponent);
    if (index >= 0) {
      childComponents.splice(index, 1);
    }
    this.onRemoveChildComponent(childComponent);
    this.didRemoveChildComponent(childComponent);
    childComponent.setKey(void 0);
    if (typeof key === "string") {
      return childComponent;
    }
  }

  removeAll(): void {
    const childComponents = this._childComponents;
    do {
      const count = childComponents.length;
      if (count > 0) {
        const childComponent = childComponents[count - 1];
        this.willRemoveChildComponent(childComponent);
        childComponent.setParentComponent(null, this);
        this.removeChildComponentMap(childComponent);
        childComponents.pop();
        this.onRemoveChildComponent(childComponent);
        this.didRemoveChildComponent(childComponent);
        childComponent.setKey(void 0);
        continue;
      }
      break;
    } while (true);
  }

  /** @hidden */
  protected doMountChildComponents(): void {
    const childComponents = this._childComponents;
    let i = 0;
    while (i < childComponents.length) {
      const childComponent = childComponents[i];
      childComponent.cascadeMount();
      if ((childComponent.componentFlags & Component.RemovingFlag) !== 0) {
        childComponent.setComponentFlags(childComponent.componentFlags & ~Component.RemovingFlag);
        this.removeChildComponent(childComponent);
        continue;
      }
      i += 1;
    }
  }

  /** @hidden */
  protected doUnmountChildComponents(): void {
    const childComponents = this._childComponents;
    let i = 0;
    while (i < childComponents.length) {
      const childComponent = childComponents[i];
      childComponent.cascadeUnmount();
      if ((childComponent.componentFlags & Component.RemovingFlag) !== 0) {
        childComponent.setComponentFlags(childComponent.componentFlags & ~Component.RemovingFlag);
        this.removeChildComponent(childComponent);
        continue;
      }
      i += 1;
    }
  }

  /** @hidden */
  protected doPowerChildComponents(): void {
    const childComponents = this._childComponents;
    let i = 0;
    while (i < childComponents.length) {
      const childComponent = childComponents[i];
      childComponent.cascadePower();
      if ((childComponent.componentFlags & Component.RemovingFlag) !== 0) {
        childComponent.setComponentFlags(childComponent.componentFlags & ~Component.RemovingFlag);
        this.removeChildComponent(childComponent);
        continue;
      }
      i += 1;
    }
  }

  /** @hidden */
  protected doUnpowerChildComponents(): void {
    const childComponents = this._childComponents;
    let i = 0;
    while (i < childComponents.length) {
      const childComponent = childComponents[i];
      childComponent.cascadeUnpower();
      if ((childComponent.componentFlags & Component.RemovingFlag) !== 0) {
        childComponent.setComponentFlags(childComponent.componentFlags & ~Component.RemovingFlag);
        this.removeChildComponent(childComponent);
        continue;
      }
      i += 1;
    }
  }

  protected compileChildComponents(compileFlags: ComponentFlags, componentContext: ComponentContextType<this>,
                                   callback?: (this: this, childComponent: Component) => void): void {
    const childComponents = this._childComponents;
    let i = 0;
    while (i < childComponents.length) {
      const childComponent = childComponents[i];
      this.compileChildComponent(childComponent, compileFlags, componentContext);
      if (callback !== void 0) {
        callback.call(this, childComponent);
      }
      if ((childComponent.componentFlags & Component.RemovingFlag) !== 0) {
        childComponent.setComponentFlags(childComponent.componentFlags & ~Component.RemovingFlag);
        this.removeChildComponent(childComponent);
        continue;
      }
      i += 1;
    }
  }

  protected executeChildComponents(executeFlags: ComponentFlags, componentContext: ComponentContextType<this>,
                                   callback?: (this: this, childComponent: Component) => void): void {
    const childComponents = this._childComponents;
    let i = 0;
    while (i < childComponents.length) {
      const childComponent = childComponents[i];
      this.executeChildComponent(childComponent, executeFlags, componentContext);
      if (callback !== void 0) {
        callback.call(this, childComponent);
      }
      if ((childComponent.componentFlags & Component.RemovingFlag) !== 0) {
        childComponent.setComponentFlags(childComponent.componentFlags & ~Component.RemovingFlag);
        this.removeChildComponent(childComponent);
        continue;
      }
      i += 1;
    }
  }
}
Component.Composite = CompositeComponent;
