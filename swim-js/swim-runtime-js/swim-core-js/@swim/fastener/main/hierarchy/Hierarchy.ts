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

import {Mutable, Class, Family, Arrays, ObserverType, Observable} from "@swim/util";
import {FastenerContextClass, FastenerContext} from "../fastener/FastenerContext";
import type {MemberFastener, FastenerClass, Fastener} from "../fastener/Fastener";
import type {HierarchyObserver} from "./HierarchyObserver";

export type HierarchyFlags = number;

export abstract class Hierarchy implements Family, Observable, FastenerContext {
  constructor() {
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
  setParent(newParent: Hierarchy | null, oldParent: Hierarchy | null): void {
    this.willSetParent(newParent, oldParent);
    if (oldParent !== null) {
      this.detachParent(oldParent);
    }
    this.onSetParent(newParent, oldParent);
    if (newParent !== null) {
      this.attachParent(newParent);
    }
    this.didSetParent(newParent, oldParent);
  }

  /** @internal */
  protected attachParent(parent: Hierarchy): void {
    if (parent.mounted) {
      this.cascadeMount();
    }
  }

  /** @internal */
  protected detachParent(parent: Hierarchy): void {
    if (this.mounted) {
      this.cascadeUnmount();
    }
  }

  protected willSetParent(newParent: Hierarchy | null, oldParent: Hierarchy | null): void {
    // hook
  }

  protected onSetParent(newParent: Hierarchy | null, oldParent: Hierarchy | null): void {
    // hook
  }

  protected didSetParent(newParent: Hierarchy | null, oldParent: Hierarchy | null): void {
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

  abstract getChild<H extends Hierarchy>(key: string, childBound: Class<H>): H | null;
  abstract getChild(key: string, childBound?: Class<Hierarchy>): Hierarchy | null;

  abstract setChild(key: string, newChild: Hierarchy | null): Hierarchy | null;

  abstract appendChild<H extends Hierarchy>(child: H, key?: string): H;

  abstract prependChild<H extends Hierarchy>(child: H, key?: string): H;

  abstract insertChild<H extends Hierarchy>(child: H, target: Hierarchy | null, key?: string): H;

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
  abstract removeChild(child: Hierarchy): void;

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

  getSuper<H>(superBound: Class<H>): H | null {
    const parent = this.parent;
    if (parent === null) {
      return null;
    } else if (parent instanceof superBound) {
      return parent;
    } else {
      return parent.getSuper(superBound);
    }
  }

  getBase<H>(baseBound: Class<H>): H | null {
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
    let fasteners = this.fasteners;
    if (fasteners === null) {
      fasteners = {};
      (this as Mutable<this>).fasteners = fasteners;
    }
    let oldFastener: Fastener | null | undefined = fasteners[fastenerName];
    if (oldFastener === void 0) {
      oldFastener = null;
    }
    if (newFastener !== oldFastener) {
      this.willSetFastener(fastenerName, newFastener, oldFastener);
      if (oldFastener !== null) {
        this.detachFastener(fastenerName, oldFastener);
        if (this.mounted) {
          oldFastener.unmount();
        }
      }
      if (newFastener !== null) {
        fasteners[fastenerName] = newFastener;
        if (this.mounted) {
          newFastener.mount();
        }
      } else {
        delete fasteners[fastenerName];
      }
      this.onSetFastener(fastenerName, newFastener, oldFastener);
      if (newFastener !== null) {
        this.attachFastener(fastenerName, newFastener);
      }
      this.didSetFastener(fastenerName, newFastener, oldFastener);
    }
  }

  protected attachFastener(fastenerName: string, fastener: Fastener): void {
    // hook
  }

  protected detachFastener(fastenerName: string, fastener: Fastener): void {
    // hook
  }

  protected willSetFastener(fastenerName: string, newFastener: Fastener | null, oldFastener: Fastener | null): void {
    // hook
  }

  protected onSetFastener(fastenerName: string, newFastener: Fastener | null, oldFastener: Fastener | null): void {
    // hook
  }

  protected didSetFastener(fastenerName: string, newFastener: Fastener | null, oldFastener: Fastener | null): void {
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

  protected forEachObserver<T>(callback: (this: this, observer: ObserverType<this>) => T | void): T | undefined {
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

  static getFastenerClass<F extends Fastener<any>>(fastenerName: string, fastenerBound: Class<F>): FastenerClass | null;
  static getFastenerClass<S extends abstract new (...args: any[]) => InstanceType<S>, K extends keyof InstanceType<S>>(this: S, fastenerName: K): MemberFastener<InstanceType<S>, K> | null;
  static getFastenerClass(fastenerName: string, fastenerBound?: Class<Fastener> | null): FastenerClass | null;
  static getFastenerClass(fastenerName: string, fastenerBound?: Class<Fastener> | null): FastenerClass | null {
    return FastenerContext.getFastenerClass(this as FastenerContextClass, fastenerName, fastenerBound);
  }
  
  /** @internal */
  static readonly MountedFlag: HierarchyFlags = 1 << 0;
  /** @internal */
  static readonly TraversingFlag: HierarchyFlags = 1 << 1;
  /** @internal */
  static readonly RemovingFlag: HierarchyFlags = 1 << 2;

  /** @internal */
  static readonly FlagShift: number = 3;
  /** @internal */
  static readonly FlagMask: HierarchyFlags = (1 << Hierarchy.FlagShift) - 1;

  static readonly MountFlags: HierarchyFlags = 0;
  static readonly InsertChildFlags: HierarchyFlags = 0;
  static readonly RemoveChildFlags: HierarchyFlags = 0;
}
