// Copyright 2015-2024 Nstream, inc.
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
import type {Class} from "@swim/util";
import type {Proto} from "@swim/util";
import type {LikeType} from "@swim/util";
import type {Fastener} from "@swim/component";
import {Value} from "@swim/structure";
import {Form} from "@swim/structure";
import {WarpDownlinkContext} from "./WarpDownlinkContext";
import type {WarpDownlinkDescriptor} from "./WarpDownlink";
import type {WarpDownlinkClass} from "./WarpDownlink";
import type {WarpDownlinkObserver} from "./WarpDownlink";
import {WarpDownlink} from "./WarpDownlink";
import {ValueDownlinkModel} from "./ValueDownlinkModel";

/** @public */
export interface ValueDownlinkDescriptor<R, V> extends WarpDownlinkDescriptor<R> {
  extends?: Proto<ValueDownlink<any, any, any>> | boolean | null;
  valueForm?: Form<V, LikeType<V>>;
  /** @internal */
  stateInit?: Value | null;
}

/** @public */
export interface ValueDownlinkClass<F extends ValueDownlink<any, any, any> = ValueDownlink<any, any, any>> extends WarpDownlinkClass<F> {
}

/** @public */
export interface ValueDownlinkObserver<V = any, F extends ValueDownlink<any, V> = ValueDownlink<any, V>> extends WarpDownlinkObserver<F> {
  willSet?(newValue: V, downlink: F): V | void;

  didSet?(newValue: V, oldValue: V, downlink: F): void;
}

/** @public */
export interface ValueDownlink<R = any, V = Value, I extends any[] = [V]> extends WarpDownlink<R, V, I> {
  /** @override */
  get descriptorType(): Proto<ValueDownlinkDescriptor<R, V>>;

  /** @override */
  readonly observerType?: Class<ValueDownlinkObserver<V>>;

  /** @internal @override */
  readonly model: ValueDownlinkModel | null;

  /** @protected */
  initValueForm(): Form<V, LikeType<V>>;

  readonly valueForm: Form<V, LikeType<V>>;

  setValueForm(valueForm: Form<V, LikeType<V>>): this;

  /** @internal */
  readonly stateInit?: Value | null; // optional prototype property

  /** @internal */
  initState(): Value | null;

  /** @internal */
  setState(state: Value): void;

  /** @override */
  get(): V;

  set(value: V | LikeType<V>): void;

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
export const ValueDownlink = (<R, V, F extends ValueDownlink<any, any, any>>() => WarpDownlink.extend<ValueDownlink<R, V>, ValueDownlinkClass<F>>("ValueDownlink", {
  relinks: true,
  syncs: true,

  initValueForm(): Form<V, LikeType<V>> {
    const valueForm = (Object.getPrototypeOf(this) as ValueDownlink<unknown, V>).valueForm as Form<V, LikeType<V>> | undefined;
    if (valueForm === void 0) {
      return Form.forValue() as unknown as Form<V, LikeType<V>>;
    }
    return valueForm;
  },

  setValueForm(valueForm: Form<V, LikeType<V>>): typeof this {
    if (this.valueForm !== valueForm) {
      (this as Mutable<typeof this>).valueForm = valueForm;
      this.relink();
    }
    return this;
  },

  initState(): Value | null {
    let stateInit = this.stateInit;
    if (stateInit === void 0) {
      stateInit = null;
    }
    return stateInit;
  },

  setState(state: Value): void {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    model.setState(state);
  },

  get(): V {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    const value = model.get();
    return value.coerce(this.valueForm);
  },

  set(object: V | LikeType<V>): void {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    const value = this.valueForm.mold(object);
    model.set(value);
  },

  valueWillSet(newValue: Value): Value {
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
    if (observers !== null && observers.size !== 0) {
      if (newObject === void 0) {
        newObject = newValue.coerce(valueForm);
      }
      for (const observer of observers) {
        if (observer.willSet === void 0) {
          continue;
        }
        const newResult = observer.willSet(newObject, this);
        if (newResult !== void 0) {
          newObject = newResult;
          newValue = valueForm.mold(newObject);
        }
      }
    }

    return newValue;
  },

  valueDidSet(newValue: Value, oldValue: Value): void {
    let newObject: V | undefined;
    let oldObject: V | undefined;
    const valueForm = this.valueForm;

    if (this.didSet !== void 0) {
      newObject = newValue.coerce(valueForm);
      oldObject = oldValue.coerce(valueForm);
      this.didSet(newObject, oldObject);
    }

    const observers = this.observers;
    if (observers !== null && observers.size !== 0) {
      if (newObject === void 0) {
        newObject = newValue.coerce(valueForm);
      }
      if (oldObject === void 0) {
        oldObject = oldValue.coerce(valueForm);
      }
      for (const observer of observers) {
        if (observer.didSet === void 0) {
          continue;
        }
        observer.didSet(newObject, oldObject, this);
      }
    }
  },

  didAliasModel(): void {
    const model = this.model;
    if (model === null || !model.linked) {
      return;
    }
    this.onLinkedResponse();
    this.valueDidSet(model.get(), Value.absent());
    if (model.synced) {
      this.onSyncedResponse();
    }
  },

  open(): typeof this {
    if (this.model !== null) {
      return this;
    }
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
    if (!WarpDownlinkContext[Symbol.hasInstance](owner)) {
      throw new Error("no downlink context");
    }
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
    return this;
  },
},
{
  construct(downlink: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    downlink = super.construct(downlink, owner) as F;
    (downlink as Mutable<typeof downlink>).valueForm = downlink.initValueForm();
    return downlink;
  },
}))();
