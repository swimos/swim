// Copyright 2015-2024 Nstream, inc.
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

import {__esDecorate} from "tslib";
import {__runInitializers} from "tslib";
import type {Mutable} from "@swim/util";
import {Murmur3} from "@swim/util";
import type {Class} from "@swim/util";
import type {Instance} from "@swim/util";
import type {Proto} from "@swim/util";
import type {HashCode} from "@swim/util";
import type {Comparator} from "@swim/util";
import type {LikeType} from "@swim/util";
import type {FromLike} from "@swim/util";
import type {Dictionary} from "@swim/util";
import type {MutableDictionary} from "@swim/util";
import type {TimingLike} from "@swim/util";
import {Creatable} from "@swim/util";
import type {Observes} from "@swim/util";
import type {Observable} from "@swim/util";
import type {ObserverMethods} from "@swim/util";
import type {ObserverParameters} from "@swim/util";
import type {Observer} from "@swim/util";
import {FastenerContext} from "./FastenerContext";
import type {FastenerDecorator} from "./Fastener";
import {Fastener} from "./Fastener";
import {Animator} from "./Animator";
import {EventHandler} from "./EventHandler";
import {ComponentRelation} from "./"; // forward import

/** @public */
export type ComponentFlags = number;

/** @public */
export interface ComponentFactory<C extends Component<any> = Component> extends Creatable<C>, FromLike<C> {
}

/** @public */
export interface ComponentClass<C extends Component<any> = Component> extends Function, ComponentFactory<C> {
  readonly prototype: C;
}

/** @public */
export interface ComponentConstructor<C extends Component<any> = Component> extends ComponentClass<C> {
  new(): C;
}

/** @public */
export interface ComponentObserver<C extends Component<any> = Component> extends Observer<C> {
}

/** @public */
export class Component<C extends Component<C> = Component<any>> implements HashCode, FastenerContext, Observable {
  constructor() {
    this.uid = (this.constructor as typeof Component).uid();
    this.key = void 0;
    this.flags = 0;
    this.parent = null;
    this.nextSibling = null;
    this.previousSibling = null;
    this.firstChild = null;
    this.lastChild = null;
    this.childMap = null;
    this.coherentTime = 0;
    this.decoherent = null;
    this.recohering = null;
    this.observers = null;
  }

  likeType?(like: {create?(): C}): void;

  /** @override */
  declare readonly observerType?: Class<ComponentObserver>;

  get componentType(): Class<Component> {
    return Component;
  }

  /** @internal */
  readonly uid: string;

  readonly key: string | undefined;

  /** @internal */
  setKey(key: string | undefined): void {
    (this as Mutable<this>).key = key;
  }

  /** @internal */
  readonly flags: ComponentFlags;

  /** @internal */
  setFlags(flags: ComponentFlags): void {
    (this as Mutable<this>).flags = flags;
  }

  readonly parent: C | null;

  /** @internal */
  attachParent(parent: C, nextSibling: C | null): void;
  attachParent(this: C, parent: C, nextSibling: C | null): void {
    // assert(this.parent === null);
    this.willAttachParent(parent);
    (this as Mutable<typeof this>).parent = parent;
    let previousSibling: C | null;
    if (nextSibling !== null) {
      previousSibling = nextSibling.previousSibling;
      this.setNextSibling(nextSibling);
      nextSibling.setPreviousSibling(this);
    } else {
      previousSibling = parent.lastChild;
      parent.setLastChild(this);
    }
    if (previousSibling !== null) {
      previousSibling.setNextSibling(this);
      this.setPreviousSibling(previousSibling);
    } else {
      parent.setFirstChild(this);
    }
    if (parent.mounted) {
      this.cascadeMount();
    }
    this.onAttachParent(parent);
    this.didAttachParent(parent);
  }

  protected willAttachParent(parent: C): void {
    // hook
  }

  protected onAttachParent(parent: C): void {
    // hook
  }

  protected didAttachParent(parent: C): void {
    // hook
  }

  /** @internal */
  detachParent(parent: C): void {
    // assert(this.parent === parent);
    this.willDetachParent(parent);
    if (this.mounted) {
      this.cascadeUnmount();
    }
    this.onDetachParent(parent);
    const nextSibling = this.nextSibling;
    const previousSibling = this.previousSibling;
    if (nextSibling !== null) {
      this.setNextSibling(null);
      nextSibling.setPreviousSibling(previousSibling);
    } else {
      parent.setLastChild(previousSibling);
    }
    if (previousSibling !== null) {
      previousSibling.setNextSibling(nextSibling);
      this.setPreviousSibling(null);
    } else {
      parent.setFirstChild(nextSibling);
    }
    (this as Mutable<this>).parent = null;
    this.didDetachParent(parent);
  }

  protected willDetachParent(parent: C): void {
    // hook
  }

  protected onDetachParent(parent: C): void {
    // hook
  }

  protected didDetachParent(parent: C): void {
    // hook
  }

