// Copyright 2015-2023 Nstream, inc.
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

import type {Proto} from "@swim/util";
import type {FastenerClass} from "@swim/component";
import {Fastener} from "@swim/component";

/** @public */
export interface ClassList<R = any> extends Fastener<R> {
  /** @override */
  get fastenerType(): Proto<ClassList<any>>;

  get value(): string;

  get(): DOMTokenList;

  set(classNames: readonly string[]): R;

  setIntrinsic(classNames: readonly string[]): R;

  contains(className: string): boolean;

  add(...classNames: readonly string[]): R;

  /** @protected */
  willAdd(className: string): void;

  /** @protected */
  onAdd(className: string): void;

  /** @protected */
  didAdd(className: string): void;

  remove(...classNames: readonly string[]): R;

  /** @protected */
  willRemove(className: string): void;

  /** @protected */
  onRemove(className: string): void;

  /** @protected */
  didRemove(className: string): void;

  replace(oldClassName: string, newClassName: string): boolean;

  toggle(className: string, force?: boolean): boolean;

  forEach<T>(callback: (className: string, index: number, classList: ClassList<this>) => T | void): T | undefined;
  forEach<T, S>(callback: (this: S, className: string, index: number, classList: ClassList<this>) => T | void, thisArg: S): T | undefined;
}

/** @public */
export const ClassList = (<R, F extends ClassList<any>>() => Fastener.extend<ClassList<R>, FastenerClass<F>>("ClassList", {
  get fastenerType(): Proto<ClassList<any>> {
    return ClassList;
  },

  get value(): string {
    const classList = ((this.owner as any).node as Element).classList;
    return classList.value;
  },

  get(): DOMTokenList {
    return ((this.owner as any).node as Element).classList;
  },

  set(classNames: readonly string[]): R {
    return this.add(...classNames);
  },

  setIntrinsic(classNames: readonly string[]): R {
    return this.add(...classNames);
  },

  contains(className: string): boolean {
    const classList = ((this.owner as any).node as Element).classList;
    return classList.contains(className);
  },

  add(...classNames: readonly string[]): R {
    const classList = ((this.owner as any).node as Element).classList;
    for (let i = 0; i < classNames.length; i += 1) {
      const className = classNames[i]!;
      if (!classList.contains(className)) {
        this.willAdd(className);
        classList.add(className);
        this.onAdd(className);
        this.didAdd(className);
      }
    }
    return this.owner;
  },

  willAdd(className: string): void {
    // hook
  },

  onAdd(className: string): void {
    // hook
  },

  didAdd(className: string): void {
    // hook
  },

  remove(...classNames: readonly string[]): R {
    const classList = ((this.owner as any).node as Element).classList;
    for (let i = 0; i < classNames.length; i += 1) {
      const className = classNames[i]!;
      if (classList.contains(className)) {
        this.willRemove(className);
        classList.remove(className);
        this.onRemove(className);
        this.didRemove(className);
      }
    }
    return this.owner;
  },

  willRemove(className: string): void {
    // hook
  },

  onRemove(className: string): void {
    // hook
  },

  didRemove(className: string): void {
    // hook
  },

  replace(oldClassName: string, newClassName: string): boolean {
    const classList = ((this.owner as any).node as Element).classList;
    if (!classList.contains(oldClassName)) {
      return false;
    }

    this.willRemove(oldClassName);
    classList.remove(oldClassName);
    this.onRemove(oldClassName);
    this.didRemove(oldClassName);

    this.willAdd(newClassName);
    classList.add(newClassName);
    this.onAdd(newClassName);
    this.didAdd(newClassName);

    return true;
  },

  toggle(className: string, state?: boolean): boolean {
    const classList = ((this.owner as any).node as Element).classList;
    if (state === true) {
      if (!classList.contains(className)) {
        this.willAdd(className);
        classList.add(className);
        this.onAdd(className);
        this.didAdd(className);
      }
      return true;
    } else if (state === false) {
      if (classList.contains(className)) {
        this.willRemove(className);
        classList.remove(className);
        this.onRemove(className);
        this.didRemove(className);
      }
      return false;
    } else if (!classList.contains(className)) {
      this.willAdd(className);
      classList.add(className);
      this.onAdd(className);
      this.didAdd(className);
      return true;
    } else {
      this.willRemove(className);
      classList.remove(className);
      this.onRemove(className);
      this.didRemove(className);
      return false;
    }
  },

  forEach<T, S>(callback: (this: S | undefined, className: string, index: number, classList: ClassList<any>) => T | void, thisArg?: S): T | undefined {
    const classList = ((this.owner as any).node as Element).classList;
    for (let i = 0; i < classList.length; i += 1) {
      const className = classList[i]!;
      const result = callback.call(thisArg, className, i, this);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  },
}))();
