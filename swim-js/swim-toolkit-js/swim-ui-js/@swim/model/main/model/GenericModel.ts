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
import {ModelContextType, ModelFlags, AnyModel, ModelFactory, Model} from "./Model";

export class GenericModel extends Model {
  constructor() {
    super();
    this.children = [];
    this.childMap = null;
  }

  override readonly children: ReadonlyArray<Model>;

  override get childCount(): number {
    return this.children.length;
  }

  override firstChild(): Model | null {
    const children = this.children;
    if (children.length !== 0) {
      return children[0]!;
    }
    return null;
  }

  override lastChild(): Model | null {
    const children = this.children;
    const childCount = children.length;
    if (childCount !== 0) {
      return children[childCount - 1]!;
    }
    return null;
  }

  override nextChild(target: Model): Model | null {
    const children = this.children;
    const targetIndex = children.indexOf(target);
    if (targetIndex >= 0 && targetIndex + 1 < children.length) {
      return children[targetIndex + 1]!;
    }
    return null;
  }

  override previousChild(target: Model): Model | null {
    const children = this.children;
    const targetIndex = children.indexOf(target);
    if (targetIndex - 1 >= 0) {
      return children[targetIndex - 1]!;
    }
    return null;
  }

  override forEachChild<T>(callback: (child: Model) => T | void): T | undefined;
  override forEachChild<T, S>(callback: (this: S, child: Model) => T | void, thisArg: S): T | undefined;
  override forEachChild<T, S>(callback: (this: S | undefined, child: Model) => T | void, thisArg?: S): T | undefined {
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
  readonly childMap: Dictionary<Model> | null;

  /** @internal */
  protected insertChildMap(child: Model): void {
    const key = child.key;
    if (key !== void 0) {
      let childMap = this.childMap as MutableDictionary<Model>;
      if (childMap === null) {
        childMap = {};
        (this as Mutable<this>).childMap = childMap;
      }
      childMap[key] = child;
    }
  }

  /** @internal */
  protected removeChildMap(child: Model): void {
    const key = child.key;
    if (key !== void 0) {
      const childMap = this.childMap as MutableDictionary<Model>;
      if (childMap !== null) {
        delete childMap[key];
      }
    }
  }

  /** @internal */
  protected replaceChildMap(newChild: Model, oldChild: Model): void {
    const key = oldChild.key;
    if (key !== void 0) {
      let childMap = this.childMap as MutableDictionary<Model>;
      if (childMap === null) {
        childMap = {};
        (this as Mutable<this>).childMap = childMap;
      }
      childMap[key] = newChild;
    }
  }

  override getChild<M extends Model>(key: string, childBound: Class<M>): M | null;
  override getChild(key: string, childBound?: Class<Model>): Model | null;
  override getChild(key: string, childBound?: Class<Model>): Model | null {
    const childMap = this.childMap;
    if (childMap !== null) {
      const child = childMap[key];
      if (child !== void 0 && (childBound === void 0 || child instanceof childBound)) {
        return child;
      }
    }
    return null;
  }

  override setChild<M extends Model>(key: string, newChild: M | ModelFactory<M> | null): Model | null;
  override setChild(key: string, newChild: AnyModel | null): Model | null;
  override setChild(key: string, newChild: AnyModel | null): Model | null {
    if (newChild !== null) {
      newChild = Model.fromAny(newChild);
    }
    const oldChild = this.getChild(key);
    const children = this.children as Model[];
    let index = -1;
    let target: Model | null = null;

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

  override appendChild<M extends Model>(child: M | ModelFactory<M>, key?: string): M;
  override appendChild(child: AnyModel, key?: string): Model;
  override appendChild(child: AnyModel, key?: string): Model {
    child = Model.fromAny(child);

    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
      child.setKey(key);
    }

    this.willInsertChild(child, null);
    (this.children as Model[]).push(child);
    this.insertChildMap(child);
    child.attachParent(this);
    this.onInsertChild(child, null);
    this.didInsertChild(child, null);
    child.cascadeInsert();

    return child;
  }

  override prependChild<M extends Model>(child: M | ModelFactory<M>, key?: string): M;
  override prependChild(child: AnyModel, key?: string): Model;
  override prependChild(child: AnyModel, key?: string): Model {
    child = Model.fromAny(child);

    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
      child.setKey(key);
    }

    const children = this.children as Model[];
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

  override insertChild<M extends Model>(child: M | ModelFactory<M>, target: Model | null, key?: string): M;
  override insertChild(child: AnyModel, target: Model | null, key?: string): Model;
  override insertChild(child: AnyModel, target: Model | null, key?: string): Model {
    if (target !== null && target.parent !== this) {
      throw new TypeError("" + target);
    }

    child = Model.fromAny(child);

    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
      child.setKey(key);
    }

    this.willInsertChild(child, target);
    const children = this.children as Model[];
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

  override replaceChild<M extends Model>(newChild: Model, oldChild: M): M;
  override replaceChild<M extends Model>(newChild: AnyModel, oldChild: M): M;
  override replaceChild(newChild: AnyModel, oldChild: Model): Model {
    const children = this.children as Model[];
    if (oldChild.parent !== this) {
      throw new TypeError("" + oldChild);
    }

    newChild = Model.fromAny(newChild);
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

  override removeChild(key: string): Model | null;
  override removeChild<M extends Model>(child: M): M;
  override removeChild(key: string | Model): Model | null {
    let child: Model | null;
    if (typeof key === "string") {
      child = this.getChild(key);
      if (child === null) {
        return null;
      }
    } else {
      child = key;
      if (child.parent !== this) {
        throw new Error("not a child model");
      }
    }

    this.willRemoveChild(child);
    child.detachParent(this);
    this.removeChildMap(child);
    const children = this.children as Model[];
    const index = children.indexOf(child);
    // assert(index >= 0);
    children.splice(index, 1);
    this.onRemoveChild(child);
    this.didRemoveChild(child);
    child.setKey(void 0);

    return child;
  }

  override removeChildren(): void {
    const children = this.children as Model[];
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
      if ((child.flags & Model.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~Model.RemovingFlag);
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
      if ((child.flags & Model.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~Model.RemovingFlag);
        this.removeChild(child);
        continue;
      }
      i += 1;
    }
  }

  protected override analyzeOwnChildren(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>,
                                        analyzeChild: (this: this, child: Model, analyzeFlags: ModelFlags,
                                                       modelContext: ModelContextType<this>) => void): void {
    const children = this.children;
    let i = 0;
    while (i < children.length) {
      const child = children[i]!;
      analyzeChild.call(this, child, analyzeFlags, modelContext);
      if ((child.flags & Model.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~Model.RemovingFlag);
        this.removeChild(child);
        continue;
      }
      i += 1;
    }
  }

  protected override refreshOwnChildren(refreshFlags: ModelFlags, modelContext: ModelContextType<this>,
                                        refreshChild: (this: this, child: Model, refreshFlags: ModelFlags,
                                                       modelContext: ModelContextType<this>) => void): void {
    const children = this.children;
    let i = 0;
    while (i < children.length) {
      const child = children[i]!;
      refreshChild.call(this, child, refreshFlags, modelContext);
      if ((child.flags & Model.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~Model.RemovingFlag);
        this.removeChild(child);
        continue;
      }
      i += 1;
    }
  }
}
