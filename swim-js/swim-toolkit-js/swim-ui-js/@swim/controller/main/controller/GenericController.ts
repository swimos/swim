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

import type {Mutable, Dictionary, MutableDictionary} from "@swim/util";
import {ControllerContextType, ControllerFlags, AnyController, ControllerCreator, Controller} from "./Controller";

export class GenericController extends Controller {
  constructor() {
    super();
    this.children = [];
    this.childMap = null;
  }

  override readonly children: ReadonlyArray<Controller>;

  override get childCount(): number {
    return this.children.length;
  }

  override firstChild(): Controller | null {
    const children = this.children;
    if (children.length !== 0) {
      return children[0]!;
    }
    return null;
  }

  override lastChild(): Controller | null {
    const children = this.children;
    const childCount = children.length;
    if (childCount !== 0) {
      return children[childCount - 1]!;
    }
    return null;
  }

  override nextChild(target: Controller): Controller | null {
    const children = this.children;
    const targetIndex = children.indexOf(target);
    if (targetIndex >= 0 && targetIndex + 1 < children.length) {
      return children[targetIndex + 1]!;
    }
    return null;
  }

  override previousChild(target: Controller): Controller | null {
    const children = this.children;
    const targetIndex = children.indexOf(target);
    if (targetIndex - 1 >= 0) {
      return children[targetIndex - 1]!;
    }
    return null;
  }

  override forEachChild<T>(callback: (child: Controller) => T | void): T | undefined;
  override forEachChild<T, S>(callback: (this: S, child: Controller) => T | void, thisArg: S): T | undefined;
  override forEachChild<T, S>(callback: (this: S | undefined, child: Controller) => T | void, thisArg?: S): T | undefined {
    let result: T | undefined;
    const children = this.children;
    let i = 0;
    while (i < children.length) {
      const child = children[i]!;
      result = callback.call(thisArg, child) as T | undefined;
      if (result !== void 0) {
        break;
      }
      if (children[i] === child) {
        i += 1;
      }
    }
    return result;
  }

  /** @internal */
  readonly childMap: Dictionary<Controller> | null;

  /** @internal */
  protected insertChildMap(child: Controller): void {
    const key = child.key;
    if (key !== void 0) {
      let childMap = this.childMap as MutableDictionary<Controller>;
      if (childMap === null) {
        childMap = {};
        (this as Mutable<this>).childMap = childMap;
      }
      childMap[key] = child;
    }
  }

  /** @internal */
  protected removeChildMap(child: Controller): void {
    const key = child.key;
    if (key !== void 0) {
      const childMap = this.childMap as MutableDictionary<Controller>;
      if (childMap !== null) {
        delete childMap[key];
      }
    }
  }

  /** @internal */
  protected replaceChildMap(newChild: Controller, oldChild: Controller): void {
    const key = oldChild.key;
    if (key !== void 0) {
      let childMap = this.childMap as MutableDictionary<Controller>;
      if (childMap === null) {
        childMap = {};
        (this as Mutable<this>).childMap = childMap;
      }
      childMap[key] = newChild;
    }
  }

  override getChild<F extends abstract new (...args: any[]) => Controller>(key: string, childBound: F): InstanceType<F> | null;
  override getChild(key: string, childBound?: abstract new (...args: any[]) => Controller): Controller | null;
  override getChild(key: string, childBound?: abstract new (...args: any[]) => Controller): Controller | null {
    const childMap = this.childMap;
    if (childMap !== null) {
      const child = childMap[key];
      if (child !== void 0 && (childBound === void 0 || child instanceof childBound)) {
        return child;
      }
    }
    return null;
  }

