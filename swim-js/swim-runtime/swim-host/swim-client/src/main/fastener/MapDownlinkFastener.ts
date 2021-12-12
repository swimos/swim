// Copyright 2015-2021 Swim.inc
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
import type {FastenerOwner} from "@swim/component";
import {AnyValue, Value, Form} from "@swim/structure";
import {Uri} from "@swim/uri";
import type {MapDownlinkObserver, MapDownlink} from "../downlink/MapDownlink";
import type {WarpRef} from "../ref/WarpRef";
import {DownlinkFastenerInit, DownlinkFastenerClass, DownlinkFastener} from "./DownlinkFastener";

/** @internal */
export type MapDownlinkFastenerKeyType<F extends MapDownlinkFastener<any, any, any>> =
  F extends MapDownlinkFastener<any, infer K, any, any, any> ? K : never;

/** @internal */
export type MapDownlinkFastenerKeyInitType<F extends MapDownlinkFastener<any, any, any>> =
  F extends MapDownlinkFastener<any, infer K, infer KU, any, any> ? K | KU : never;

/** @internal */
export type MapDownlinkFastenerValueType<F extends MapDownlinkFastener<any, any, any>> =
  F extends MapDownlinkFastener<any, any, any, infer V, any> ? V : never;

/** @internal */
export type MapDownlinkFastenerValueInitType<F extends MapDownlinkFastener<any, any, any>> =
  F extends MapDownlinkFastener<any, any, any, infer V, infer VU> ? V | VU : never;

/** @beta */
export interface MapDownlinkFastenerInit<K = unknown, V = unknown, KU = K, VU = V> extends DownlinkFastenerInit, MapDownlinkObserver<K, V, KU, VU> {
  extends?: {prototype: MapDownlinkFastener<any, any, any>} | string | boolean | null;
  keyForm?: Form<K, KU>;
  valueForm?: Form<V, VU>;

  initDownlink?(downlink: MapDownlink<K, V, KU, VU>): MapDownlink<K, V, KU, VU>;
}

/** @beta */
export type MapDownlinkFastenerDescriptor<O = unknown, K = unknown, V = unknown, KU = K, VU = V, I = {}> = ThisType<MapDownlinkFastener<O, K, V, KU, VU> & I> & MapDownlinkFastenerInit<K, V, KU, VU> & Partial<I>;

/** @beta */
export interface MapDownlinkFastenerClass<F extends MapDownlinkFastener<any, any, any> = MapDownlinkFastener<any, any, any>> extends DownlinkFastenerClass<F> {
}

