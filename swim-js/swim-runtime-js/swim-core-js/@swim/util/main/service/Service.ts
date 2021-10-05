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

import type {Mutable} from "../types/Mutable";
import type {Class} from "../types/Class";
import {Arrays} from "../values/Arrays";
import type {ObserverType, Observable} from "../observable/Observable";
import type {ServiceObserver} from "./ServiceObserver";

export class Service<R> implements Observable {
  constructor() {
    this.roots = Arrays.empty;
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
    // hook
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
    // hook
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
}