  override setChild<C extends Controller>(key: string, newChild: C): Controller | null;
  override setChild<F extends ControllerCreator<F>>(key: string, factory: F): Controller | null;
  override setChild(key: string, newChild: AnyController | null): Controller | null;
  override setChild(key: string, newChild: AnyController | null): Controller | null {
    if (newChild !== null) {
      newChild = Controller.fromAny(newChild);
    }
    const oldChild = this.getChild(key);
    const children = this.children as Controller[];
    let index = -1;
    let target: Controller | null = null;

    if (oldChild !== null && newChild !== null && oldChild !== newChild) { // replace
      newChild.remove();
      index = children.indexOf(oldChild);
      // assert(index >= 0);
      target = index + 1 < children.length ? children[index + 1]! : null;
      newChild.setKey(oldChild.key);
      this.willRemoveChild(oldChild);
      this.willInsertChild(newChild, target);
      oldChild.detachParent(this);
      children[index] = newChild;
      this.replaceChildMap(newChild, oldChild);
      newChild.attachParent(this);
      this.onRemoveChild(oldChild);
      this.onInsertChild(newChild, target);
      this.didRemoveChild(oldChild);
      this.didInsertChild(newChild, target);
      oldChild.setKey(void 0);
      newChild.cascadeInsert();
    } else if (newChild !== oldChild || newChild !== null && newChild.key !== key) {
      if (oldChild !== null) { // remove
        this.willRemoveChild(oldChild);
        oldChild.detachParent(this);
        this.removeChildMap(oldChild);
        index = children.indexOf(oldChild);
        // assert(index >= 0);
        children.splice(index, 1);
        this.onRemoveChild(oldChild);
        this.didRemoveChild(oldChild);
        oldChild.setKey(void 0);
        if (index < children.length) {
          target = children[index]!;
        }
      }
      if (newChild !== null) { // insert
        newChild.remove();
        newChild.setKey(key);
        this.willInsertChild(newChild, target);
        if (index >= 0) {
          children.splice(index, 0, newChild);
        } else {
          children.push(newChild);
        }
        this.insertChildMap(newChild);
        newChild.attachParent(this);
        this.onInsertChild(newChild, target);
        this.didInsertChild(newChild, target);
        newChild.cascadeInsert();
      }
    }

    return oldChild;
  }

  override appendChild<C extends Controller>(child: C, key?: string): C;
  override appendChild<F extends ControllerCreator<F>>(factory: F, key?: string): InstanceType<F>;
  override appendChild(child: AnyController, key?: string): Controller;
  override appendChild(child: AnyController, key?: string): Controller {
    child = Controller.fromAny(child);

    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
      child.setKey(key);
    }

    this.willInsertChild(child, null);
    (this.children as Controller[]).push(child);
    this.insertChildMap(child);
    child.attachParent(this);
    this.onInsertChild(child, null);
    this.didInsertChild(child, null);
    child.cascadeInsert();

