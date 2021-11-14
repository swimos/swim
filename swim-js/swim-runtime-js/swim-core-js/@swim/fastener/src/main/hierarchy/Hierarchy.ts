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
  ObserverType,
  Observable,
  ObserverMethods,
  ObserverParameters,
} from "@swim/util";
import {FastenerContext} from "../fastener/FastenerContext";
import type {Fastener} from "../fastener/Fastener";
import type {HierarchyObserver} from "./HierarchyObserver";

/** @beta */
export type HierarchyFlags = number;

/** @beta */
export abstract class Hierarchy implements HashCode, Family, Observable, FastenerContext {
  constructor() {
    this.uid = (this.constructor as typeof Hierarchy).uid();
    this.key = void 0;
    this.flags = 0;
    this.fasteners = null;
    this.decoherent = null;
    this.observers = Arrays.empty;
  }

  /** @override */
  readonly familyType?: Class<Hierarchy>;

  /** @override */
  readonly observerType?: Class<HierarchyObserver>;

  /** @internal */
  readonly uid: number;

  readonly key: string | undefined;

  /** @internal */
  setKey(key: string | undefined): void {
    (this as Mutable<this>).key = key;
  }

  /** @internal */
  readonly flags: HierarchyFlags;

  /** @internal */
  setFlags(flags: HierarchyFlags): void {
    (this as Mutable<this>).flags = flags;
  }

  abstract readonly parent: Hierarchy | null;

  /** @internal */
  attachParent(parent: Hierarchy): void {
    // assert(this.parent === null);
    this.willAttachParent(parent);
    if (parent.mounted) {
      this.cascadeMount();
    }
    this.onAttachParent(parent);
    this.didAttachParent(parent);
  }

  protected willAttachParent(parent: Hierarchy): void {
    // hook
  }

  protected onAttachParent(parent: Hierarchy): void {
    // hook
  }

  protected didAttachParent(parent: Hierarchy): void {
    // hook
  }

  /** @internal */
  detachParent(parent: Hierarchy): void {
    // assert(this.parent === parent);
    this.willDetachParent(parent);
    if (this.mounted) {
      this.cascadeUnmount();
    }
    this.onDetachParent(parent);
    this.didDetachParent(parent);
  }

  protected willDetachParent(parent: Hierarchy): void {
    // hook
  }

  protected onDetachParent(parent: Hierarchy): void {
    // hook
  }

  protected didDetachParent(parent: Hierarchy): void {
    // hook
  }

  abstract readonly childCount: number;

  abstract readonly children: ReadonlyArray<Hierarchy>;

  abstract firstChild(): Hierarchy | null;

  abstract lastChild(): Hierarchy | null;

  abstract nextChild(target: Hierarchy): Hierarchy | null;

  abstract previousChild(target: Hierarchy): Hierarchy | null;

  abstract forEachChild<T>(callback: (child: Hierarchy) => T | void): T | undefined;
  abstract forEachChild<T, S>(callback: (this: S, child: Hierarchy) => T | void, thisArg: S): T | undefined;

  abstract getChild<F extends abstract new (...args: any[]) => Hierarchy>(key: string, childBound: F): InstanceType<F> | null;
  abstract getChild(key: string, childBound?: abstract new (...args: any[]) => Hierarchy): Hierarchy | null;

  abstract setChild(key: string, newChild: Hierarchy | null): Hierarchy | null;

  abstract appendChild<H extends Hierarchy>(child: H, key?: string): H;

  abstract prependChild<H extends Hierarchy>(child: H, key?: string): H;

  abstract insertChild<H extends Hierarchy>(child: H, target: Hierarchy | null, key?: string): H;

  abstract replaceChild<H extends Hierarchy>(newChild: Hierarchy, oldChild: H): H;

  get insertChildFlags(): HierarchyFlags {
    return (this.constructor as typeof Hierarchy).InsertChildFlags;
  }

  protected willInsertChild(child: Hierarchy, target: Hierarchy | null): void {
    // hook
  }

  protected onInsertChild(child: Hierarchy, target: Hierarchy | null): void {
    this.requireUpdate(this.insertChildFlags);
  }

  protected didInsertChild(child: Hierarchy, target: Hierarchy | null): void {
    // hook
  }

  /** @internal */
  cascadeInsert(): void {
    // hook
  }

  abstract removeChild(key: string): Hierarchy | null;
  abstract removeChild<H extends Hierarchy>(child: H): H;