/** @beta */
export interface MapDownlinkFastenerFactory<F extends MapDownlinkFastener<any, any, any> = MapDownlinkFastener<any, any, any>> extends MapDownlinkFastenerClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): MapDownlinkFastenerFactory<F> & I;

  define<O, K extends Value = Value, V extends Value = Value, KU extends AnyValue = AnyValue, VU extends AnyValue = AnyValue>(className: string, descriptor: MapDownlinkFastenerDescriptor<O, K, V, KU, VU>): MapDownlinkFastenerFactory<MapDownlinkFastener<any, K, V, KU, VU>>;
  define<O, K = unknown, V extends Value = Value, KU = K, VU extends AnyValue = AnyValue>(className: string, descriptor: {keyForm: Form<K, KU>} & MapDownlinkFastenerDescriptor<O, K, V, KU, VU>): MapDownlinkFastenerFactory<MapDownlinkFastener<any, K, V, KU, VU>>;
  define<O, K extends Value = Value, V = unknown, KU extends AnyValue = AnyValue, VU = V>(className: string, descriptor: {valueForm: Form<V, VU>} & MapDownlinkFastenerDescriptor<O, K, V, KU, VU>): MapDownlinkFastenerFactory<MapDownlinkFastener<any, K, V, KU, VU>>;
  define<O, K, V, KU = K, VU = V>(className: string, escriptor: {keyForm: Form<K, KU>, valueForm: Form<V, VU>} & MapDownlinkFastenerDescriptor<O, K, V, KU, VU>): MapDownlinkFastenerFactory<MapDownlinkFastener<any, K, V, KU, VU>>;
  define<O, K extends Value = Value, V extends Value = Value, KU extends AnyValue = AnyValue, VU extends AnyValue = AnyValue, I = {}>(className: string, descriptor: {implements: unknown} & MapDownlinkFastenerDescriptor<O, V, VU, I>): MapDownlinkFastenerFactory<MapDownlinkFastener<any, K, V, KU, VU> & I>;
  define<O, K = unknown, V extends Value = Value, KU = K, VU extends AnyValue = AnyValue, I = {}>(className: string, descriptor: {implements: unknown; keyForm: Form<K, KU>} & MapDownlinkFastenerDescriptor<O, K, V, KU, VU, I>): MapDownlinkFastenerFactory<MapDownlinkFastener<any, K, V, KU, VU> & I>;
  define<O, K extends Value = Value, V = unknown, KU extends AnyValue = AnyValue, VU = V, I = {}>(className: string, descriptor: {implements: unknown; valueForm: Form<V, VU>} & MapDownlinkFastenerDescriptor<O, K, V, KU, VU, I>): MapDownlinkFastenerFactory<MapDownlinkFastener<any, K, V, KU, VU> & I>;
  define<O, K, V, KU = K, VU = V, I = {}>(className: string, descriptor: {implements: unknown; keyForm: Form<K, KU>, valueForm: Form<V, VU>} & MapDownlinkFastenerDescriptor<O, K, V, KU, VU, I>): MapDownlinkFastenerFactory<MapDownlinkFastener<any, K, V, KU, VU> & I>;

  <O, K extends Value = Value, V extends Value = Value, KU extends AnyValue = AnyValue, VU extends AnyValue = AnyValue>(descriptor: MapDownlinkFastenerDescriptor<O, K, V, KU, VU>): PropertyDecorator;
  <O, K = unknown, V extends Value = Value, KU = K, VU extends AnyValue = AnyValue>(descriptor: {keyForm: Form<K, KU>} & MapDownlinkFastenerDescriptor<O, K, V, KU, VU>): PropertyDecorator;
  <O, K extends Value = Value, V = unknown, KU extends AnyValue = AnyValue, VU = V>(descriptor: {valueForm: Form<V, VU>} & MapDownlinkFastenerDescriptor<O, K, V, KU, VU>): PropertyDecorator;
  <O, K, V, KU = K, VU = V>(descriptor: {keyForm: Form<K, KU>, valueForm: Form<V, VU>} & MapDownlinkFastenerDescriptor<O, K, V, KU, VU>): PropertyDecorator;
  <O, K extends Value = Value, V extends Value = Value, KU extends AnyValue = AnyValue, VU extends AnyValue = AnyValue, I = {}>(descriptor: {implements: unknown} & MapDownlinkFastenerDescriptor<O, K, V, KU, VU, I>): PropertyDecorator;
  <O, K = unknown, V extends Value = Value, KU = K, VU extends AnyValue = AnyValue, I = {}>(descriptor: {implements: unknown; keyForm: Form<K, KU>} & MapDownlinkFastenerDescriptor<O, K, V, KU, VU, I>): PropertyDecorator;
  <O, K extends Value = Value, V = unknown, KU extends AnyValue = AnyValue, VU = V, I = {}>(descriptor: {implements: unknown; valueForm: Form<V, VU>} & MapDownlinkFastenerDescriptor<O, K, V, KU, VU, I>): PropertyDecorator;
  <O, K, V, KU = K, VU = V, I = {}>(descriptor: {implements: unknown; keyForm: Form<K, KU>, valueForm: Form<V, VU>} & MapDownlinkFastenerDescriptor<O, K, V, KU, VU, I>): PropertyDecorator;
}

