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

import type {Mutable, Class, Dictionary, MutableDictionary} from "@swim/util";
import {ControllerContextType, ControllerFlags, AnyController, Controller} from "./Controller";

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

  override getChild<C extends Controller>(key: string, childBound: Class<C>): C | null;
  override getChild(key: string, childBound?: Class<Controller>): Controller | null;
  override getChild(key: string, childBound?: Class<Controller>): Controller | null {
    const childMap = this.childMap;
    if (childMap !== null) {
      const child = childMap[key];
      if (child !== void 0 && (childBound === void 0 || child instanceof childBound)) {
        return child;
      }
    }
    return null;
  }

  override setChild<C extends Controller>(key: string, newChild: AnyController<C> | null): Controller | null;
  override setChild(key: string, newChild: AnyController | null): Controller | null;
  override setChild(key: string, newChild: AnyController | null): Controller | null {
    if (newChild !== null) {
      newChild = Controller.fromAny(newChild);
    }

    let target: Controller | null = null;
    const children = this.children as Controller[];
    if (newChild !== null) {
      if (newChild.parent === this) {
        target = children[children.indexOf(newChild) + 1] || null;
      }
      newChild.remove();
    }

    let index = -1;
    const oldChild = this.getChild(key);
    if (oldChild !== null) {
      index = children.indexOf(oldChild);
      // assert(index >= 0);
      target = children[index + 1] || null;
      this.willRemoveChild(oldChild);
      oldChild.setParent(null, this);
      this.removeChildMap(oldChild);
      children.splice(index, 1);
      this.onRemoveChild(oldChild);
      this.didRemoveChild(oldChild);
      oldChild.setKey(void 0);
    }

    if (newChild !== null) {
      newChild.setKey(key);
      this.willInsertChild(newChild, target);
      if (index >= 0) {
        children.splice(index, 0, newChild);
      } else {
        children.push(newChild);
      }
      this.insertChildMap(newChild);
      newChild.setParent(this, null);
      this.onInsertChild(newChild, target);
      this.didInsertChild(newChild, target);
      newChild.cascadeInsert();
    }

    return oldChild;
  }

  override appendChild<C extends Controller>(child: AnyController<C>, key?: string): C;
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
    child.setParent(this, null);
    this.onInsertChild(child, null);
    this.didInsertChild(child, null);
    child.cascadeInsert();

    return child;
  }

  override prependChild<C extends Controller>(child: AnyController<C>, key?: string): C;
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
    child.setParent(this, null);
    this.onInsertChild(child, target);
    this.didInsertChild(child, target);
    child.cascadeInsert();

    return child;
  }

  override insertChild<C extends Controller>(child: AnyController<C>, target: Controller | null, key?: string): C;
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
    child.setParent(this, null);
    this.onInsertChild(child, target);
    this.didInsertChild(child, target);
    child.cascadeInsert();

    return child;
  }

  override removeChild(key: string): Controller | null;
  override removeChild(child: Controller): void;
  override removeChild(key: string | Controller): Controller | null | void {
    let child: Controller | null;
    if (typeof key === "string") {
      child = this.getChild(key);
      if (child === null) {
        return null;
      }
    } else {
      child = key;
    }
    if (child.parent !== this) {
      throw new Error("not a child controller");
    }

    this.willRemoveChild(child);
    child.setParent(null, this);
    this.removeChildMap(child);
    const children = this.children as Controller[];
    const index = children.indexOf(child);
    if (index >= 0) {
      children.splice(index, 1);
    }
    this.onRemoveChild(child);
    this.didRemoveChild(child);
    child.setKey(void 0);

    if (typeof key === "string") {
      return child;
    }
  }

  override removeChildren(): void {
    const children = this.children as Controller[];
    let childCount: number;
    while (childCount = children.length, childCount !== 0) {
      const child = children[childCount - 1]!;
      this.willRemoveChild(child);
      child.setParent(null, this);
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
