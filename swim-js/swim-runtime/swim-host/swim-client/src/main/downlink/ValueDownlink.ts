// Copyright 2015-2023 Swim.inc
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

import type {Mutable, Class, Proto} from "@swim/util";
import type {FastenerOwner} from "@swim/component";
import {AnyValue, Value, Form} from "@swim/structure";
import {WarpDownlinkContext} from "./WarpDownlinkContext";
import {WarpDownlinkDescriptor, WarpDownlinkClass, WarpDownlink} from "./WarpDownlink";
import {ValueDownlinkModel} from "./ValueDownlinkModel";
import type {ValueDownlinkObserver} from "./ValueDownlinkObserver";

/** @public */
export type ValueDownlinkValue<D extends ValueDownlink<any, any, any>> =
  D extends {value: infer V} ? V : never;

/** @public */
export type ValueDownlinkValueInit<D extends ValueDownlink<any, any, any>> =
  D extends {valueInit?: infer VU} ? VU : never;

/** @public */
export type AnyValueDownlinkValue<D extends ValueDownlink<any, any, any>> =
  ValueDownlinkValue<D> | ValueDownlinkValueInit<D>;

/** @public */
export interface ValueDownlinkDescriptor<V = unknown, VU = V> extends WarpDownlinkDescriptor {
  extends?: Proto<ValueDownlink<any, any, any>> | string | boolean | null;
  valueForm?: Form<V, VU>;
  /** @internal */
  stateInit?: Value | null;
}

/** @public */
export type ValueDownlinkTemplate<D extends ValueDownlink<any, any, any>> =
  ThisType<D> &
  ValueDownlinkDescriptor<ValueDownlinkValue<D>, ValueDownlinkValueInit<D>> &
  Partial<Omit<D, keyof ValueDownlinkDescriptor>>;

/** @public */
export interface ValueDownlinkClass<D extends ValueDownlink<any, any, any> = ValueDownlink<any, any, any>> extends WarpDownlinkClass<D> {
  /** @override */
  specialize(template: ValueDownlinkDescriptor<any>): ValueDownlinkClass<D>;

  /** @override */
  refine(downlinkClass: ValueDownlinkClass<any>): void;

  /** @override */
  extend<D2 extends D>(className: string, template: ValueDownlinkTemplate<D2>): ValueDownlinkClass<D2>;
  extend<D2 extends D>(className: string, template: ValueDownlinkTemplate<D2>): ValueDownlinkClass<D2>;

  /** @override */
  define<D2 extends D>(className: string, template: ValueDownlinkTemplate<D2>): ValueDownlinkClass<D2>;
  define<D2 extends D>(className: string, template: ValueDownlinkTemplate<D2>): ValueDownlinkClass<D2>;

  /** @override */
  <D2 extends D>(template: ValueDownlinkTemplate<D2>): PropertyDecorator;
}

/** @public */
export interface ValueDownlink<O = unknown, V = Value, VU = V extends Value ? AnyValue & V : V> extends WarpDownlink<O> {
  (): V;
  (value: V | VU): O;

  /** @override */
  readonly observerType?: Class<ValueDownlinkObserver<V>>;

  /** @internal @override */
  readonly model: ValueDownlinkModel | null;

  /** @protected */
  initValueForm(): Form<V, VU>;

  readonly valueForm: Form<V, VU>;

  setValueForm(valueForm: Form<V, VU>): this;

  /** @internal */
  readonly value?: V; // for type destructuring

  /** @internal */
  readonly valueInit?: VU; // for type destructuring

  /** @internal */
  readonly stateInit?: Value | null; // optional prototype property

  /** @internal */
  initState(): Value | null;

  /** @internal */
  setState(state: Value): void;

  get(): V;

  set(value: V | VU): void;

  /** @protected */
  willSet?(newValue: V): V | void;

  /** @protected */
  didSet?(newValue: V, oldValue: V): void;

  /** @internal */
  valueWillSet(newValue: Value): Value;

  /** @internal */
  valueDidSet(newValue: Value, oldValue: Value): void;

  /** @internal */
  didAliasModel(): void;

  /** @override */
  open(): this;
}