  /** @internal */
  reattachParent(newNextSibling: C | null): void;
  reattachParent(this: C, newNextSibling: C | null): void {
    const parent = this.parent!;
    // assert(parent !== null);

    this.willDetachParent(parent);
    this.onDetachParent(parent);
    const oldNextSibling = this.nextSibling;
    const oldPreviousSibling = this.previousSibling;
    if (oldNextSibling !== null) {
      this.setNextSibling(null);
      oldNextSibling.setPreviousSibling(oldPreviousSibling);
    } else {
      parent.setLastChild(oldPreviousSibling);
    }
    if (oldPreviousSibling !== null) {
      oldPreviousSibling.setNextSibling(oldNextSibling);
      this.setPreviousSibling(null);
    } else {
      parent.setFirstChild(oldNextSibling);
    }
    this.didDetachParent(parent);

    this.willAttachParent(parent);
    let newPreviousSibling: C | null;
    if (newNextSibling !== null) {
      newPreviousSibling = newNextSibling.previousSibling;
      this.setNextSibling(newNextSibling);
      newNextSibling.setPreviousSibling(this);
    } else {
      newPreviousSibling = parent.lastChild;
      parent.setLastChild(this);
    }
    if (newPreviousSibling !== null) {
      newPreviousSibling.setNextSibling(this);
      this.setPreviousSibling(newPreviousSibling);
    } else {
      parent.setFirstChild(this);
    }
    this.onAttachParent(parent);
    this.didAttachParent(parent);
  }

  readonly nextSibling: C | null;

  getNextSibling<F extends Class<C>>(siblingType: F): InstanceType<F> | null;
  getNextSibling(siblingType: Class<C>): C | null;
  getNextSibling(siblingType: Class<C>): C | null {
    let nextSibling = this.nextSibling;
    do {
      if (nextSibling === null) {
        return null;
      } else if (nextSibling instanceof siblingType) {
        return nextSibling;
      }
      nextSibling = nextSibling.nextSibling;
    } while (true);
  }

  /** @internal */
  setNextSibling(nextSibling: C | null): void {
    (this as Mutable<this>).nextSibling = nextSibling;
  }

  readonly previousSibling: C | null;

  getPreviousSibling<F extends Class<C>>(siblingType: F): InstanceType<F> | null;
  getPreviousSibling(siblingType: Class<C>): C | null;
  getPreviousSibling(siblingType: Class<C>): C | null {
    let previousSibling = this.previousSibling;
    do {
      if (previousSibling === null) {
        return null;
      } else if (previousSibling instanceof siblingType) {
        return previousSibling;
      }
      previousSibling = previousSibling.previousSibling;
    } while (true);
  }

  /** @internal */
  setPreviousSibling(previousSibling: C | null): void {
    (this as Mutable<this>).previousSibling = previousSibling;
  }

  readonly firstChild: C | null;

  getFirstChild<F extends Class<C>>(childType: F): InstanceType<F> | null;
  getFirstChild(childType: Class<C>): C | null;
  getFirstChild(childType: Class<C>): C | null {
    let child = this.firstChild;
    do {
      if (child === null) {
        return null;
      } else if (child instanceof childType) {
        return child;
      }
      child = child.nextSibling;
    } while (true);
  }

  /** @internal */
  setFirstChild(firstChild: C | null): void {
    (this as Mutable<this>).firstChild = firstChild;
  }

  readonly lastChild: C | null;

  getLastChild<F extends Class<C>>(childType: F): InstanceType<F> | null;
  getLastChild(childType: Class<C>): C | null;
  getLastChild(childType: Class<C>): C | null {
    let child = this.lastChild;
    do {
      if (child === null) {
        return null;
      } else if (child instanceof childType) {
        return child;
      }
      child = child.previousSibling;
    } while (true);
  }

  /** @internal */
  setLastChild(lastChild: C | null): void {
    (this as Mutable<this>).lastChild = lastChild;
  }

  forEachChild<T>(callback: (child: C) => T | void): T | undefined;
  forEachChild<T, S>(callback: (this: S, child: C) => T | void, thisArg: S): T | undefined;
  forEachChild<T, S>(this: C, callback: (this: S | undefined, child: C) => T | void, thisArg?: S): T | undefined {
    let result: T | undefined;
    let child = this.firstChild;
    while (child !== null) {
      const next = child.nextSibling;
      const result = callback.call(thisArg, child);
      if (result !== void 0) {
        break;
      }
      child = next !== null && next.parent === this ? next : null;
    }
    return result;
  }

  /** @internal */
  readonly childMap: Dictionary<C> | null;

  /** @internal */
  protected insertChildMap(child: C): void {
    const key = child.key;
    if (key === void 0) {
      return;
    }
    let childMap = this.childMap as MutableDictionary<C>;
    if (childMap === null) {
      childMap = {};
      (this as Mutable<this>).childMap = childMap;
    }
    childMap[key] = child;
  }

  /** @internal */
  protected removeChildMap(child: C): void {
    const key = child.key;
    if (key === void 0) {
      return;
    }
    const childMap = this.childMap as MutableDictionary<C>;
    if (childMap !== null) {
      delete childMap[key];
    }
  }