/** @beta */
export interface MapDownlinkFastener<O = unknown, K = unknown, V = unknown, KU = K, VU = V> extends DownlinkFastener<O> {
  (key: K | KU): V | undefined;
  (key: K | KU, value: V | VU): O;

  /** @internal */
  ownKeyForm: Form<K, KU> | null;

  keyForm(): Form<K, KU> | null;
  keyForm(keyForm: Form<K, KU> | null): this;

  /** @internal */
  readonly ownValueForm: Form<V, VU> | null;

  valueForm(): Form<V, VU> | null;
  valueForm(valueForm: Form<V, VU> | null): this;

  get size(): number;

  isEmpty(): boolean;

  has(key: K | KU): boolean;

  get(key: K | KU): V | undefined;

  getEntry(index: number): [K, V] | undefined;

  firstKey(): K | undefined;

  firstValue(): V | undefined;

  firstEntry(): [K, V] | undefined;

  lastKey(): K | undefined;

  lastValue(): V | undefined;

  lastEntry(): [K, V] | undefined;

  nextKey(keyObject: K): K | undefined;

  nextValue(keyObject: K): V | undefined;

  nextEntry(keyObject: K): [K, V] | undefined;

  previousKey(keyObject: K): K | undefined;

  previousValue(keyObject: K): V | undefined;

  previousEntry(keyObject: K): [K, V] | undefined;

  set(key: K | KU, newValue: V | VU): this;

  delete(key: K | KU): boolean;

  drop(lower: number): this;

  take(upper: number): this;

  clear(): void;

  forEach<T>(callback: (key: K, value: V) => T | void): T | undefined;
  forEach<T, S>(callback: (this: S, key: K, value: V) => T | void, thisArg: S): T | undefined;

  keys(): Cursor<K>;

  values(): Cursor<V>;

  entries(): Cursor<[K, V]>;

  /** @override */
  readonly downlink: MapDownlink<K, V, KU, VU> | null;

  /** @internal @override */
  createDownlink(warp: WarpRef): MapDownlink<K, V, KU, VU>;

  /** @internal @override */
  bindDownlink(downlink: MapDownlink<K, V, KU, VU>): MapDownlink<K, V, KU, VU>;

  /** @internal */
  initDownlink?(downlink: MapDownlink<K, V, KU, VU>): MapDownlink<K, V, KU, VU>;
}