  get removeChildFlags(): HierarchyFlags {
    return (this.constructor as typeof Hierarchy).RemoveChildFlags;
  }

  protected willRemoveChild(child: Hierarchy): void {
    // hook
  }

  protected onRemoveChild(child: Hierarchy): void {
    this.requireUpdate(this.removeChildFlags);
  }

  protected didRemoveChild(child: Hierarchy): void {
    // hook
  }

  abstract removeChildren(): void;

  remove(): void {
    const parent: Hierarchy | null = this.parent;
    if (parent !== null) {
      if (!this.traversing) {
        parent.removeChild(this);
      } else {
        this.setFlags(this.flags | Hierarchy.RemovingFlag);
      }
    }
  }

  getSuper<F extends abstract new (...args: any[]) => Hierarchy>(superBound: F): InstanceType<F> | null {
    const parent = this.parent;
    if (parent === null) {
      return null;
    } else if (parent instanceof superBound) {
      return parent as InstanceType<F>;
    } else {
      return (parent as Hierarchy).getSuper(superBound);
    }
  }

  getBase<F extends abstract new (...args: any[]) => Hierarchy>(baseBound: F): InstanceType<F> | null {
    const parent = this.parent;
    if (parent === null) {
      return null;
    } else {
      const base = parent.getBase(baseBound);
      if (base !== null) {
        return base;
      } else {
        return parent instanceof baseBound ? parent as InstanceType<F> : null;
      }
    }
  }

  get mounted(): boolean {
    return (this.flags & Hierarchy.MountedFlag) !== 0;
  }

  get mountFlags(): HierarchyFlags {
    return (this.constructor as typeof Hierarchy).MountFlags;
  }

  /** @internal */
  cascadeMount(): void {
    if ((this.flags & Hierarchy.MountedFlag) === 0) {
      this.setFlags(this.flags | (Hierarchy.MountedFlag | Hierarchy.TraversingFlag));
      try {
        this.willMount();
        this.onMount();
        this.mountChildren();
        this.didMount();
      } finally {
        this.setFlags(this.flags & ~Hierarchy.TraversingFlag);
      }
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
    type self = this;
    function mountChild(this: self, child: Hierarchy): void {
      child.cascadeMount();
      if ((child.flags & Hierarchy.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~Hierarchy.RemovingFlag);
        this.removeChild(child);
      }
    }
    this.forEachChild(mountChild, this);
  }

  /** @internal */
  cascadeUnmount(): void {
    if ((this.flags & Hierarchy.MountedFlag) !== 0) {
      this.setFlags(this.flags & ~Hierarchy.MountedFlag | Hierarchy.TraversingFlag);
      try {
        this.willUnmount();
        this.unmountChildren();
        this.onUnmount();
        this.didUnmount();
      } finally {
        this.setFlags(this.flags & ~Hierarchy.TraversingFlag);
      }
    } else {
      throw new Error("already unmounted");
    }
  }

  protected willUnmount(): void {
    // hook
  }

  protected onUnmount(): void {
    this.unmountFasteners();
    this.setFlags(this.flags & ~Hierarchy.RemovingFlag);
  }

  protected didUnmount(): void {
    // hook
  }

  /** @internal */
  protected unmountChildren(): void {
    type self = this;
    function unmountChild(this: self, child: Hierarchy): void {
      child.cascadeUnmount();
      if ((child.flags & Hierarchy.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~Hierarchy.RemovingFlag);
        this.removeChild(child);
      }
    }
    this.forEachChild(unmountChild, this);
  }

  get traversing(): boolean {
    return (this.flags & Hierarchy.TraversingFlag) !== 0;
  }

  requireUpdate(updateFlags: HierarchyFlags, immediate?: boolean): void {
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
    FastenerContext.init(this);
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
  static readonly MountedFlag: HierarchyFlags = 1 << 0;
  /** @internal */
  static readonly RemovingFlag: HierarchyFlags = 1 << 1;
  /** @internal */
  static readonly TraversingFlag: HierarchyFlags = 1 << 2;

  /** @internal */
  static readonly FlagShift: number = 3;
  /** @internal */
  static readonly FlagMask: HierarchyFlags = (1 << Hierarchy.FlagShift) - 1;

  static readonly MountFlags: HierarchyFlags = 0;
  static readonly InsertChildFlags: HierarchyFlags = 0;
  static readonly RemoveChildFlags: HierarchyFlags = 0;
}
