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
import {Hierarchy} from "./Hierarchy";

export class GenericHierarchy extends Hierarchy {
  constructor() {
    super();
    this.parent = null;
    this.children = [];
    this.childMap = null;
  }

  readonly parent: Hierarchy | null;

  protected override onSetParent(newParent: Hierarchy | null, oldParent: Hierarchy | null): void {
    (this as Mutable<this>).parent = newParent;
    super.onSetParent(newParent, oldParent);
  }

  get childCount(): number {
    return this.children.length;
  }

  override readonly children: ReadonlyArray<Hierarchy>;

  override firstChild(): Hierarchy | null {
    const children = this.children;
    if (children.length !== 0) {
      return children[0]!;
    }
    return null;
  }

  override lastChild(): Hierarchy | null {
    const children = this.children;
    const childCount = children.length;
    if (childCount !== 0) {
      return children[childCount - 1]!;
    }
    return null;
  }

  override nextChild(target: Hierarchy): Hierarchy | null {
    const children = this.children;
    const targetIndex = children.indexOf(target);
    if (targetIndex >= 0 && targetIndex + 1 < children.length) {
      return children[targetIndex + 1]!;
    }
    return null;
  }

  override previousChild(target: Hierarchy): Hierarchy | null {
    const children = this.children;
    const targetIndex = children.indexOf(target);
    if (targetIndex - 1 >= 0) {
      return children[targetIndex - 1]!;
    }
    return null;
  }

  override forEachChild<T>(callback: (child: Hierarchy) => T | void): T | undefined;
  override forEachChild<T, S>(callback: (this: S, child: Hierarchy) => T | void, thisArg: S): T | undefined;
  override forEachChild<T, S>(callback: (this: S | undefined, child: Hierarchy) => T | void, thisArg?: S): T | undefined {
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
  readonly childMap: Dictionary<Hierarchy> | null;

  /** @internal */
  protected insertChildMap(child: Hierarchy): void {
    const key = child.key;
    if (key !== void 0) {
      let childMap = this.childMap as MutableDictionary<Hierarchy>;
      if (childMap === null) {
        childMap = {};
        (this as Mutable<this>).childMap = childMap;
      }
      childMap[key] = child;
    }
  }

  /** @internal */
  protected removeChildMap(child: Hierarchy): void {
    const key = child.key;
    if (key !== void 0) {
      const childMap = this.childMap as MutableDictionary<Hierarchy>;
      if (childMap !== null) {
        delete childMap[key];
      }
    }
  }

  override getChild<H extends Hierarchy>(key: string, childBound: Class<H>): H | null;
  override getChild(key: string, childBound?: Class<Hierarchy>): Hierarchy | null;
  override getChild(key: string, childBound?: Class<Hierarchy>): Hierarchy | null {
    const childMap = this.childMap;
    if (childMap !== null) {
      const child = childMap[key];
      if (child !== void 0 && (childBound === void 0 || child instanceof childBound)) {
        return child;
      }
    }
    return null;
  }

  override setChild(key: string, newChild: Hierarchy | null): Hierarchy | null {
    let target: Hierarchy | null = null;
    const children = this.children as Hierarchy[];
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

  override appendChild<H extends Hierarchy>(child: H, key?: string): H {
    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
      child.setKey(key);
    }

    this.willInsertChild(child, null);
    (this.children as Hierarchy[]).push(child);
    this.insertChildMap(child);
    child.setParent(this, null);
    this.onInsertChild(child, null);
    this.didInsertChild(child, null);
    child.cascadeInsert();

    return child;
  }

  override prependChild<H extends Hierarchy>(child: H, key?: string): H {
    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
      child.setKey(key);
    }

    const children = this.children as Hierarchy[];
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

  override insertChild<H extends Hierarchy>(child: H, target: Hierarchy | null, key?: string): H {
    if (target !== null && target.parent !== this) {
      throw new TypeError("" + target);
    }

    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
      child.setKey(key);
    }

    this.willInsertChild(child, target);
    const children = this.children as Hierarchy[];
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

  override removeChild(key: string): Hierarchy | null;
  override removeChild(child: Hierarchy): void;
  override removeChild(key: string | Hierarchy): Hierarchy | null | void {
    let child: Hierarchy | null;
    if (typeof key === "string") {
      child = this.getChild(key);
      if (child === null) {
        return null;
      }
    } else {
      child = key;
    }
    if (child.parent !== this) {
      throw new Error("not a child");
    }

    this.willRemoveChild(child);
    child.setParent(null, this);
    this.removeChildMap(child);
    const children = this.children as Hierarchy[];
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
    const children = this.children as Hierarchy[];
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

  mount(): void {
    if (!this.mounted && this.parent === null) {
      this.cascadeMount();
      this.cascadeInsert();
    }
  }

  /** @internal */
  protected override mountChildren(): void {
    const children = this.children;
    let i = 0;
    while (i < children.length) {
      const child = children[i]!;
      child.cascadeMount();
      if ((child.flags & Hierarchy.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~Hierarchy.RemovingFlag);
        this.removeChild(child);
        continue;
      }
      i += 1;
    }
  }

  unmount(): void {
    if (this.mounted && this.parent === null) {
      this.cascadeUnmount();
    }
  }

  /** @internal */
  protected override unmountChildren(): void {
    const children = this.children;
    let i = 0;
    while (i < children.length) {
      const child = children[i]!;
      child.cascadeUnmount();
      if ((child.flags & Hierarchy.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~Hierarchy.RemovingFlag);
        this.removeChild(child);
        continue;
      }
      i += 1;
    }
  }
}
