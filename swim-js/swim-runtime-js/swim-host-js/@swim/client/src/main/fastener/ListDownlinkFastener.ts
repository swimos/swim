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

import {Mutable, Cursor} from "@swim/util";
import type {FastenerOwner} from "@swim/fastener";
import {AnyValue, Value, Form} from "@swim/structure";
import {Uri} from "@swim/uri";
import type {ListDownlinkObserver, ListDownlink} from "../downlink/ListDownlink";
import type {WarpRef} from "../ref/WarpRef";
import {DownlinkFastenerInit, DownlinkFastenerClass, DownlinkFastener} from "./DownlinkFastener";

/** @internal */
export type ListDownlinkFastenerType<F extends ListDownlinkFastener<any, any>> =
  F extends ListDownlinkFastener<any, infer V, any> ? V : never;

/** @internal */
export type ListDownlinkFastenerInitType<F extends ListDownlinkFastener<any, any>> =
  F extends ListDownlinkFastener<any, infer V, infer VU> ? V | VU : never;

/** @beta */
export interface ListDownlinkFastenerInit<V = unknown, VU = V> extends DownlinkFastenerInit, ListDownlinkObserver<V, VU> {
  extends?: {prototype: ListDownlinkFastener<any, any>} | string | boolean | null;
  valueForm?: Form<V, VU>;

  initDownlink?(downlink: ListDownlink<V, VU>): ListDownlink<V, VU>;
}

/** @beta */
export type ListDownlinkFastenerDescriptor<O = unknown, V = unknown, VU = V, I = {}> = ThisType<ListDownlinkFastener<O, V, VU> & I> & ListDownlinkFastenerInit<V, VU> & Partial<I>;

/** @beta */
export interface ListDownlinkFastenerClass<F extends ListDownlinkFastener<any, any> = ListDownlinkFastener<any, any>> extends DownlinkFastenerClass<F> {
}

/** @beta */
export interface ListDownlinkFastenerFactory<F extends ListDownlinkFastener<any, any> = ListDownlinkFastener<any, any>> extends ListDownlinkFastenerClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): ListDownlinkFastenerFactory<F> & I;

  define<O, V extends Value = Value, VU extends AnyValue = AnyValue>(className: string, descriptor: ListDownlinkFastenerDescriptor<O, V, VU>): ListDownlinkFastenerFactory<ListDownlinkFastener<any, V, VU>>;
  define<O, V, VU = V>(className: string, descriptor: {valueForm: Form<V, VU>} & ListDownlinkFastenerDescriptor<O, V, VU>): ListDownlinkFastenerFactory<ListDownlinkFastener<any, V, VU>>;
  define<O, V extends Value, VU extends AnyValue = AnyValue, I = {}>(className: string, descriptor: ListDownlinkFastenerDescriptor<O, V, VU, I>): ListDownlinkFastenerFactory<ListDownlinkFastener<any, V, VU> & I>;
  define<O, V, VU = V, I = {}>(className: string, descriptor: {valueForm: Form<V, VU>} & ListDownlinkFastenerDescriptor<O, V, VU, I>): ListDownlinkFastenerFactory<ListDownlinkFastener<any, V, VU> & I>;

  <O, V extends Value = Value, VU extends AnyValue = AnyValue>(descriptor: ListDownlinkFastenerDescriptor<O, V, VU>): PropertyDecorator;
  <O, V, VU = V>(descriptor: {valueForm: Form<V, VU>} & ListDownlinkFastenerDescriptor<O, V, VU>): PropertyDecorator;
  <O, V extends Value, VU extends AnyValue = AnyValue, I = {}>(descriptor: ListDownlinkFastenerDescriptor<O, V, VU, I>): PropertyDecorator;
  <O, V, VU = V, I = {}>(descriptor: {valueForm: Form<V, VU>} & ListDownlinkFastenerDescriptor<O, V, VU, I>): PropertyDecorator;
}

/** @beta */
export interface ListDownlinkFastener<O = unknown, V = unknown, VU = V> extends DownlinkFastener<O> {
  (index: number): V | undefined;
  (index: number, newObject: V | VU): O;