/** @beta */
export const MapDownlinkFastener = (function (_super: typeof DownlinkFastener) {
  const MapDownlinkFastener: MapDownlinkFastenerFactory = _super.extend("MapDownlinkFastener");

  MapDownlinkFastener.prototype.keyForm = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>, keyForm?: Form<K, KU> | null): Form<K, KU> | null | typeof this {
    if (keyForm === void 0) {
      return this.ownKeyForm;
    } else {
      if (this.ownKeyForm !== keyForm) {
        (this as Mutable<typeof this>).ownKeyForm = keyForm;
        this.relink();
      }
      return this;
    }
  } as typeof MapDownlinkFastener.prototype.keyForm;

  MapDownlinkFastener.prototype.valueForm = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>, valueForm?: Form<V, VU> | null): Form<V, VU> | null | typeof this {
    if (valueForm === void 0) {
      return this.ownValueForm;
    } else {
      if (this.ownValueForm !== valueForm) {
        (this as Mutable<typeof this>).ownValueForm = valueForm;
        this.relink();
      }
      return this;
    }
  } as typeof MapDownlinkFastener.prototype.valueForm;

  Object.defineProperty(MapDownlinkFastener.prototype, "size", {
    get: function (this: MapDownlinkFastener<unknown>): number {
      const downlink = this.downlink;
      return downlink !== null ? downlink.size : 0;
    },
    configurable: true,
  });

  MapDownlinkFastener.prototype.isEmpty = function (this: MapDownlinkFastener<unknown>): boolean {
    const downlink = this.downlink;
    return downlink !== null ? downlink.isEmpty() : true;
  };

  MapDownlinkFastener.prototype.has = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>, key: K | KU): boolean {
    const downlink = this.downlink;
    return downlink !== null ? downlink.has(key) : false;
  };

  MapDownlinkFastener.prototype.get = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>, key: K | KU): V | undefined {
    const downlink = this.downlink;
    let value: V | undefined;
    if (downlink !== null) {
      value = downlink.get(key);
    }
    if (value === void 0 && this.ownValueForm !== null) {
      value = this.ownValueForm.unit;
    }
    return value;
  };

  MapDownlinkFastener.prototype.getEntry = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>, index: number): [K, V] | undefined {
    const downlink = this.downlink;
    return downlink !== null ? downlink.getEntry(index) : void 0;
  };

  MapDownlinkFastener.prototype.firstKey = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>): K | undefined {
    const downlink = this.downlink;
    return downlink !== null ? downlink.firstKey() : void 0;
  };

  MapDownlinkFastener.prototype.firstValue = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>): V | undefined {
    const downlink = this.downlink;
    return downlink !== null ? downlink.firstValue() : void 0;
  };

  MapDownlinkFastener.prototype.firstEntry = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>): [K, V] | undefined {
    const downlink = this.downlink;
    return downlink !== null ? downlink.firstEntry() : void 0;
  };

  MapDownlinkFastener.prototype.lastKey = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>): K | undefined {
    const downlink = this.downlink;
    return downlink !== null ? downlink.lastKey() : void 0;
  };

  MapDownlinkFastener.prototype.lastValue = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>): V | undefined {
    const downlink = this.downlink;
    return downlink !== null ? downlink.lastValue() : void 0;
  };

  MapDownlinkFastener.prototype.lastEntry = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>): [K, V] | undefined {
    const downlink = this.downlink;
    return downlink !== null ? downlink.lastEntry() : void 0;
  };

  MapDownlinkFastener.prototype.nextKey = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>, keyObject: K): K | undefined {
    const downlink = this.downlink;
    return downlink !== null ? downlink.nextKey(keyObject) : void 0;
  };

  MapDownlinkFastener.prototype.nextValue = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>, keyObject: K): V | undefined {
    const downlink = this.downlink;
    return downlink !== null ? downlink.nextValue(keyObject) : void 0;
  };

  MapDownlinkFastener.prototype.nextEntry = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>, keyObject: K): [K, V] | undefined {
    const downlink = this.downlink;
    return downlink !== null ? downlink.nextEntry(keyObject) : void 0;
  };

  MapDownlinkFastener.prototype.previousKey = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>, keyObject: K): K | undefined {
    const downlink = this.downlink;
    return downlink !== null ? downlink.previousKey(keyObject) : void 0;
  };

  MapDownlinkFastener.prototype.previousValue = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>, keyObject: K): V | undefined {
    const downlink = this.downlink;
    return downlink !== null ? downlink.previousValue(keyObject) : void 0;
  };

  MapDownlinkFastener.prototype.previousEntry = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>, keyObject: K): [K, V] | undefined {
    const downlink = this.downlink;
    return downlink !== null ? downlink.previousEntry(keyObject) : void 0;
  };

  MapDownlinkFastener.prototype.set = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>, key: K | KU, newValue: V | VU): typeof this {
    const downlink = this.downlink;
    if (downlink !== null) {
      downlink.set(key, newValue);
    }
    return this;
  };

  MapDownlinkFastener.prototype.delete = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>, key: K | KU): boolean {
    const downlink = this.downlink;
    return downlink !== null ? downlink.delete(key) : false;
  };

  MapDownlinkFastener.prototype.drop = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>, lower: number): typeof this {
    const downlink = this.downlink;
    if (downlink !== null) {
      downlink.drop(lower);
    }
    return this;
  };

  MapDownlinkFastener.prototype.take = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>, upper: number): typeof this {
    const downlink = this.downlink;
    if (downlink !== null) {
      downlink.take(upper);
    }
    return this;
  };

  MapDownlinkFastener.prototype.clear = function (this: MapDownlinkFastener<unknown>): void {
    const downlink = this.downlink;
    if (downlink !== null) {
      downlink.clear();
    }
  };

  MapDownlinkFastener.prototype.forEach = function <K, V, KU, VU, T, S>(this: MapDownlinkFastener<unknown, K, V, KU, VU>, callback: (this: S | undefined, key: K, value: V) => T | void, thisArg?: S): T | undefined {
    const downlink = this.downlink;
    return downlink !== null ? downlink.forEach(callback, thisArg) : void 0;
  };

  MapDownlinkFastener.prototype.keys = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>): Cursor<K> {
    const downlink = this.downlink;
    return downlink !== null ? downlink.keys() : Cursor.empty();
  };

  MapDownlinkFastener.prototype.values = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>): Cursor<V> {
    const downlink = this.downlink;
    return downlink !== null ? downlink.values() : Cursor.empty();
  };

  MapDownlinkFastener.prototype.entries = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>): Cursor<[K, V]> {
    const downlink = this.downlink;
    return downlink !== null ? downlink.entries() : Cursor.empty();
  };

  MapDownlinkFastener.prototype.createDownlink = function <K, V, KU, VU>(this: MapDownlinkFastener<unknown, K, V, KU, VU>, warp: WarpRef): MapDownlink<K, V, KU, VU> {
    let downlink = warp.downlinkMap() as unknown as MapDownlink<K, V, KU, VU>;
    if (this.ownKeyForm !== null) {
      downlink = downlink.keyForm(this.ownKeyForm);
    }
    if (this.ownValueForm !== null) {
      downlink = downlink.valueForm(this.ownValueForm);
    }
    return downlink;
  };

  MapDownlinkFastener.construct = function <F extends MapDownlinkFastener<any, any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    if (fastener === null) {
      fastener = function (key: MapDownlinkFastenerKeyType<F> | MapDownlinkFastenerKeyInitType<F>, value?: MapDownlinkFastenerValueType<F> | MapDownlinkFastenerValueInitType<F>): MapDownlinkFastenerValueType<F> | undefined | FastenerOwner<F> {
        if (arguments.length === 1) {
          return fastener!.get(key);
        } else {
          fastener!.set(key, value!);
          return fastener!.owner;
        }
      } as F;
      delete (fastener as Partial<Mutable<F>>).name; // don't clobber prototype name
      Object.setPrototypeOf(fastener, fastenerClass.prototype);
    }
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).ownKeyForm = null;
    (fastener as Mutable<typeof fastener>).ownValueForm = null;
    return fastener;
  };

  MapDownlinkFastener.define = function <O, K, V, KU, VU>(className: string, descriptor: MapDownlinkFastenerDescriptor<O, K, V, KU, VU>): MapDownlinkFastenerFactory<MapDownlinkFastener<any, K, V, KU, VU>> {
    let superClass = descriptor.extends as MapDownlinkFastenerFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    const keyForm = descriptor.keyForm;
    const valueForm = descriptor.valueForm;
    let hostUri = descriptor.hostUri;
    let nodeUri = descriptor.nodeUri;
    let laneUri = descriptor.laneUri;
    let prio = descriptor.prio;
    let rate = descriptor.rate;
    let body = descriptor.body;
    delete descriptor.extends;
    delete descriptor.implements;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.keyForm;
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

    fastenerClass.construct = function (fastenerClass: {prototype: MapDownlinkFastener<any, any, any>}, fastener: MapDownlinkFastener<O, K, V, KU, VU> | null, owner: O): MapDownlinkFastener<O, K, V, KU, VU> {
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
      if (keyForm !== void 0) {
        (fastener as Mutable<typeof fastener>).ownKeyForm = keyForm;
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

  return MapDownlinkFastener;
})(DownlinkFastener);