/** @public */
export const ValueDownlink = (function (_super: typeof WarpDownlink) {
  const ValueDownlink = _super.extend("ValueDownlink", {
    relinks: true,
    syncs: true,
  }) as ValueDownlinkClass;

  ValueDownlink.prototype.initValueForm = function <V, VU>(this: ValueDownlink<unknown, V, VU>): Form<V, VU> {
    let valueForm = (Object.getPrototypeOf(this) as ValueDownlink<unknown, V, VU>).valueForm as Form<V, VU> | undefined;
    if (valueForm === void 0) {
      valueForm = Form.forValue() as unknown as Form<V, VU>;
    }
    return valueForm;
  };

  ValueDownlink.prototype.setValueForm = function <V, VU>(this: ValueDownlink<unknown, V, VU>, valueForm: Form<V, VU>): ValueDownlink<unknown, V, VU> {
    if (this.valueForm !== valueForm) {
      (this as Mutable<typeof this>).valueForm = valueForm;
      this.relink();
    }
    return this;
  };

  ValueDownlink.prototype.initState = function (this: ValueDownlink): Value | null {
    let stateInit = this.stateInit;
    if (stateInit === void 0) {
      stateInit = null;
    }
    return stateInit;
  };

  ValueDownlink.prototype.setState = function (this: ValueDownlink, state: Value): void {
    const model = this.model;
    if (model !== null) {
      model.setState(state);
    } else {
      throw new Error("unopened downlink");
    }
  };

  ValueDownlink.prototype.get = function <V>(this: ValueDownlink<unknown, V>): V {
    const model = this.model;
    if (model !== null) {
      const value = model.get();
      return value.coerce(this.valueForm)
    } else {
      throw new Error("unopened downlink");
    }
  };

  ValueDownlink.prototype.set = function <V, VU>(this: ValueDownlink<unknown, V, VU>, object: V | VU): void {
    const model = this.model;
    if (model !== null) {
      const value = this.valueForm.mold(object);
      model.set(value);
    } else {
      throw new Error("unopened downlink");
    }
  };

  ValueDownlink.prototype.valueWillSet = function <V>(this: ValueDownlink<unknown, V>, newValue: Value): Value {
    let newObject: V | undefined;
    const valueForm = this.valueForm;

    if (this.willSet !== void 0) {
      newObject = newValue.coerce(valueForm);
      const newResult = this.willSet(newObject);
      if (newResult !== void 0) {
        newObject = newResult;
        newValue = valueForm.mold(newObject);
      }
    }

    const observers = this.observers;
    const observerCount = observers.length;
    if (observerCount !== 0) {
      if (newObject === void 0) {
        newObject = newValue.coerce(valueForm);
      }
      for (let i = 0; i < observerCount; i += 1) {
        const observer = observers[i]!;
        if (observer.willSet !== void 0) {
          const newResult = observer.willSet(newObject, this);
          if (newResult !== void 0) {
            newObject = newResult;
            newValue = valueForm.mold(newObject);
          }
        }
      }
    }

    return newValue;
  };

  ValueDownlink.prototype.valueDidSet = function <V>(this: ValueDownlink<unknown, V>, newValue: Value, oldValue: Value): void {
    let newObject: V | undefined;
    let oldObject: V | undefined;
    const valueForm = this.valueForm;

    if (this.didSet !== void 0) {
      newObject = newValue.coerce(valueForm);
      oldObject = oldValue.coerce(valueForm);
      this.didSet(newObject, oldObject);
    }

    const observers = this.observers;
    const observerCount = observers.length;
    if (observerCount !== 0) {
      if (newObject === void 0) {
        newObject = newValue.coerce(valueForm);
      }
      if (oldObject === void 0) {
        oldObject = oldValue.coerce(valueForm);
      }
      for (let i = 0; i < observerCount; i += 1) {
        const observer = observers[i]!;
        if (observer.didSet !== void 0) {
          observer.didSet(newObject, oldObject, this);
        }
      }
    }
  };

  ValueDownlink.prototype.didAliasModel = function <V>(this: ValueDownlink<unknown, V>): void {
    const model = this.model;
    if (model !== null && model.linked) {
      this.onLinkedResponse();
      this.valueDidSet(model.get(), Value.absent());
      if (model.synced) {
        this.onSyncedResponse();
      }
    }
  };

  ValueDownlink.prototype.open = function (this: ValueDownlink): ValueDownlink {
    if (this.model === null) {
      const laneUri = this.getLaneUri();
      if (laneUri === null) {
        throw new Error("no laneUri");
      }
      let nodeUri = this.getNodeUri();
      if (nodeUri === null) {
        throw new Error("no nodeUri");
      }
      let hostUri = this.getHostUri();
      if (hostUri === null) {
        hostUri = nodeUri.endpoint();
        nodeUri = hostUri.unresolve(nodeUri);
      }
      let prio = this.getPrio();
      if (prio === void 0) {
        prio = 0;
      }
      let rate = this.getRate();
      if (rate === void 0) {
        rate = 0;
      }
      let body = this.getBody();
      if (body === null) {
        body = Value.absent();
      }
      const owner = this.owner;
      if (WarpDownlinkContext.is(owner)) {
        let model = owner.getDownlink(hostUri, nodeUri, laneUri);
        if (model !== null) {
          if (!(model instanceof ValueDownlinkModel)) {
            throw new Error("downlink type mismatch");
          }
          model.addDownlink(this);
          (this as Mutable<typeof this>).model = model as ValueDownlinkModel;
          setTimeout(this.didAliasModel.bind(this));
        } else {
          const state = this.initState();
          model = new ValueDownlinkModel(hostUri, nodeUri, laneUri, prio, rate, body, state);
          model.addDownlink(this);
          owner.openDownlink(model);
          (this as Mutable<typeof this>).model = model as ValueDownlinkModel;
        }
      } else {
        throw new Error("no downlink context");
      }
    }
    return this;
  };

  ValueDownlink.construct = function <D extends ValueDownlink<any, any, any>>(downlink: D | null, owner: FastenerOwner<D>): D {
    if (downlink === null) {
      downlink = function (value?: ValueDownlinkValue<D> | ValueDownlinkValueInit<D>): ValueDownlinkValue<D> | FastenerOwner<D> {
        if (arguments.length === 0) {
          return downlink!.get();
        } else {
          downlink!.set(value!);
          return downlink!.owner;
        }
      } as D;
      delete (downlink as Partial<Mutable<D>>).name; // don't clobber prototype name
      Object.setPrototypeOf(downlink, this.prototype);
    }
    downlink = _super.construct.call(this, downlink, owner) as D;
    (downlink as Mutable<typeof downlink>).valueForm = downlink.initValueForm();
    return downlink;
  };

  return ValueDownlink;
})(WarpDownlink);
