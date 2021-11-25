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

import {
  Mutable,
  Class,
  Family,
  Arrays,
  HashCode,
  Comparator,
  Dictionary,
  MutableDictionary,
  ObserverType,
  Observable,
  ObserverMethods,
  ObserverParameters,
} from "@swim/util";
import {FastenerContext} from "../fastener/FastenerContext";
import type {Fastener} from "../fastener/Fastener";
import type {ComponentObserver} from "./ComponentObserver";

/** @beta */
export type ComponentFlags = number;

/** @beta */
export class Component implements HashCode, Family, Observable, FastenerContext {
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
    this.fasteners = null;
    this.decoherent = null;
    this.observers = Arrays.empty;

    FastenerContext.init(this);
  }

  /** @override */
  readonly familyType?: Class<Component>;

  /** @override */
  readonly observerType?: Class<ComponentObserver>;

  /** @internal */
  readonly uid: number;

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

  readonly parent: Component | null;

  /** @internal */
  attachParent(parent: Component, nextSibling: Component | null): void {
    // assert(this.parent === null);
    this.willAttachParent(parent);
    (this as Mutable<this>).parent = parent;
    let previousSibling: Component | null;
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

  protected willAttachParent(parent: Component): void {
    // hook
  }

  protected onAttachParent(parent: Component): void {
    // hook
  }

  protected didAttachParent(parent: Component): void {
    // hook
  }

  /** @internal */
  detachParent(parent: Component): void {
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

  protected willDetachParent(parent: Component): void {
    // hook
  }

  protected onDetachParent(parent: Component): void {
    // hook
  }

  protected didDetachParent(parent: Component): void {
    // hook
  }

  readonly nextSibling: Component | null;

  /** @internal */
  setNextSibling(nextSibling: Component | null): void {
    (this as Mutable<this>).nextSibling = nextSibling;
  }

  readonly previousSibling: Component | null;

  /** @internal */
  setPreviousSibling(previousSibling: Component | null): void {
    (this as Mutable<this>).previousSibling = previousSibling;
  }

  readonly firstChild: Component | null;

  /** @internal */
  setFirstChild(firstChild: Component | null): void {
    (this as Mutable<this>).firstChild = firstChild;
  }

  readonly lastChild: Component | null;

  /** @internal */
  setLastChild(lastChild: Component | null): void {
    (this as Mutable<this>).lastChild = lastChild;
  }

  forEachChild<T>(callback: (child: Component) => T | void): T | undefined;
  forEachChild<T, S>(callback: (this: S, child: Component) => T | void, thisArg: S): T | undefined;
  forEachChild<T, S>(callback: (this: S | undefined, child: Component) => T | void, thisArg?: S): T | undefined {
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
  readonly childMap: Dictionary<Component> | null;

  /** @internal */
  protected insertChildMap(child: Component): void {
    const key = child.key;
    if (key !== void 0) {
      let childMap = this.childMap as MutableDictionary<Component>;
      if (childMap === null) {
        childMap = {};
        (this as Mutable<this>).childMap = childMap;
      }
      childMap[key] = child;
    }
  }

  /** @internal */
  protected removeChildMap(child: Component): void {
    const key = child.key;
    if (key !== void 0) {
      const childMap = this.childMap as MutableDictionary<Component>;
      if (childMap !== null) {
        delete childMap[key];
      }
    }
  }

  getChild<F extends abstract new (...args: any[]) => Component>(key: string, childBound: F): InstanceType<F> | null;
  getChild(key: string, childBound?: abstract new (...args: any[]) => Component): Component | null;
  getChild(key: string, childBound?: abstract new (...args: any[]) => Component): Component | null {
    const childMap = this.childMap;
    if (childMap !== null) {
      const child = childMap[key];
      if (child !== void 0 && (childBound === void 0 || child instanceof childBound)) {
        return child;
      }
    }
    return null;
  }

  setChild(key: string, newChild: Component | null): Component | null {
    const oldChild = this.getChild(key);
    let target: Component | null;

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

      newChild.setKey(oldChild.key);
      this.willInsertChild(newChild, target);
      this.insertChildMap(newChild);
      newChild.attachParent(this, target);
      this.onInsertChild(newChild, target);
      this.didInsertChild(newChild, target);
      newChild.cascadeInsert();
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

        newChild.setKey(key);
        this.willInsertChild(newChild, target);
        this.insertChildMap(newChild);
        newChild.attachParent(this, target);
        this.onInsertChild(newChild, target);
        this.didInsertChild(newChild, target);
        newChild.cascadeInsert();
      }
    }

    return oldChild;
  }

  appendChild<C extends Component>(child: C, key?: string): C {
    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
    }

    child.setKey(key);
    this.willInsertChild(child, null);
    this.insertChildMap(child);
    child.attachParent(this, null);
    this.onInsertChild(child, null);
    this.didInsertChild(child, null);
    child.cascadeInsert();

    return child;
  }

  prependChild<C extends Component>(child: C, key?: string): C {
    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
    }
    const target = this.firstChild;

    child.setKey(key);
    this.willInsertChild(child, target);
    this.insertChildMap(child);
    child.attachParent(this, target);
    this.onInsertChild(child, target);
    this.didInsertChild(child, target);
    child.cascadeInsert();

    return child;
  }

  insertChild<C extends Component>(child: C, target: Component | null, key?: string): C {
    if (target !== null && target.parent !== this) {
      throw new Error("insert target is not a child");
    }

    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
    }

    child.setKey(key);
    this.willInsertChild(child, target);
    this.insertChildMap(child);
    child.attachParent(this, target);
    this.onInsertChild(child, target);
    this.didInsertChild(child, target);
    child.cascadeInsert();

    return child;
  }

  replaceChild<C extends Component>(newChild: Component, oldChild: C): C {
    if (oldChild.parent !== this) {
      throw new Error("replacement target is not a child");
    }

    if (newChild !== oldChild) {
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

      newChild.setKey(oldChild.key);
      this.willInsertChild(newChild, target);
      this.insertChildMap(newChild);
      newChild.attachParent(this, target);
      this.onInsertChild(newChild, target);
      this.didInsertChild(newChild, target);
      newChild.cascadeInsert();
    }

    return oldChild;
  }

  get insertChildFlags(): ComponentFlags {
    return (this.constructor as typeof Component).InsertChildFlags;
  }

  protected willInsertChild(child: Component, target: Component | null): void {
    // hook
  }

  protected onInsertChild(child: Component, target: Component | null): void {
    this.requireUpdate(this.insertChildFlags);
  }

  protected didInsertChild(child: Component, target: Component | null): void {
    // hook
  }

  /** @internal */
  cascadeInsert(): void {
    // hook
  }

  removeChild<C extends Component>(child: C): C;
  removeChild(key: string | Component): Component | null;
  removeChild(key: string | Component): Component | null {
    let child: Component | null;
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

  protected willRemoveChild(child: Component): void {
    // hook
  }

  protected onRemoveChild(child: Component): void {
    this.requireUpdate(this.removeChildFlags);
  }

  protected didRemoveChild(child: Component): void {
    // hook
  }

  removeChildren(): void {
    let child: Component | null;
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

  remove(): void {
    const parent: Component | null = this.parent;
    if (parent !== null) {
      parent.removeChild(this);
    }
  }

  sortChildren(comparator: Comparator<Component>): void {
    let child = this.firstChild;
    if (child !== null) {
      const children: Component[] = [];
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
  }

  getSuper<F extends abstract new (...args: any[]) => Component>(superBound: F): InstanceType<F> | null;
  getSuper(superBound: abstract new (...args: any[]) => Component): Component | null;
  getSuper(superBound: abstract new (...args: any[]) => Component): Component | null {
    const parent = this.parent;
    if (parent === null) {
      return null;
    } else if (parent instanceof superBound) {
      return parent;
    } else {
      return (parent as Component).getSuper(superBound);
    }
  }

  getBase<F extends abstract new (...args: any[]) => Component>(baseBound: F): InstanceType<F> | null;
  getBase(baseBound: abstract new (...args: any[]) => Component): Component | null;
  getBase(baseBound: abstract new (...args: any[]) => Component): Component | null {
    const parent = this.parent;
    if (parent === null) {
      return null;
    } else {
      const base = parent.getBase(baseBound);
      if (base !== null) {
        return base;
      } else {
        return parent instanceof baseBound ? parent : null;
      }
    }
  }

  get mounted(): boolean {
    return (this.flags & Component.MountedFlag) !== 0;
  }

  get mountFlags(): ComponentFlags {
    return (this.constructor as typeof Component).MountFlags;
  }

  mount(): void {
    if (!this.mounted && this.parent === null) {
      this.cascadeMount();
      this.cascadeInsert();
    }
  }

  /** @internal */
  cascadeMount(): void {
    if ((this.flags & Component.MountedFlag) === 0) {
      this.willMount();
      this.setFlags(this.flags | Component.MountedFlag);
      this.onMount();
      this.mountChildren();
      this.didMount();
    } else {
      throw new Error("already mounted");
    }
  }

  protected willMount(): void {
    // hook
  }

  protected onMount(): void {
    this.requireUpdate(this.mountFlags);
    this.mountFasteners();
  }

  protected didMount(): void {
    // hook
  }

  /** @internal */
  protected mountChildren(): void {
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
    if (this.mounted && this.parent === null) {
      this.cascadeUnmount();
    }
  }

  /** @internal */
  cascadeUnmount(): void {
    if ((this.flags & Component.MountedFlag) !== 0) {
      this.willUnmount();
      this.setFlags(this.flags & ~Component.MountedFlag);
      this.unmountChildren();
      this.onUnmount();
      this.didUnmount();
    } else {
      throw new Error("already unmounted");
    }
  }

  protected willUnmount(): void {
    // hook
  }

  protected onUnmount(): void {
    this.unmountFasteners();
  }

  protected didUnmount(): void {
    // hook
  }

  /** @internal */
  protected unmountChildren(): void {
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

  /** @internal */
  readonly fasteners: {[fastenerName: string]: Fastener | undefined} | null;

  /** @override */
  hasFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): boolean {
    const fasteners = this.fasteners;
    if (fasteners !== null) {
      const fastener = fasteners[fastenerName];
      if (fastener !== void 0 && (fastenerBound === void 0 || fastenerBound === null || fastener instanceof fastenerBound)) {
        return true;
      }
    }
    return false;
  }

  /** @override */
  getFastener<F extends Fastener<any>>(fastenerName: string, fastenerBound: Class<F>): F | null;
  /** @override */
  getFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null;
  getFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null {
    const fasteners = this.fasteners;
    if (fasteners !== null) {
      const fastener = fasteners[fastenerName];
      if (fastener !== void 0 && (fastenerBound === void 0 || fastenerBound === null || fastener instanceof fastenerBound)) {
        return fastener;
      }
    }
    return null;
  }

  /** @override */
  setFastener(fastenerName: string, newFastener: Fastener | null): void {
    const fasteners = this.fasteners;
    const oldFastener: Fastener | null | undefined = fasteners !== null ? fasteners[fastenerName] ?? null : null;
    if (oldFastener !== newFastener) {
      if (oldFastener !== null) {
        this.detachFastener(fastenerName, oldFastener);
      }
      if (newFastener !== null) {
        this.attachFastener(fastenerName, newFastener);
      }
    }
  }

  /** @internal */
  protected attachFastener(fastenerName: string, fastener: Fastener): void {
    let fasteners = this.fasteners;
    if (fasteners === null) {
      fasteners = {};
      (this as Mutable<this>).fasteners = fasteners;
    }
    // assert(fasteners[fastenerName] === void 0);
    this.willAttachFastener(fastenerName, fastener);
    fasteners[fastenerName] = fastener;
    if (this.mounted) {
      fastener.mount();
    }
    this.onAttachFastener(fastenerName, fastener);
    this.didAttachFastener(fastenerName, fastener);
  }

  protected willAttachFastener(fastenerName: string, fastener: Fastener): void {
    // hook
  }

  protected onAttachFastener(fastenerName: string, fastener: Fastener): void {
    // hook
  }

  protected didAttachFastener(fastenerName: string, fastener: Fastener): void {
    // hook
  }

  /** @internal */
  protected detachFastener(fastenerName: string, fastener: Fastener): void {
    const fasteners = this.fasteners!;
    // assert(fasteners !== null);
    // assert(fasteners[fastenerName] === fastener);
    this.willDetachFastener(fastenerName, fastener);
    this.onDetachFastener(fastenerName, fastener);
    if (this.mounted) {
      fastener.unmount();
    }
    delete fasteners[fastenerName];
    this.didDetachFastener(fastenerName, fastener);
  }

  protected willDetachFastener(fastenerName: string, fastener: Fastener): void {
    // hook
  }

  protected onDetachFastener(fastenerName: string, fastener: Fastener): void {
    // hook
  }

  protected didDetachFastener(fastenerName: string, fastener: Fastener): void {
    // hook
  }

  /** @override */
  getLazyFastener<F extends Fastener<any>>(fastenerName: string, fastenerBound: Class<F>): F | null;
  /** @override */
  getLazyFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null;
  getLazyFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null {
    return FastenerContext.getLazyFastener(this, fastenerName, fastenerBound);
  }

  /** @override */
  getSuperFastener<F extends Fastener<any>>(fastenerName: string, fastenerBound: Class<F>): F | null;
  /** @override */
  getSuperFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null;
  getSuperFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null {
    const parent = this.parent;
    if (parent === null) {
      return null;
    } else {
      const parentFastener = parent.getLazyFastener(fastenerName, fastenerBound);
      if (parentFastener !== null) {
        return parentFastener;
      } else {
        return parent.getSuperFastener(fastenerName, fastenerBound);
      }
    }
  }

  /** @internal */
  protected mountFasteners(): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      fastener.mount();
    }
  }

  /** @internal */
  protected unmountFasteners(): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      fastener.unmount();
    }
  }

  /** @internal */
  readonly decoherent: ReadonlyArray<Fastener> | null;

  /** @override */
  decohereFastener(fastener: Fastener): void {
    let decoherent = this.decoherent as Fastener[];
    if (decoherent === null) {
      decoherent = [];
      (this as Mutable<this>).decoherent = decoherent;
    }
    decoherent.push(fastener);
  }

  recohereFasteners(t?: number): void {
    const decoherent = this.decoherent;
    if (decoherent !== null) {
      const decoherentCount = decoherent.length;
      if (decoherentCount !== 0) {
        if (t === void 0) {
          t = performance.now();
        }
        (this as Mutable<this>).decoherent = null;
        for (let i = 0; i < decoherentCount; i += 1) {
          const fastener = decoherent[i]!;
          fastener.recohere(t);
        }
      }
    }
  }

  /** @internal */
  readonly observers: ReadonlyArray<ObserverType<this>>;

  /** @override */
  observe(observer: ObserverType<this>): void {
    const oldObservers = this.observers;
    const newObservers = Arrays.inserted(observer, oldObservers);
    if (oldObservers !== newObservers) {
      this.willObserve(observer);
      (this as Mutable<this>).observers = newObservers;
      this.onObserve(observer);
      this.didObserve(observer);
    }
  }

  protected willObserve(observer: ObserverType<this>): void {
    // hook
  }

  protected onObserve(observer: ObserverType<this>): void {
    // hook
  }

  protected didObserve(observer: ObserverType<this>): void {
    // hook
  }

  /** @override */
  unobserve(observer: ObserverType<this>): void {
    const oldObservers = this.observers;
    const newObservers = Arrays.removed(observer, oldObservers);
    if (oldObservers !== newObservers) {
      this.willUnobserve(observer);
      (this as Mutable<this>).observers = newObservers;
      this.onUnobserve(observer);
      this.didUnobserve(observer);
    }
  }

  protected willUnobserve(observer: ObserverType<this>): void {
    // hook
  }

  protected onUnobserve(observer: ObserverType<this>): void {
    // hook
  }

  protected didUnobserve(observer: ObserverType<this>): void {
    // hook
  }

  forEachObserver<T>(callback: (this: this, observer: ObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      result = callback.call(this, observer as ObserverType<this>) as T | undefined;
      if (result !== void 0) {
        return result;
      }
    }
    return result;
  }

  callObservers<O, K extends keyof ObserverMethods<O>>(this: this & {readonly observerType?: Class<O>}, key: K, ...args: ObserverParameters<O, K>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]! as ObserverMethods<O>;
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
    return this.uid;
  }

  /** @internal */
  static uid: () => number = (function () {
    let nextId = 1;
    return function uid(): number {
      const id = ~~nextId;
      nextId += 1;
      return id;
    }
  })();

  /** @internal */
  static readonly MountedFlag: ComponentFlags = 1 << 0;
  /** @internal */
  static readonly RemovingFlag: ComponentFlags = 1 << 1;

  /** @internal */
  static readonly FlagShift: number = 2;
  /** @internal */
  static readonly FlagMask: ComponentFlags = (1 << Component.FlagShift) - 1;

  static readonly MountFlags: ComponentFlags = 0;
  static readonly InsertChildFlags: ComponentFlags = 0;
  static readonly RemoveChildFlags: ComponentFlags = 0;
}
