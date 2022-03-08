// Copyright 2015-2022 Swim.inc
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
  Proto,
  Arrays,
  HashCode,
  Comparator,
  Dictionary,
  MutableDictionary,
  FromAny,
  Creatable,
  InitType,
  Initable,
  ObserverType,
  Observable,
  ObserverMethods,
  ObserverParameters,
} from "@swim/util";
import {FastenerContext} from "../fastener/FastenerContext";
import type {Fastener} from "../fastener/Fastener";
import type {ComponentObserver} from "./ComponentObserver";
import {ComponentRelation} from "./"; // forward import

/** @public */
export type ComponentFlags = number;

/** @public */
export type AnyComponent<C extends Component = Component> = C | ComponentFactory<C> | InitType<C>;

/** @public */
export interface ComponentInit {
  /** @internal */
  uid?: never, // force type ambiguity between Component and ComponentInit
  type?: Creatable<Component>;
  key?: string;
  children?: AnyComponent[];
}

/** @public */
export interface ComponentFactory<C extends Component = Component, U = AnyComponent<C>> extends Creatable<C>, FromAny<C, U> {
  fromInit(init: InitType<C>): C;
}

/** @public */
export interface ComponentClass<C extends Component = Component, U = AnyComponent<C>> extends Function, ComponentFactory<C, U> {
  readonly prototype: C;
}

/** @public */
export interface ComponentConstructor<C extends Component = Component, U = AnyComponent<C>> extends ComponentClass<C, U> {
  new(): C;
}

/** @public */
export type ComponentCreator<F extends Class<C> & Creatable<InstanceType<F>>, C extends Component = Component> =
  Class<InstanceType<F>> & Creatable<InstanceType<F>>;

/** @public */
export class Component<C extends Component<C> = Component<any>> implements HashCode, FastenerContext, Initable<ComponentInit>, Observable {
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

  get componentType(): Class<Component> {
    return Component;
  }

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

  readonly nextSibling: C | null;

  /** @internal */
  setNextSibling(nextSibling: C | null): void {
    (this as Mutable<this>).nextSibling = nextSibling;
  }

  readonly previousSibling: C | null;

  /** @internal */
  setPreviousSibling(previousSibling: C | null): void {
    (this as Mutable<this>).previousSibling = previousSibling;
  }

  readonly firstChild: C | null;

  /** @internal */
  setFirstChild(firstChild: C | null): void {
    (this as Mutable<this>).firstChild = firstChild;
  }

