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

import {Mutable, Class, Proto, Arrays, ObserverType, Observable, ObserverMethods, ObserverParameters} from "@swim/util";
import {FastenerContext} from "../fastener/FastenerContext";
import type {Fastener} from "../fastener/Fastener";
import type {ServiceObserver} from "./ServiceObserver";

/** @public */
export class Service<R> implements FastenerContext, Observable {
  constructor() {
    this.roots = Arrays.empty;
    this.fasteners = null;
    this.decoherent = null;
    this.observers = Arrays.empty;
  }

  /** @override */
  readonly observerType?: Class<ServiceObserver<R>>;

  /** @internal */
  readonly roots: ReadonlyArray<R>;

  /** @override */
  attachRoot(root: R): void {
    const oldRoots = this.roots;
    const newRoots = Arrays.inserted(root, oldRoots);
    if (oldRoots !== newRoots) {
      const needsAttach = oldRoots.length === 0;
      if (needsAttach) {
        this.willAttach();
      }
      this.willAttachRoot(root);
      (this as Mutable<this>).roots = newRoots;
      if (needsAttach) {
        this.onAttach();
      }
      this.onAttachRoot(root);
      this.didAttachRoot(root);
      if (needsAttach) {
        this.didAttach();
      }
    }
  }

  protected willAttachRoot(root: R): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillAttachRoot !== void 0) {
        observer.serviceWillAttachRoot(root, this);
      }
    }
  }

  protected onAttachRoot(root: R): void {
    // hook
  }

  protected didAttachRoot(root: R): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceDidAttachRoot !== void 0) {
        observer.serviceDidAttachRoot(root, this);
      }
    }
  }

  /** @override */
  detachRoot(root: R): void {
    const oldRoots = this.roots;
    const newRoots = Arrays.removed(root, oldRoots);
    if (oldRoots !== newRoots) {
      const needsDetach = oldRoots.length === 1;
      if (needsDetach) {
        this.willDetach();
      }
      this.willDetachRoot(root);
      (this as Mutable<this>).roots = newRoots;
      if (needsDetach) {
        this.onDetach();
      }
      this.onDetachRoot(root);
      this.didDetachRoot(root);
      if (needsDetach) {
        this.didDetach();
      }
    }
  }

  protected willDetachRoot(root: R): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillDetachRoot !== void 0) {
        observer.serviceWillDetachRoot(root, this);
      }
    }
  }

  protected onDetachRoot(root: R): void {
    // hook
  }

  protected didDetachRoot(root: R): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceDidDetachRoot !== void 0) {
        observer.serviceDidDetachRoot(root, this);
      }
    }
  }

  get attached(): boolean {
    return this.roots.length !== 0;
  }

  protected willAttach(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillAttach !== void 0) {
        observer.serviceWillAttach(this);
      }
    }
  }

  protected onAttach(): void {
    this.mountFasteners();
  }

  protected didAttach(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceDidAttach !== void 0) {
        observer.serviceDidAttach(this);
      }
    }
  }

  protected willDetach(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillDetach !== void 0) {
        observer.serviceWillDetach(this);
      }
    }
  }

  protected onDetach(): void {
    this.unmountFasteners();
  }

  protected didDetach(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceDidDetach !== void 0) {
        observer.serviceDidDetach(this);
      }
    }
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
    if (this.attached) {
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
    if (this.attached) {
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
    return null;
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
}