  /** @internal */
  readonly ownValueForm: Form<V, VU> | null;

  get length(): number;

  valueForm(): Form<V, VU> | null;
  valueForm(valueForm: Form<V, VU> | null): this;

  isEmpty(): boolean;

  get(index: number, id?: Value): V | undefined;

  getEntry(index: number, id?: Value): [V, Value] | undefined;

  set(index: number, newObject: V | VU, id?: Value): this;

  insert(index: number, newObject: V | VU, id?: Value): this;

  remove(index: number, id?: Value): this;

  push(...newObjects: (V | VU)[]): number;

  pop(): V | undefined;

  unshift(...newObjects: (V | VU)[]): number;

  shift(): V | undefined;

  move(fromIndex: number, toIndex: number, id?: Value): this;

  splice(start: number, deleteCount?: number, ...newObjects: (V | VU)[]): V[];

  clear(): void;

  forEach<T>(callback: (value: V, index: number, id: Value) => T | void): T | undefined;
  forEach<T, S>(callback: (this: S, value: V, index: number, id: Value) => T | void, thisArg: S): T | undefined;

  values(): Cursor<V>;

  keys(): Cursor<Value>;

  entries(): Cursor<[Value, V]>;

  /** @override */
  readonly downlink: ListDownlink<V, VU> | null;

  /** @internal @override */
  createDownlink(warp: WarpRef): ListDownlink<V, VU>;

  /** @internal @override */
  bindDownlink(downlink: ListDownlink<V, VU>): ListDownlink<V, VU>;

  /** @internal */
  initDownlink?(downlink: ListDownlink<V, VU>): ListDownlink<V, VU>;
}