  readonly lastChild: C | null;

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
    if (key !== void 0) {
      let childMap = this.childMap as MutableDictionary<C>;
      if (childMap === null) {
        childMap = {};
        (this as Mutable<this>).childMap = childMap;
      }
      childMap[key] = child;
    }
  }

  /** @internal */
  protected removeChildMap(child: C): void {
    const key = child.key;
    if (key !== void 0) {
      const childMap = this.childMap as MutableDictionary<C>;
      if (childMap !== null) {
        delete childMap[key];
      }
    }
  }

  getChild<F extends Class<C>>(key: string, childBound: F): InstanceType<F> | null;
  getChild(key: string, childBound?: Class<C>): C | null;
  getChild(key: string, childBound?: Class<C>): C | null {
    const childMap = this.childMap;
    if (childMap !== null) {
      const child = childMap[key];
      if (child !== void 0 && (childBound === void 0 || child instanceof childBound)) {
        return child;
      }
    }
    return null;
  }

  setChild(key: string, newChild: C | null): C | null;
  setChild(this: C, key: string, newChild: C | null): C | null {
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

  appendChild<Child extends C>(child: Child, key?: string): Child;
  appendChild(child: C, key?: string): C;
  appendChild(this: C, child: C, key?: string): C {
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

  prependChild<Child extends C>(child: Child, key?: string): Child;
  prependChild(child: C, key?: string): C;
  prependChild(this: C, child: C, key?: string): C {
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

  insertChild<Child extends C>(child: Child, target: C | null, key?: string): Child;
  insertChild(child: C, target: C | null, key?: string): C;
  insertChild(this: C, child: C, target: C | null, key?: string): C {
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

  replaceChild<Child extends C>(newChild: C, oldChild: Child): Child;
  replaceChild(newChild: C, oldChild: C): C;
  replaceChild(this: C, newChild: C, oldChild: C): C {
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
    }
  }

  sortChildren(comparator: Comparator<C>): void {
    let child = this.firstChild;
    if (child !== null) {
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
  }

  getSuper<F extends Class<C>>(superBound: F): InstanceType<F> | null;
  getSuper(superBound: Class<C>): C | null;
  getSuper(superBound: Class<C>): C | null {
    const parent = this.parent;
    if (parent === null) {
      return null;
    } else if (parent instanceof superBound) {
      return parent;
    } else {
      return (parent as C).getSuper(superBound);
    }
  }

  getBase<F extends Class<C>>(baseBound: F): InstanceType<F> | null;
  getBase(baseBound: Class<C>): C | null;
  getBase(baseBound: Class<C>): C | null {
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

  /** @internal */
  readonly fasteners: {[fastenerName: string]: Fastener | undefined} | null;

  /** @override */
  hasFastener(fastenerName: string, fastenerBound?: Proto<Fastener> | null): boolean {
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
  getFastener<F extends Fastener<any>>(fastenerName: string, fastenerBound: Proto<F>): F | null;
  /** @override */
  getFastener(fastenerName: string, fastenerBound?: Proto<Fastener> | null): Fastener | null;
  getFastener(fastenerName: string, fastenerBound?: Proto<Fastener> | null): Fastener | null {
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
    this.bindFastener(fastener);
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
  getLazyFastener<F extends Fastener<any>>(fastenerName: string, fastenerBound: Proto<F>): F | null;
  /** @override */
  getLazyFastener(fastenerName: string, fastenerBound?: Proto<Fastener> | null): Fastener | null;
  getLazyFastener(fastenerName: string, fastenerBound?: Proto<Fastener> | null): Fastener | null {
    return FastenerContext.getLazyFastener(this, fastenerName, fastenerBound);
  }

  /** @override */
  getSuperFastener<F extends Fastener<any>>(fastenerName: string, fastenerBound: Proto<F>): F | null;
  /** @override */
  getSuperFastener(fastenerName: string, fastenerBound?: Proto<Fastener> | null): Fastener | null;
  getSuperFastener(fastenerName: string, fastenerBound?: Proto<Fastener> | null): Fastener | null {
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

  protected bindFastener(fastener: Fastener): void;
  protected bindFastener(this: C, fastener: Fastener): void {
    if (fastener.binds) {
      let child = this.firstChild;
      while (child !== null) {
        const next = child.nextSibling;
        this.bindChildFastener(fastener, child, next);
        child = next !== null && next.parent === this ? next : null;
      }
    }
  }

  /** @internal */
  protected bindChildFasteners(child: C, target: C | null): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      this.bindChildFastener(fastener, child, target);
    }
  }

  /** @internal */
  protected bindChildFastener(fastener: Fastener, child: C, target: C | null): void {
    if (fastener instanceof ComponentRelation) {
      fastener.bindComponent(child, target);
    }
  }

  /** @internal */
  protected unbindChildFasteners(child: C): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      this.unbindChildFastener(fastener, child);
    }
  }

  /** @internal */
  protected unbindChildFastener(fastener: Fastener, child: C): void {
    if (fastener instanceof ComponentRelation) {
      fastener.unbindComponent(child);
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

  /** @override */
  init(init: ComponentInit): void {
    // hook
  }

  static create<F extends new () => InstanceType<F>>(this: F): InstanceType<F> {
    return new this();
  }

  static fromInit<F extends Class<InstanceType<F>>>(this: F, init: InitType<InstanceType<F>>): InstanceType<F> {
    let type: Creatable<InstanceType<F>>;
    if ((typeof init === "object" && init !== null || typeof init === "function") && Creatable.is((init as ComponentInit).type)) {
      type = (init as ComponentInit).type as Creatable<InstanceType<F>>;
    } else {
      type = this as unknown as Creatable<InstanceType<F>>;
    }
    const component = type.create();
    (component as Initable<InitType<F>>).init(init);
    return component;
  }

  static fromAny<F extends Class<InstanceType<F>>>(this: F, value: AnyComponent<InstanceType<F>>): InstanceType<F> {
    if (value === void 0 || value === null) {
      return value as InstanceType<F>;
    } else if (value instanceof Component) {
      if (value instanceof this) {
        return value;
      } else {
        throw new TypeError(value + " not an instance of " + this);
      }
    } else if (Creatable.is(value)) {
      return (value as Creatable<InstanceType<F>>).create();
    } else {
      return (this as unknown as ComponentFactory<InstanceType<F>>).fromInit(value);
    }
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