  getChild<F extends Class<C>>(key: string, childType: F): InstanceType<F> | null;
  getChild(key: string, childType?: Class<C>): C | null;
  getChild(key: string, childType?: Class<C>): C | null {
    const childMap = this.childMap;
    if (childMap === null) {
      return null;
    }
    const child = childMap[key];
    if (child === void 0 || (childType !== void 0 && !(child instanceof childType))) {
      return null;
    }
    return child;
  }

  setChild<F extends Class<Instance<F, C>> & Creatable<Instance<F, C>>>(key: string, newChildFactory: F): C | null;
  setChild(key: string, newChild: C | LikeType<C> | null): C | null;
  setChild(this: C, key: string, newChild: C | LikeType<C> | null): C | null {
    if (newChild !== null) {
      newChild = (this.componentType as unknown as FromLike<C>).fromLike(newChild);
    }

    const oldChild = this.getChild(key);
    let target: C | null;

    if (oldChild !== null && newChild !== null && oldChild !== newChild) { // replace
      newChild.remove();
      target = oldChild.nextSibling;

      if ((oldChild.flags & Component.RemovingFlag) === 0) {
        oldChild.setFlags(oldChild.flags | Component.RemovingFlag);
        this.willRemoveChild(oldChild);
        oldChild.detachParent(this);
        this.removeChildMap(oldChild);
        this.onRemoveChild(oldChild);
        this.didRemoveChild(oldChild);
        oldChild.setKey(void 0);
        oldChild.setFlags(oldChild.flags & ~Component.RemovingFlag);
      }

      newChild.setFlags(newChild.flags | Component.InsertingFlag);
      newChild.setKey(oldChild.key);
      this.willInsertChild(newChild, target);
      this.insertChildMap(newChild);
      newChild.attachParent(this, target);
      this.onInsertChild(newChild, target);
      this.didInsertChild(newChild, target);
      newChild.cascadeInsert();
      newChild.setFlags(newChild.flags & ~Component.InsertingFlag);
    } else if (newChild !== oldChild || newChild !== null && newChild.key !== key) {
      if (oldChild !== null) { // remove
        target = oldChild.nextSibling;
        if ((oldChild.flags & Component.RemovingFlag) === 0) {
          oldChild.setFlags(oldChild.flags | Component.RemovingFlag);
          this.willRemoveChild(oldChild);
          oldChild.detachParent(this);
          this.removeChildMap(oldChild);
          this.onRemoveChild(oldChild);
          this.didRemoveChild(oldChild);
          oldChild.setKey(void 0);
          oldChild.setFlags(oldChild.flags & ~Component.RemovingFlag);
        }
      } else {
        target = null;
      }

      if (newChild !== null) { // insert
        newChild.remove();

        newChild.setFlags(newChild.flags | Component.InsertingFlag);
        newChild.setKey(key);
        this.willInsertChild(newChild, target);
        this.insertChildMap(newChild);
        newChild.attachParent(this, target);
        this.onInsertChild(newChild, target);
        this.didInsertChild(newChild, target);
        newChild.cascadeInsert();
        newChild.setFlags(newChild.flags & ~Component.InsertingFlag);
      }
    }

    return oldChild;
  }

  appendChild<F extends Class<Instance<F, C>> & Creatable<Instance<F, C>>>(childFactory: F, key?: string): InstanceType<F>;
  appendChild<Child extends C>(child: Child | LikeType<Child>, key?: string): Child;
  appendChild(child: C | LikeType<C>, key?: string): C;
  appendChild(this: C, child: C | LikeType<C>, key?: string): C {
    child = (this.componentType as unknown as FromLike<C>).fromLike(child);

    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
    }

    child.setFlags(child.flags | Component.InsertingFlag);
    child.setKey(key);
    this.willInsertChild(child, null);
    this.insertChildMap(child);
    child.attachParent(this, null);
    this.onInsertChild(child, null);
    this.didInsertChild(child, null);
    child.cascadeInsert();
    child.setFlags(child.flags & ~Component.InsertingFlag);