/** @beta */
export const ListDownlinkFastener = (function (_super: typeof DownlinkFastener) {
  const ListDownlinkFastener: ListDownlinkFastenerFactory = _super.extend("ListDownlinkFastener");

  ListDownlinkFastener.prototype.valueForm = function <V, VU>(this: ListDownlinkFastener<unknown, V, VU>, valueForm?: Form<V, VU> | null): Form<V, VU> | null | typeof this {
    if (valueForm === void 0) {
      return this.ownValueForm;
    } else {
      if (this.ownValueForm !== valueForm) {
        (this as Mutable<typeof this>).ownValueForm = valueForm;
        this.relink();
      }
      return this;
    }
  } as typeof ListDownlinkFastener.prototype.valueForm;

  Object.defineProperty(ListDownlinkFastener.prototype, "length", {
    get: function (this: ListDownlinkFastener<unknown>): number {
      const downlink = this.downlink;
      return downlink !== null ? downlink.length : 0;
    },
    configurable: true,
  });

  ListDownlinkFastener.prototype.isEmpty = function (this: ListDownlinkFastener<unknown>): boolean {
    const downlink = this.downlink;
    return downlink !== null ? downlink.isEmpty() : true;
  };

  ListDownlinkFastener.prototype.get = function <V>(this: ListDownlinkFastener<unknown, V>, index: number, id?: Value): V | undefined {
    const downlink = this.downlink;
    return downlink !== null ? downlink.get(index, id) : void 0;
  };

  ListDownlinkFastener.prototype.getEntry = function <V, VU>(this: ListDownlinkFastener<unknown, V, VU>, index: number, id?: Value): [V, Value] | undefined {
    const downlink = this.downlink;
    return downlink !== null ? downlink.getEntry(index, id) : void 0;
  };

  ListDownlinkFastener.prototype.set = function <V, VU>(this: ListDownlinkFastener<unknown, V, VU>, index: number, newObject: V | VU, id?: Value): ListDownlinkFastener<unknown, V, VU> {
    const downlink = this.downlink;
    if (downlink != null) {
      downlink.set(index, newObject, id);
    }
    return this;
  };

  ListDownlinkFastener.prototype.insert = function <V, VU>(this: ListDownlinkFastener<unknown, V, VU>, index: number, newObject: V | VU, id?: Value): ListDownlinkFastener<unknown, V, VU> {
    const downlink = this.downlink;
    if (downlink != null) {
      downlink.insert(index, newObject, id);
    }
    return this;
  };

  ListDownlinkFastener.prototype.remove = function <V, VU>(this: ListDownlinkFastener<unknown, V, VU>, index: number, id?: Value): ListDownlinkFastener<unknown, V, VU> {
    const downlink = this.downlink;
    if (downlink != null) {
      downlink.remove(index, id);
    }
    return this;
  };

  ListDownlinkFastener.prototype.push = function <V, VU>(this: ListDownlinkFastener<unknown, V, VU>, ...newObjects: (V | VU)[]): number {
    const downlink = this.downlink;
    return downlink !== null ? downlink.push(...newObjects) : 0;
  };

  ListDownlinkFastener.prototype.pop = function <V, VU>(this: ListDownlinkFastener<unknown, V, VU>): V | undefined {
    const downlink = this.downlink;
    return downlink !== null ? downlink.pop() : void 0;
  };

  ListDownlinkFastener.prototype.unshift = function <V, VU>(this: ListDownlinkFastener<unknown, V, VU>, ...newObjects: (V | VU)[]): number {
    const downlink = this.downlink;
    return downlink !== null ? downlink.unshift(...newObjects) : 0;
  };

  ListDownlinkFastener.prototype.shift = function <V, VU>(this: ListDownlinkFastener<unknown, V, VU>): V | undefined {
    const downlink = this.downlink;
    return downlink !== null ? downlink.shift() : void 0;
  };

  ListDownlinkFastener.prototype.move = function <V, VU>(this: ListDownlinkFastener<unknown, V, VU>, fromIndex: number, toIndex: number, id?: Value): ListDownlinkFastener<unknown, V, VU> {
    const downlink = this.downlink;
    if (downlink != null) {
      downlink.move(fromIndex, toIndex, id);
    }
    return this;
  };

  ListDownlinkFastener.prototype.splice = function <V, VU>(this: ListDownlinkFastener<unknown, V, VU>, start: number, deleteCount?: number, ...newObjects: (V | VU)[]): V[] {
    const downlink = this.downlink;
    return downlink !== null ? downlink.splice(start, deleteCount, ...newObjects) : [];
  };

  ListDownlinkFastener.prototype.clear = function (this: ListDownlinkFastener<unknown>): void {
    const downlink = this.downlink;
    if (downlink != null) {
      downlink.clear();
    }
  };

  ListDownlinkFastener.prototype.forEach = function <V, VU, T, S>(this: ListDownlinkFastener<unknown, V, VU>, callback: (this: S | undefined, value: V, index: number, id: Value) => T | void, thisArg?: S): T | undefined {
    const downlink = this.downlink;
    return downlink !== null ? downlink.forEach(callback, thisArg) : void 0;
  };

  ListDownlinkFastener.prototype.values = function <V, VU>(this: ListDownlinkFastener<unknown, V, VU>): Cursor<V> {
    const downlink = this.downlink;
    return downlink !== null ? downlink.values() : Cursor.empty();
  };

  ListDownlinkFastener.prototype.keys = function <V, VU>(this: ListDownlinkFastener<unknown, V, VU>): Cursor<Value> {
    const downlink = this.downlink;
    return downlink !== null ? downlink.keys() : Cursor.empty();
  };

  ListDownlinkFastener.prototype.entries = function <V, VU>(this: ListDownlinkFastener<unknown, V, VU>): Cursor<[Value, V]> {
    const downlink = this.downlink;
    return downlink !== null ? downlink.entries() : Cursor.empty();
  };

  ListDownlinkFastener.prototype.createDownlink = function <V, VU>(this: ListDownlinkFastener<unknown, V, VU>, warp: WarpRef): ListDownlink<V, VU> {
    let downlink = warp.downlinkList() as unknown as ListDownlink<V, VU>;
    if (this.ownValueForm !== null) {
      downlink = downlink.valueForm(this.ownValueForm);
    }
    return downlink;
  };

  ListDownlinkFastener.construct = function <F extends ListDownlinkFastener<any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    if (fastener === null) {
      fastener = function (index: number, value?: ListDownlinkFastenerType<F> | ListDownlinkFastenerInitType<F>): ListDownlinkFastenerType<F> | undefined | FastenerOwner<F> {
        if (arguments.length === 0) {
          return fastener!.get(index);
        } else {
          fastener!.set(index, value!);
          return fastener!.owner;
        }
      } as F;
      delete (fastener as Partial<Mutable<F>>).name; // don't clobber prototype name
      Object.setPrototypeOf(fastener, fastenerClass.prototype);
    }
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).ownValueForm = null;
    return fastener;
  };

  ListDownlinkFastener.define = function <O, V, VU>(className: string, descriptor: ListDownlinkFastenerDescriptor<O, V, VU>): ListDownlinkFastenerFactory<ListDownlinkFastener<any, V, VU>> {
    let superClass = descriptor.extends as ListDownlinkFastenerFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    const valueForm = descriptor.valueForm;
    let hostUri = descriptor.hostUri;
    let nodeUri = descriptor.nodeUri;
    let laneUri = descriptor.laneUri;
    let prio = descriptor.prio;
    let rate = descriptor.rate;
    let body = descriptor.body;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.valueForm;
    delete descriptor.hostUri;
    delete descriptor.nodeUri;
    delete descriptor.laneUri;
    delete descriptor.prio;
    delete descriptor.rate;
    delete descriptor.body;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(className, descriptor);

    fastenerClass.construct = function (fastenerClass: {prototype: ListDownlinkFastener<any, any>}, fastener: ListDownlinkFastener<O, V, VU> | null, owner: O): ListDownlinkFastener<O, V, VU> {
      fastener = superClass!.construct(fastenerClass, fastener, owner);
      if (affinity !== void 0) {
        fastener.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        fastener.initInherits(inherits);
      }
      if (hostUri !== void 0) {
        (fastener as Mutable<typeof fastener>).ownHostUri = hostUri as Uri;
      }
      if (nodeUri !== void 0) {
        (fastener as Mutable<typeof fastener>).ownNodeUri = nodeUri as Uri;
      }
      if (laneUri !== void 0) {
        (fastener as Mutable<typeof fastener>).ownLaneUri = laneUri as Uri;
      }
      if (prio !== void 0) {
        (fastener as Mutable<typeof fastener>).ownPrio = prio as number;
      }
      if (rate !== void 0) {
        (fastener as Mutable<typeof fastener>).ownRate = rate as number;
      }
      if (body !== void 0) {
        (fastener as Mutable<typeof fastener>).ownBody = body as Value;
      }
      if (valueForm !== void 0) {
        (fastener as Mutable<typeof fastener>).ownValueForm = valueForm;
      }
      return fastener;
    };

    if (typeof hostUri === "function") {
      fastenerClass.prototype.initHostUri = hostUri;
      hostUri = void 0;
    } else if (hostUri !== void 0) {
      hostUri = Uri.fromAny(hostUri);
    }
    if (typeof nodeUri === "function") {
      fastenerClass.prototype.initNodeUri = nodeUri;
      nodeUri = void 0;
    } else if (nodeUri !== void 0) {
      nodeUri = Uri.fromAny(nodeUri);
    }
    if (typeof laneUri === "function") {
      fastenerClass.prototype.initLaneUri = laneUri;
      laneUri = void 0;
    } else if (laneUri !== void 0) {
      laneUri = Uri.fromAny(laneUri);
    }
    if (typeof prio === "function") {
      fastenerClass.prototype.initPrio = prio;
      prio = void 0;
    }
    if (typeof rate === "function") {
      fastenerClass.prototype.initRate = rate;
      rate = void 0;
    }
    if (typeof body === "function") {
      fastenerClass.prototype.initBody = body;
      body = void 0;
    } else if (body !== void 0) {
      body = Value.fromAny(body);
    }

    return fastenerClass;
  };

  return ListDownlinkFastener;
})(DownlinkFastener);
