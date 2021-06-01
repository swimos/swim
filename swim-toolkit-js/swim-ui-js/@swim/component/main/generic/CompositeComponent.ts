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

import type {ComponentContextType} from "../ComponentContext";
import {ComponentFlags, Component} from "../Component";
import {GenericComponent} from "./GenericComponent";

export class CompositeComponent extends GenericComponent {
  constructor() {
    super();
    Object.defineProperty(this, "childComponents", {
      value: [],
      enumerable: true,
    });
    Object.defineProperty(this, "childComponentMap", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly childComponents!: ReadonlyArray<Component>;

  override get childComponentCount(): number {
    return this.childComponents.length;
  }

  override forEachChildComponent<T>(callback: (childComponent: Component) => T | void): T | undefined;
  override forEachChildComponent<T, S>(callback: (this: S, childComponent: Component) => T | void,
                                       thisArg: S): T | undefined;
  override forEachChildComponent<T, S>(callback: (this: S | undefined, childComponent: Component) => T | void,
                                        thisArg?: S): T | undefined {
    let result: T | undefined;
    const childComponents = this.childComponents;
    let i = 0;
    while (i < childComponents.length) {
      const childComponent = childComponents[i]!;
      result = callback.call(thisArg, childComponent) as T | undefined;
      if (result !== void 0) {
        break;
      }
      if (childComponents[i] === childComponent) {
        i += 1;
      }
    }
    return result;
  }

  override firstChildComponent(): Component | null {
    const childComponents = this.childComponents;
    return childComponents.length !== 0 ? childComponents[0]! : null;
  }

  override lastChildComponent(): Component | null {
    const childComponents = this.childComponents;
    return childComponents.length !== 0 ? childComponents[childComponents.length - 1]! : null;
  }

  override nextChildComponent(targetComponent: Component): Component | null {
    const childComponents = this.childComponents;
    const targetIndex = childComponents.indexOf(targetComponent);
    return targetIndex >= 0 && targetIndex + 1 < childComponents.length ? childComponents[targetIndex + 1]! : null;
  }

  override previousChildComponent(targetComponent: Component): Component | null {
    const childComponents = this.childComponents;
    const targetIndex = childComponents.indexOf(targetComponent);
    return targetIndex - 1 >= 0 ? childComponents[targetIndex - 1]! : null;
  }

  /** @hidden */
  readonly childComponentMap!: {[key: string]: Component | undefined} | null;

  override getChildComponent(key: string): Component | null {
    const childComponentMap = this.childComponentMap;
    if (childComponentMap !== null) {
      const childComponent = childComponentMap[key];
      if (childComponent !== void 0) {
        return childComponent;
      }
    }
    return null;
  }

  override setChildComponent(key: string, newChildComponent: Component | null): Component | null {
    let targetComponent: Component | null = null;
    const childComponents = this.childComponents as Component[];
    if (newChildComponent !== null) {
      if (newChildComponent.parentComponent === this) {
        targetComponent = childComponents[childComponents.indexOf(newChildComponent) + 1] || null;
      }
      newChildComponent.remove();
    }
    let index = -1;
    const oldChildComponent = this.getChildComponent(key);
    if (oldChildComponent !== null) {
      index = childComponents.indexOf(oldChildComponent);
      // assert(index >= 0);
      targetComponent = childComponents[index + 1] || null;
      this.willRemoveChildComponent(oldChildComponent);
      oldChildComponent.setParentComponent(null, this);
      this.removeChildComponentMap(oldChildComponent);
      childComponents.splice(index, 1);
      this.onRemoveChildComponent(oldChildComponent);
      this.didRemoveChildComponent(oldChildComponent);
      oldChildComponent.setKey(void 0);
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
      let childComponentMap = this.childComponentMap;
      if (childComponentMap === null) {
        childComponentMap = {};
        Object.defineProperty(this, "childComponentMap", {
          value: childComponentMap,
          enumerable: true,
          configurable: true,
        });
      }
      childComponentMap[key] = childComponent;
    }
  }

  /** @hidden */
  protected removeChildComponentMap(childComponent: Component): void {
    const key = childComponent.key;
    if (key !== void 0) {
      const childComponentMap = this.childComponentMap;
      if (childComponentMap !== null) {
        delete childComponentMap[key];
      }
    }
  }

  override appendChildComponent(childComponent: Component, key?: string): void {
    childComponent.remove();
    if (key !== void 0) {
      this.removeChildComponent(key);
      childComponent.setKey(key);
    }
    this.willInsertChildComponent(childComponent, null);
    (this.childComponents as Component[]).push(childComponent);
    this.insertChildComponentMap(childComponent);
    childComponent.setParentComponent(this, null);
    this.onInsertChildComponent(childComponent, null);
    this.didInsertChildComponent(childComponent, null);
    childComponent.cascadeInsert();
  }

  override prependChildComponent(childComponent: Component, key?: string): void {
    childComponent.remove();
    if (key !== void 0) {
      this.removeChildComponent(key);
      childComponent.setKey(key);
    }
    const childComponents = this.childComponents as Component[];
    const targetComponent = childComponents.length !== 0 ? childComponents[0]! : null;
    this.willInsertChildComponent(childComponent, targetComponent);
    childComponents.unshift(childComponent);
    this.insertChildComponentMap(childComponent);
    childComponent.setParentComponent(this, null);
    this.onInsertChildComponent(childComponent, targetComponent);
    this.didInsertChildComponent(childComponent, targetComponent);
    childComponent.cascadeInsert();
  }

  override insertChildComponent(childComponent: Component, targetComponent: Component | null, key?: string): void {
    if (targetComponent !== null && targetComponent.parentComponent !== this) {
      throw new TypeError("" + targetComponent);
    }
    childComponent.remove();
    if (key !== void 0) {
      this.removeChildComponent(key);
      childComponent.setKey(key);
    }
    this.willInsertChildComponent(childComponent, targetComponent);
    const childComponents = this.childComponents as Component[];
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

  override removeChildComponent(key: string): Component | null;
  override removeChildComponent(childComponent: Component): void;
  override removeChildComponent(key: string | Component): Component | null | void {
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
    const childComponents = this.childComponents as Component[];
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

  override removeAll(): void {
    const childComponents = this.childComponents as Component[];
    do {
      const count = childComponents.length;
      if (count > 0) {
        const childComponent = childComponents[count - 1]!;
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
  protected override doMountChildComponents(): void {
    const childComponents = this.childComponents;
    let i = 0;
    while (i < childComponents.length) {
      const childComponent = childComponents[i]!;
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
  protected override doUnmountChildComponents(): void {
    const childComponents = this.childComponents;
    let i = 0;
    while (i < childComponents.length) {
      const childComponent = childComponents[i]!;
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
  protected override doPowerChildComponents(): void {
    const childComponents = this.childComponents;
    let i = 0;
    while (i < childComponents.length) {
      const childComponent = childComponents[i]!;
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
  protected override doUnpowerChildComponents(): void {
    const childComponents = this.childComponents;
    let i = 0;
    while (i < childComponents.length) {
      const childComponent = childComponents[i]!;
      childComponent.cascadeUnpower();
      if ((childComponent.componentFlags & Component.RemovingFlag) !== 0) {
        childComponent.setComponentFlags(childComponent.componentFlags & ~Component.RemovingFlag);
        this.removeChildComponent(childComponent);
        continue;
      }
      i += 1;
    }
  }

  protected override compileChildComponents(compileFlags: ComponentFlags, componentContext: ComponentContextType<this>,
                                            compileChildComponent: (this: this, childComponent: Component, compileFlags: ComponentFlags,
                                                                    componentContext: ComponentContextType<this>) => void): void {
    const childComponents = this.childComponents;
    let i = 0;
    while (i < childComponents.length) {
      const childComponent = childComponents[i]!;
      compileChildComponent.call(this, childComponent, compileFlags, componentContext);
      if ((childComponent.componentFlags & Component.RemovingFlag) !== 0) {
        childComponent.setComponentFlags(childComponent.componentFlags & ~Component.RemovingFlag);
        this.removeChildComponent(childComponent);
        continue;
      }
      i += 1;
    }
  }

  protected override executeChildComponents(executeFlags: ComponentFlags, componentContext: ComponentContextType<this>,
                                            executeChildComponent: (this: this, childComponent: Component, executeFlags: ComponentFlags,
                                                                    componentContext: ComponentContextType<this>) => void): void {
    const childComponents = this.childComponents;
    let i = 0;
    while (i < childComponents.length) {
      const childComponent = childComponents[i]!;
      executeChildComponent.call(this, childComponent, executeFlags, componentContext);
      if ((childComponent.componentFlags & Component.RemovingFlag) !== 0) {
        childComponent.setComponentFlags(childComponent.componentFlags & ~Component.RemovingFlag);
        this.removeChildComponent(childComponent);
        continue;
      }
      i += 1;
    }
  }
}
