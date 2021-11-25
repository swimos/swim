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

import type {Mutable} from "@swim/util";
import type {FastenerOwner} from "@swim/component";
import {AnyValue, Value, Form} from "@swim/structure";
import {Uri} from "@swim/uri";
import type {ValueDownlinkObserver, ValueDownlink} from "../downlink/ValueDownlink";
import type {WarpRef} from "../ref/WarpRef";
import {DownlinkFastenerInit, DownlinkFastenerClass, DownlinkFastener} from "./DownlinkFastener";

/** @internal */
export type ValueDownlinkFastenerType<F extends ValueDownlinkFastener<any, any>> =
  F extends ValueDownlinkFastener<any, infer V, any> ? V : never;

/** @internal */
export type ValueDownlinkFastenerInitType<F extends ValueDownlinkFastener<any, any>> =
  F extends ValueDownlinkFastener<any, infer V, infer VU> ? V | VU : never;

/** @beta */
export interface ValueDownlinkFastenerInit<V = unknown, VU = V> extends DownlinkFastenerInit, ValueDownlinkObserver<V, VU> {
  extends?: {prototype: ValueDownlinkFastener<any, any>} | string | boolean | null;
  valueForm?: Form<V, VU>;

  initDownlink?(downlink: ValueDownlink<V, VU>): ValueDownlink<V, VU>;
}

/** @beta */
export type ValueDownlinkFastenerDescriptor<O = unknown, V = unknown, VU = V, I = {}> = ThisType<ValueDownlinkFastener<O, V, VU> & I> & ValueDownlinkFastenerInit<V, VU> & Partial<I>;

/** @beta */
export interface ValueDownlinkFastenerClass<F extends ValueDownlinkFastener<any, any> = ValueDownlinkFastener<any, any>> extends DownlinkFastenerClass<F> {
}

/** @beta */
export interface ValueDownlinkFastenerFactory<F extends ValueDownlinkFastener<any, any> = ValueDownlinkFastener<any, any>> extends ValueDownlinkFastenerClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): ValueDownlinkFastenerFactory<F> & I;

  define<O, V extends Value = Value, VU extends AnyValue = AnyValue>(className: string, descriptor: ValueDownlinkFastenerDescriptor<O, V, VU>): ValueDownlinkFastenerFactory<ValueDownlinkFastener<any, V, VU>>;
  define<O, V, VU = V>(className: string, descriptor: {valueForm: Form<V, VU>} & ValueDownlinkFastenerDescriptor<O, V, VU>): ValueDownlinkFastenerFactory<ValueDownlinkFastener<any, V, VU>>;
  define<O, V extends Value = Value, VU extends AnyValue = AnyValue, I = {}>(className: string, descriptor: ValueDownlinkFastenerDescriptor<O, V, VU, I>): ValueDownlinkFastenerFactory<ValueDownlinkFastener<any, V, VU> & I>;
  define<O, V, VU = V, I = {}>(className: string, descriptor: {valueForm: Form<V, VU>} & ValueDownlinkFastenerDescriptor<O, V, VU, I>): ValueDownlinkFastenerFactory<ValueDownlinkFastener<any, V, VU> & I>;

  <O, V extends Value = Value, VU extends AnyValue = AnyValue>(descriptor: ValueDownlinkFastenerDescriptor<O, V, VU>): PropertyDecorator;
  <O, V, VU = V>(descriptor: {valueForm: Form<V, VU>} & ValueDownlinkFastenerDescriptor<O, V, VU>): PropertyDecorator;
  <O, V extends Value = Value, VU extends AnyValue = AnyValue, I = {}>(descriptor: ValueDownlinkFastenerDescriptor<O, V, VU, I>): PropertyDecorator;
  <O, V, VU = V, I = {}>(descriptor: {valueForm: Form<V, VU>} & ValueDownlinkFastenerDescriptor<O, V, VU, I>): PropertyDecorator;
}

/** @beta */
export interface ValueDownlinkFastener<O = unknown, V = unknown, VU = V> extends DownlinkFastener<O> {
  (): V | undefined;
  (value: V | VU): O;

  /** @internal */
  readonly ownValueForm: Form<V, VU> | null;

  valueForm(): Form<V, VU> | null;
  valueForm(valueForm: Form<V, VU> | null): this;

  get(): V | undefined;

  set(value: V | VU): void;

  /** @override */
  readonly downlink: ValueDownlink<V, VU> | null;

  /** @internal @override */
  createDownlink(warp: WarpRef): ValueDownlink<V, VU>;

  /** @internal @override */
  bindDownlink(downlink: ValueDownlink<V, VU>): ValueDownlink<V, VU>;

  /** @internal */
  initDownlink?(downlink: ValueDownlink<V, VU>): ValueDownlink<V, VU>;
}

/** @beta */
export const ValueDownlinkFastener = (function (_super: typeof DownlinkFastener) {
  const ValueDownlinkFastener: ValueDownlinkFastenerFactory = _super.extend("ValueDownlinkFastener");

  ValueDownlinkFastener.prototype.valueForm = function <V, VU>(this: ValueDownlinkFastener<unknown, V, VU>, valueForm?: Form<V, VU> | null): Form<V, VU> | null | typeof this {
    if (valueForm === void 0) {
      return this.ownValueForm;
    } else {
      if (this.ownValueForm !== valueForm) {
        (this as Mutable<typeof this>).ownValueForm = valueForm;
        this.relink();
      }
      return this;
    }
  } as typeof ValueDownlinkFastener.prototype.valueForm;

  ValueDownlinkFastener.prototype.get = function <V>(this: ValueDownlinkFastener<unknown, V>): V | undefined {
    const downlink = this.downlink;
    return downlink !== null ? downlink.get() : void 0;
  };

  ValueDownlinkFastener.prototype.set = function <V, VU>(this: ValueDownlinkFastener<unknown, V, VU>, value: V | VU): void {
    const downlink = this.downlink;
    if (downlink !== null) {
      downlink.set(value);
    }
  };

  ValueDownlinkFastener.prototype.createDownlink = function <V, VU>(this: ValueDownlinkFastener<unknown, V, VU>, warp: WarpRef): ValueDownlink<V, VU> {
    let downlink = warp.downlinkValue() as unknown as ValueDownlink<V, VU>;
    if (this.ownValueForm !== null) {
      downlink = downlink.valueForm(this.ownValueForm);
    }
    return downlink;
  };

  ValueDownlinkFastener.construct = function <F extends ValueDownlinkFastener<any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    if (fastener === null) {
      fastener = function (value?: ValueDownlinkFastenerType<F> | ValueDownlinkFastenerInitType<F>): ValueDownlinkFastenerType<F> | undefined | FastenerOwner<F> {
        if (arguments.length === 0) {
          return fastener!.get();
        } else {
          fastener!.set(value!);
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

  ValueDownlinkFastener.define = function <O, V, VU>(className: string, descriptor: ValueDownlinkFastenerDescriptor<O, V, VU>): ValueDownlinkFastenerFactory<ValueDownlinkFastener<any, V, VU>> {
    let superClass = descriptor.extends as ValueDownlinkFastenerFactory | null | undefined;
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

    fastenerClass.construct = function (fastenerClass: {prototype: ValueDownlinkFastener<any, any>}, fastener: ValueDownlinkFastener<O, V, VU> | null, owner: O): ValueDownlinkFastener<O, V, VU> {
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

  return ValueDownlinkFastener;
})(DownlinkFastener);