    return child;
  }

  override prependChild<C extends Controller>(child: C, key?: string): C;
  override prependChild<F extends ControllerCreator<F>>(factory: F, key?: string): InstanceType<F>;
  override prependChild(child: AnyController, key?: string): Controller;
  override prependChild(child: AnyController, key?: string): Controller {
    child = Controller.fromAny(child);

    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
      child.setKey(key);
    }

    const children = this.children as Controller[];
    const target = children.length !== 0 ? children[0]! : null;
    this.willInsertChild(child, target);
    children.unshift(child);
    this.insertChildMap(child);
    child.attachParent(this);
    this.onInsertChild(child, target);
    this.didInsertChild(child, target);
    child.cascadeInsert();

    return child;
  }

  override insertChild<C extends Controller>(child: C, target: Controller | null, key?: string): C;
  override insertChild<F extends ControllerCreator<F>>(factory: F, target: Controller | null, key?: string): InstanceType<F>;
  override insertChild(child: AnyController, target: Controller | null, key?: string): Controller;
  override insertChild(child: AnyController, target: Controller | null, key?: string): Controller {
    if (target !== null && target.parent !== this) {
      throw new TypeError("" + target);
    }

    child = Controller.fromAny(child);

    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
      child.setKey(key);
    }

    this.willInsertChild(child, target);
    const children = this.children as Controller[];
    const index = target !== null ? children.indexOf(target) : -1;
    if (index >= 0) {
      children.splice(index, 0, child);
    } else {
      children.push(child);
    }
    this.insertChildMap(child);
    child.attachParent(this);
    this.onInsertChild(child, target);
    this.didInsertChild(child, target);
    child.cascadeInsert();

    return child;
  }

  override replaceChild<C extends Controller>(newChild: Controller, oldChild: C): C;
  override replaceChild<C extends Controller>(newChild: AnyController, oldChild: C): C;
  override replaceChild(newChild: AnyController, oldChild: Controller): Controller {
    const children = this.children as Controller[];
    if (oldChild.parent !== this) {
      throw new TypeError("" + oldChild);
    }

    newChild = Controller.fromAny(newChild);
    if (newChild !== oldChild) {
      newChild.remove();
      const index = children.indexOf(oldChild);
      // assert(index >= 0);
      const target = index + 1 < children.length ? children[index + 1]! : null;
      newChild.setKey(oldChild.key);
      this.willRemoveChild(oldChild);
      this.willInsertChild(newChild, target);
      oldChild.detachParent(this);
      children[index] = newChild;
      this.replaceChildMap(newChild, oldChild);
      newChild.attachParent(this);
      this.onRemoveChild(oldChild);
      this.onInsertChild(newChild, target);
      this.didRemoveChild(oldChild);
      this.didInsertChild(newChild, target);
      oldChild.setKey(void 0);
      newChild.cascadeInsert();
    }

    return oldChild;
  }

  override removeChild(key: string): Controller | null;
  override removeChild<C extends Controller>(child: C): C;
  override removeChild(key: string | Controller): Controller | null {
    let child: Controller | null;
    if (typeof key === "string") {
      child = this.getChild(key);
      if (child === null) {
        return null;
      }
    } else {
      child = key;
      if (child.parent !== this) {
        throw new Error("not a child controller");
      }
    }

    this.willRemoveChild(child);
    child.detachParent(this);
    this.removeChildMap(child);
    const children = this.children as Controller[];
    const index = children.indexOf(child);
    // assert(index >= 0);
    children.splice(index, 1);
    this.onRemoveChild(child);
    this.didRemoveChild(child);
    child.setKey(void 0);

    return child;
  }

  override removeChildren(): void {
    const children = this.children as Controller[];
    let childCount: number;
    while (childCount = children.length, childCount !== 0) {
      const child = children[childCount - 1]!;
      this.willRemoveChild(child);
      child.detachParent(this);
      this.removeChildMap(child);
      children.pop();
      this.onRemoveChild(child);
      this.didRemoveChild(child);
      child.setKey(void 0);
    }
  }

  /** @internal */
  protected override mountChildren(): void {
    const children = this.children;
    let i = 0;
    while (i < children.length) {
      const child = children[i]!;
      child.cascadeMount();
      if ((child.flags & Controller.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~Controller.RemovingFlag);
        this.removeChild(child);
        continue;
      }
      i += 1;
    }
  }

  /** @internal */
  protected override unmountChildren(): void {
    const children = this.children;
    let i = 0;
    while (i < children.length) {
      const child = children[i]!;
      child.cascadeUnmount();
      if ((child.flags & Controller.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~Controller.RemovingFlag);
        this.removeChild(child);
        continue;
      }
      i += 1;
    }
  }

  protected override compileChildren(compileFlags: ControllerFlags, controllerContext: ControllerContextType<this>,
                                     compileChild: (this: this, child: Controller, compileFlags: ControllerFlags,
                                                    controllerContext: ControllerContextType<this>) => void): void {
    const children = this.children;
    let i = 0;
    while (i < children.length) {
      const child = children[i]!;
      compileChild.call(this, child, compileFlags, controllerContext);
      if ((child.flags & Controller.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~Controller.RemovingFlag);
        this.removeChild(child);
        continue;
      }
      i += 1;
    }
  }

  protected override executeChildren(executeFlags: ControllerFlags, controllerContext: ControllerContextType<this>,
                                     executeChild: (this: this, child: Controller, executeFlags: ControllerFlags,
                                                    controllerContext: ControllerContextType<this>) => void): void {
    const children = this.children;
    let i = 0;
    while (i < children.length) {
      const child = children[i]!;
      executeChild.call(this, child, executeFlags, controllerContext);
      if ((child.flags & Controller.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~Controller.RemovingFlag);
        this.removeChild(child);
        continue;
      }
      i += 1;
    }
  }
}