    return child;
  }

  prependChild<F extends Class<Instance<F, C>> & Creatable<Instance<F, C>>>(childFactory: F, key?: string): InstanceType<F>;
  prependChild<Child extends C>(child: Child | LikeType<Child>, key?: string): Child;
  prependChild(child: C | LikeType<C>, key?: string): C;
  prependChild(this: C, child: C | LikeType<C>, key?: string): C {
    child = (this.componentType as unknown as FromLike<C>).fromLike(child);

    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
    }
    const target = this.firstChild;

    child.setFlags(child.flags | Component.InsertingFlag);
    child.setKey(key);
    this.willInsertChild(child, target);
    this.insertChildMap(child);
    child.attachParent(this, target);
    this.onInsertChild(child, target);
    this.didInsertChild(child, target);
    child.cascadeInsert();
    child.setFlags(child.flags & ~Component.InsertingFlag);

    return child;
  }

  insertChild<F extends Class<Instance<F, C>> & Creatable<Instance<F, C>>>(childFactory: F, target: C | null, key?: string): InstanceType<F>;
  insertChild<Child extends C>(child: Child | LikeType<Child>, target: C | null, key?: string): Child;
  insertChild(child: C | LikeType<C>, target: C | null, key?: string): C;
  insertChild(this: C, child: C | LikeType<C>, target: C | null, key?: string): C {
    child = (this.componentType as unknown as FromLike<C>).fromLike(child);

    if (target !== null && target.parent !== this) {
      target = null;
    }

    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
    }

    child.setFlags(child.flags | Component.InsertingFlag);
    child.setKey(key);
    this.willInsertChild(child, target);
    this.insertChildMap(child);
    child.attachParent(this, target);
    this.onInsertChild(child, target);
    this.didInsertChild(child, target);
    child.cascadeInsert();
    child.setFlags(child.flags & ~Component.InsertingFlag);

    return child;
  }

  replaceChild<F extends Class<Instance<F, C>> & Creatable<Instance<F, C>>>(newChildFactory: F, oldChild: C): C;
  replaceChild<Child extends C>(newChild: C | LikeType<C>, oldChild: Child): Child;
  replaceChild(newChild: C | LikeType<C>, oldChild: C): C;
  replaceChild(this: C, newChild: C | LikeType<C>, oldChild: C): C {
    if (oldChild.parent !== this) {
      throw new Error("replacement target is not a child");
    }

    newChild = (this.componentType as unknown as FromLike<C>).fromLike(newChild);

    if (newChild === oldChild) {
      return oldChild;
    }

    newChild.remove();
    const target = oldChild.nextSibling;

    if ((oldChild.flags & Component.RemovingFlag) === 0) {
      oldChild.setFlags(oldChild.flags | Component.RemovingFlag);
      this.willRemoveChild(oldChild);
      oldChild.detachParent(this);
      this.removeChildMap(oldChild);
      this.onRemoveChild(oldChild);
      this.didRemoveChild(oldChild);
      oldChild.setKey(void 0);
      oldChild.setFlags(oldChild.flags & ~Component.RemovingFlag);
    }

    newChild.setFlags(newChild.flags | Component.InsertingFlag);
    newChild.setKey(oldChild.key);
    this.willInsertChild(newChild, target);
    this.insertChildMap(newChild);
    newChild.attachParent(this, target);
    this.onInsertChild(newChild, target);
    this.didInsertChild(newChild, target);
    newChild.cascadeInsert();
    newChild.setFlags(newChild.flags & ~Component.InsertingFlag);

    return oldChild;
  }

  get insertChildFlags(): ComponentFlags {
    return (this.constructor as typeof Component).InsertChildFlags;
  }

  get inserting(): boolean {
    return (this.flags & Component.InsertingFlag) !== 0;
  }

  protected willInsertChild(child: C, target: C | null): void {
    // hook
  }

  protected onInsertChild(child: C, target: C | null): void {
    this.requireUpdate(this.insertChildFlags);
    this.bindChildFasteners(child, target);
  }

  protected didInsertChild(child: C, target: C | null): void {
    // hook
  }

  /** @internal */
  cascadeInsert(): void {
    // hook
  }

  removeChild<Child extends C>(child: Child): Child;
  removeChild(child: C): C;
  removeChild(key: string | C): C | null;
  removeChild(this: C, key: string | C): C | null {
    let child: C | null;
    if (typeof key === "string") {
      child = this.getChild(key);
      if (child === null) {
        return null;
      }
    } else {
      child = key;
      if (child.parent !== this) {
        throw new Error("not a child");
      }
    }

    if ((child.flags & Component.RemovingFlag) === 0) {
      child.setFlags(child.flags | Component.RemovingFlag);
      this.willRemoveChild(child);
      child.detachParent(this);
      this.removeChildMap(child);
      this.onRemoveChild(child);
      this.didRemoveChild(child);
      child.setKey(void 0);
      child.setFlags(child.flags & ~Component.RemovingFlag);
    }

    return child;
  }

  get removeChildFlags(): ComponentFlags {
    return (this.constructor as typeof Component).RemoveChildFlags;
  }

  get removing(): boolean {
    return (this.flags & Component.RemovingFlag) !== 0;
  }

  protected willRemoveChild(child: C): void {
    // hook
  }

  protected onRemoveChild(child: C): void {
    this.requireUpdate(this.removeChildFlags);
    this.unbindChildFasteners(child);
  }

  protected didRemoveChild(child: C): void {
    // hook
  }

  removeChildren(): void
  removeChildren(this: C): void {
    let child: C | null;
    while (child = this.lastChild, child !== null) {
      if ((child.flags & Component.RemovingFlag) !== 0) {
        throw new Error("inconsistent removeChildren");
      }
      this.willRemoveChild(child);
      child.detachParent(this);
      this.removeChildMap(child);
      this.onRemoveChild(child);
      this.didRemoveChild(child);
      child.setKey(void 0);
      child.setFlags(child.flags & ~Component.RemovingFlag);
    }
  }

  remove(): void;
  remove(this: C): void {
    const parent = this.parent;
    if (parent !== null) {
      parent.removeChild(this);
    } else if (this.mounted) {
      this.unmount();
    }
  }

  get reinsertChildFlags(): ComponentFlags {
    return (this.constructor as typeof Component).ReinsertChildFlags;
  }

  reinsertChild(child: C, target: C | null): void;
  reinsertChild(this: C, child: C, target: C | null): void {
    if (child.parent !== this) {
      throw new Error("not a child");
    } else if (target !== null && target.parent !== this) {
      throw new Error("reinsert target is not a child");
    } else if (child.nextSibling === target) {
      return;
    }

    this.willReinsertChild(child, target);
    child.reattachParent(target);
    this.onReinsertChild(child, target);
    this.didReinsertChild(child, target);
  }

  protected willReinsertChild(child: C, target: C | null): void {
    // hook
  }

  protected onReinsertChild(child: C, target: C | null): void {
    this.requireUpdate(this.reinsertChildFlags);
  }

  protected didReinsertChild(child: C, target: C | null): void {
    // hook
  }

  sortChildren(comparator: Comparator<C>): void {
    let child = this.firstChild;
    if (child === null) {
      return;
    }

    const children: C[] = [];
    do {
      children.push(child);
      child = child.nextSibling;
    } while (child !== null);
    children.sort(comparator);

    child = children[0]!;
    this.setFirstChild(child);
    child.setPreviousSibling(null);
    for (let i = 1; i < children.length; i += 1) {
      const next = children[i]!;
      child.setNextSibling(next);
      next.setPreviousSibling(child);
      child = next;
    }
    child.setNextSibling(null);
    this.setLastChild(child);
  }

  getTargetChild(child: C, comparator: Comparator<C>): C | null {
    let target = this.lastChild;
    while (target !== null) {
      if (target !== child && comparator(child, target) >= 0) {
        target = target.nextSibling;
        if (target === child) {
          target = target.nextSibling;
        }
        return target;
      }
      target = target.previousSibling;
    }
    target = this.firstChild;
    if (target === child) {
      target = target.nextSibling;
    }
    return target;
  }

  getAncestor<F extends Class<C>>(ancestorType: F): InstanceType<F> | null;
  getAncestor(ancestorType: Class<C>): C | null;
  getAncestor(ancestorType: Class<C>): C | null {
    let ancestor = this.parent;
    while (ancestor !== null) {
      if (ancestor instanceof ancestorType) {
        return ancestor;
      }
      ancestor = ancestor.parent;
    }
    return null;
  }

  getRoot<F extends Class<C>>(rootType: F): InstanceType<F> | null;
  getRoot(rootType: Class<C>): C | null;
  getRoot(rootType: Class<C>): C | null {
    let base: C | null = null;
    let ancestor = this.parent;
    while (ancestor !== null) {
      if (ancestor instanceof rootType) {
        base = ancestor;
      }
      ancestor = ancestor.parent;
    }
    return base;
  }

  isAncestorOf(descendant: C | null): boolean;
  isAncestorOf(this: C, descendant: C | null): boolean {
    while (descendant !== null) {
      if (descendant === this) {
        return true;
      }
      descendant = descendant.parent;
    }
    return false;
  }

  commonAncestor(relative: C | null): C | null;
  commonAncestor(this: C, relative: C | null): C | null {
    while (relative !== null) {
      if (relative.isAncestorOf(this)) {
        return relative;
      }
      relative = relative.parent;
    }
    return null;
  }

  get mounted(): boolean {
    return (this.flags & Component.MountedFlag) !== 0;
  }

  get mountFlags(): ComponentFlags {
    return (this.constructor as typeof Component).MountFlags;
  }

  mount(): void {
    if (this.mounted || this.parent !== null) {
      return;
    }
    this.setFlags(this.flags | Component.InsertingFlag);
    this.cascadeMount();
    this.cascadeInsert();
    this.setFlags(this.flags & ~Component.InsertingFlag);
  }

  /** @internal */
  cascadeMount(): void {
    if ((this.flags & Component.MountedFlag) !== 0) {
      throw new Error("already mounted");
    }
    this.willMount();
    this.setFlags(this.flags | Component.MountedFlag);
    this.onMount();
    this.mountChildren();
    this.didMount();
  }

  protected willMount(): void {
    // hook
  }

  protected onMount(): void {
    // hook
  }

  protected didMount(): void {
    this.requireUpdate(this.mountFlags);
    this.mountFasteners();
  }

  /** @internal */
  protected mountChildren(): void;
  protected mountChildren(this: C): void {
    let child = this.firstChild;
    while (child !== null) {
      const next = child.nextSibling;
      child.cascadeMount();
      if (next !== null && next.parent !== this) {
        throw new Error("inconsistent mount");
      }
      child = next;
    }
  }

  unmount(): void {
    if (!this.mounted || this.parent !== null) {
      return;
    }
    this.cascadeUnmount();
  }

  /** @internal */
  cascadeUnmount(): void {
    if ((this.flags & Component.MountedFlag) === 0) {
      throw new Error("already unmounted");
    }
    this.willUnmount();
    this.setFlags(this.flags & ~Component.MountedFlag);
    this.unmountChildren();
    this.onUnmount();
    this.didUnmount();
  }

  protected willUnmount(): void {
    this.unmountFasteners();
  }

  protected onUnmount(): void {
    // hook
  }

  protected didUnmount(): void {
    // hook
  }

  /** @internal */
  protected unmountChildren(): void;
  protected unmountChildren(this: C): void {
    let child = this.lastChild;
    while (child !== null) {
      const prev = child.previousSibling;
      child.cascadeUnmount();
      if (prev !== null && prev.parent !== this) {
        throw new Error("inconsistent unmount");
      }
      child = prev;
    }
  }

  requireUpdate(updateFlags: ComponentFlags, immediate?: boolean): void {
    // hook
  }

  tryFastener<K extends keyof this, F extends this[K] = this[K]>(fastenerName: K): (F extends Fastener<any, any, any> ? F | null : never) | null {
    const metaclass = FastenerContext.getMetaclass(this);
    return metaclass !== null ? metaclass.tryFastener(this, fastenerName) : null;
  }

  getFastener<F extends Fastener<any, any, any>>(fastenerName: PropertyKey, fastenerType?: Proto<F>, contextType?: Proto<any> | null): F | null {
    if (contextType !== void 0 && contextType !== null && !(this instanceof contextType)) {
      return null;
    }
    const fastener = (this as any)[fastenerName] as F | null | undefined;
    if (fastener === void 0 || (fastenerType !== void 0 && fastenerType !== null && !(fastener instanceof fastenerType))) {
      return null;
    }
    return fastener;
  }

  /** @override */
  getParentFastener<F extends Fastener<any, any, any>>(fastenerName: PropertyKey, fastenerType?: Proto<F>, contextType?: Proto<any> | null): F | null {
    let parent = this.parent;
    while (parent !== null) {
      const fastener = parent.getFastener(fastenerName, fastenerType, contextType);
      if (fastener !== null) {
        return fastener;
      }
      parent = parent.parent;
    }
    return null;
  }

  /** @override */
  attachFastener(fastener: Fastener<any, any, any>): void {
    if (this.mounted) {
      fastener.mount();
    }
    this.bindFastener(fastener);
  }

  /** @internal */
  protected mountFasteners(): void {
    const metaclass = FastenerContext.getMetaclass(this);
    if (metaclass === null) {
      return;
    }
    const fastenerSlots = metaclass.slots;
    for (let i = 0; i < fastenerSlots.length; i += 1) {
      const fastener = this[fastenerSlots[i]!];
      if (fastener instanceof Fastener) {
        fastener.mount();
      }
    }
  }

  /** @internal */
  protected unmountFasteners(): void {
    const metaclass = FastenerContext.getMetaclass(this);
    if (metaclass === null) {
      return;
    }
    const fastenerSlots = metaclass.slots;
    for (let i = 0; i < fastenerSlots.length; i += 1) {
      const fastener = this[fastenerSlots[i]!];
      if (fastener instanceof Fastener) {
        fastener.unmount();
      }
    }
  }

  protected bindFastener(fastener: Fastener<any, any, any>): void;
  protected bindFastener(this: C, fastener: Fastener<any, any, any>): void {
    if (!fastener.binds) {
      return;
    }
    let child = this.firstChild;
    while (child !== null) {
      const next = child.nextSibling;
      this.bindChildFastener(fastener, child, next);
      child = next !== null && next.parent === this ? next : null;
    }
  }

  /** @internal */
  protected bindChildFasteners(child: C, target: C | null): void {
    const metaclass = FastenerContext.getMetaclass(this);
    if (metaclass === null) {
      return;
    }
    const fastenerSlots = metaclass.slots;
    for (let i = 0; i < fastenerSlots.length; i += 1) {
      const fastener = this[fastenerSlots[i]!];
      if (fastener instanceof Fastener) {
        this.bindChildFastener(fastener, child, target);
      }
    }
  }

  /** @internal */
  protected bindChildFastener(fastener: Fastener<any, any, any>, child: C, target: C | null): void {
    if (fastener instanceof ComponentRelation || fastener instanceof EventHandler) {
      fastener.bindComponent(child, target);
    }
  }

  /** @internal */
  protected unbindChildFasteners(child: C): void {
    const metaclass = FastenerContext.getMetaclass(this);
    if (metaclass === null) {
      return;
    }
    const fastenerSlots = metaclass.slots;
    for (let i = 0; i < fastenerSlots.length; i += 1) {
      const fastener = this[fastenerSlots[i]!];
      if (fastener instanceof Fastener) {
        this.unbindChildFastener(fastener, child);
      }
    }
  }

  /** @internal */
  protected unbindChildFastener(fastener: Fastener<any, any, any>, child: C): void {
    if (fastener instanceof ComponentRelation || fastener instanceof EventHandler) {
      fastener.unbindComponent(child);
    }
  }

  set<S>(this: S, properties: {[K in keyof S as S[K] extends {set(value: any): any} ? K : never]?: S[K] extends {set(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): this;
  set(properties: {[K in keyof this as this[K] extends {set(value: any): any} ? K : never]?: this[K] extends {set(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): this {
    for (const key in properties) {
      const value = properties[key];
      const property = (this as any)[key] as {set?(value: any): any} | undefined;
      if (property === void 0 || property === null) {
        throw new Error("unknown property " + key);
      } else if (property.set === void 0) {
        throw new Error("unsettable property " + key);
      } else if (property instanceof Animator) {
        property.set(value, timing);
      } else {
        property.set(value);
      }
    }
    return this;
  }

  setIntrinsic<S>(this: S, properties: {[K in keyof S as S[K] extends {setIntrinsic(value: any): any} ? K : never]?: S[K] extends {setIntrinsic(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): this;
  setIntrinsic(properties: {[K in keyof this as this[K] extends {setIntrinsic(value: any): any} ? K : never]?: this[K] extends {setIntrinsic(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): this {
    for (const key in properties) {
      const value = properties[key];
      const property = (this as any)[key] as {setIntrinsic?(value: any): any} | undefined;
      if (property === void 0 || property === null) {
        throw new Error("unknown property " + key);
      } else if (property.setIntrinsic === void 0) {
        throw new Error("unsettable property " + key);
      } else if (property instanceof Animator) {
        property.setIntrinsic(value, timing);
      } else {
        property.setIntrinsic(value);
      }
    }
    return this;
  }

  /** @internal */
  readonly coherentTime: number;

  /** @internal */
  readonly decoherent: readonly Fastener<any, any, any>[] | null;

  /** @internal */
  readonly recohering: readonly Fastener<any, any, any>[] | null;

  /** @override */
  decohereFastener(fastener: Fastener<any, any, any>): void {
    const recohering = this.recohering as Fastener<any, any, any>[] | null;
    if (recohering !== null && fastener.coherentTime !== this.coherentTime) {
      recohering.push(fastener);
      return;
    }
    this.enqueueFastener(fastener);
  }

  protected enqueueFastener(fastener: Fastener<any, any, any>): void {
    let decoherent = this.decoherent as Fastener<any, any, any>[] | null;
    if (decoherent === null) {
      decoherent = [];
      (this as Mutable<this>).decoherent = decoherent;
    }
    decoherent.push(fastener);
  }

  recohereFasteners(t?: number): void {
    const decoherent = this.decoherent;
    if (decoherent === null || decoherent.length === 0) {
      return;
    } else if (t === void 0) {
      t = performance.now();
    }
    (this as Mutable<this>).coherentTime = t;
    (this as Mutable<this>).decoherent = null;
    (this as Mutable<this>).recohering = decoherent;
    try {
      for (let i = 0; i < decoherent.length; i += 1) {
        const fastener = decoherent[i]!;
        fastener.recohere(t);
      }
    } finally {
      (this as Mutable<this>).recohering = null;
    }
  }

  /** @internal */
  readonly observers: ReadonlySet<Observes<this>> | null;

  /** @override */
  observe(observer: Observes<this>): void {
    let observers = this.observers as Set<Observes<this>> | null;
    if (observers === null) {
      observers = new Set<Observes<this>>();
      (this as Mutable<this>).observers = observers;
    } else if (observers.has(observer)) {
      return;
    }
    this.willObserve(observer);
    observers.add(observer);
    this.onObserve(observer);
    this.didObserve(observer);
  }

  protected willObserve(observer: Observes<this>): void {
    // hook
  }

  protected onObserve(observer: Observes<this>): void {
    // hook
  }

  protected didObserve(observer: Observes<this>): void {
    // hook
  }

  /** @override */
  unobserve(observer: Observes<this>): void {
    const observers = this.observers as Set<Observes<this>> | null;
    if (observers === null || !observers.has(observer)) {
      return;
    }
    this.willUnobserve(observer);
    observers.delete(observer);
    this.onUnobserve(observer);
    this.didUnobserve(observer);
  }

  protected willUnobserve(observer: Observes<this>): void {
    // hook
  }

  protected onUnobserve(observer: Observes<this>): void {
    // hook
  }

  protected didUnobserve(observer: Observes<this>): void {
    // hook
  }

  callObservers<O, K extends keyof ObserverMethods<O>>(this: {readonly observerType?: Class<O>}, key: K, ...args: ObserverParameters<O, K>): void {
    const observers = (this as Component).observers as ReadonlySet<ObserverMethods<O>> | null;
    if (observers === null) {
      return;
    }
    for (const observer of observers) {
      const method = observer[key];
      if (typeof method === "function") {
        method.call(observer, ...args);
      }
    }
  }

  /** @override */
  equals(that: unknown): boolean {
    return this === that;
  }

  /** @override */
  hashCode(): number {
    return Murmur3.mash(Murmur3.mixString(0, this.uid));
  }

  static create<S extends new () => InstanceType<S>>(this: S): InstanceType<S> {
    return new this();
  }

  static fromLike<S extends Class<Instance<S, Component>>>(this: S, value: InstanceType<S> | LikeType<InstanceType<S>>): InstanceType<S> {
    if (value === void 0 || value === null) {
      return value as InstanceType<S>;
    } else if (value instanceof Component) {
      if (!(value instanceof this)) {
        throw new TypeError(value + " not an instance of " + this);
      }
      return value;
    } else if (Creatable[Symbol.hasInstance](value)) {
      return (value as Creatable<InstanceType<S>>).create();
    }
    throw new TypeError("" + value);
  }

  /** @internal */
  static uid: () => string = (function () {
    let nextId = 1;
    return function uid(): string {
      const id = ~~nextId;
      nextId += 1;
      return "component" + id;
    };
  })();

  /** @internal */
  declare static readonly fieldInitializers?: {[name: PropertyKey]: Function[]};
  /** @internal */
  declare static readonly instanceInitializers?: Function[];

  /** @internal */
  static initDecorators(): void {
    // Ensure each component class has its own metadata and decorator initializer fields.
    if (!Object.hasOwnProperty.call(this, Symbol.metadata)) {
      const superMetadata: Record<PropertyKey, unknown> & object /*DecoratorMetadataObject*/ | undefined = Object.getPrototypeOf(this)[Symbol.metadata];
      Object.defineProperty(this, Symbol.metadata, {
        value: Object.create(superMetadata !== void 0 ? superMetadata : null),
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }
    if (!Object.hasOwnProperty.call(this, "fieldInitializers")) {
      Object.defineProperty(this, "fieldInitializers", {
        value: {},
        enumerable: true,
        configurable: true,
      });
    }
    if (!Object.hasOwnProperty.call(this, "instanceInitializers")) {
      Object.defineProperty(this, "instanceInitializers", {
        value: [],
        enumerable: true,
        configurable: true,
      });
    }
  }

  /** @internal */
  static defineField<S extends Class<Instance<S, Component>>, C extends InstanceType<S>, K extends keyof C>(this: S, name: K, decorators: C[K] extends Fastener<any, any, any> ? FastenerDecorator<C[K]>[] : never): void {
    const componentClass = this as unknown as typeof Component;
    componentClass.initDecorators();
    __esDecorate(null, null, decorators as Function[], {
      kind: "field",
      name,
      static: false,
      private: false,
      access: {
        has(obj: C): boolean {
          return name in obj;
        },
        get(obj: C): C[K] {
          return obj[name];
        },
        set(obj: C, value: C[K]): void {
          obj[name] = value;
        },
      },
      metadata: componentClass[Symbol.metadata],
    }, componentClass.fieldInitializers![name] = [], componentClass.instanceInitializers!);
  }

  /** @internal */
  static defineGetter<S extends Class<Instance<S, Component>>, C extends InstanceType<S>, K extends keyof C>(this: S, name: K, decorators: C[K] extends Fastener<any, any, any> ? FastenerDecorator<C[K]>[] : never): void {
    const componentClass = this as unknown as typeof Component;
    componentClass.initDecorators();
    Object.defineProperty(componentClass.prototype, name, {
      get: Fastener.getter,
      enumerable: true,
      configurable: true,
    });
    __esDecorate(componentClass, null, decorators as Function[], {
      kind: "getter",
      name,
      static: false,
      private: false,
      access: {
        has(obj: C): boolean {
          return name in obj;
        },
        get(obj: C): C[K] {
          return obj[name];
        },
        set(obj: C, value: C[K]): void {
          obj[name] = value;
        },
      },
      metadata: componentClass[Symbol.metadata],
    }, null, componentClass.instanceInitializers!);
  }

  /** @internal */
  static initFasteners<S extends Class<Instance<S, Component>>>(this: S, fastener: InstanceType<S>): void {
    const componentClass = this as unknown as typeof Component;
    if (!Object.hasOwnProperty.call(componentClass, "fieldInitializers")
        || !Object.hasOwnProperty.call(componentClass, "instanceInitializers")) {
      return;
    }
    __runInitializers(fastener, componentClass.instanceInitializers!);
    for (const key in componentClass.fieldInitializers!) {
      (fastener as any)[key] = __runInitializers(fastener, componentClass.fieldInitializers[key]!, void 0);
    }
  }

  /** @internal */
  static readonly MountedFlag: ComponentFlags = 1 << 0;
  /** @internal */
  static readonly InsertingFlag: ComponentFlags = 1 << 1;
  /** @internal */
  static readonly RemovingFlag: ComponentFlags = 1 << 2;

  /** @internal */
  static readonly FlagShift: number = 3;
  /** @internal */
  static readonly FlagMask: ComponentFlags = (1 << this.FlagShift) - 1;

  static readonly MountFlags: ComponentFlags = 0;
  static readonly InsertChildFlags: ComponentFlags = 0;
  static readonly RemoveChildFlags: ComponentFlags = 0;
  static readonly ReinsertChildFlags: ComponentFlags = 0;
}
