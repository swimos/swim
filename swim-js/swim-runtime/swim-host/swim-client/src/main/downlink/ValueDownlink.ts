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

import {Mutable, Arrays, Cursor} from "@swim/util";
import {AnyValue, Value, Form} from "@swim/structure";
import {Inlet, Outlet, OutletCombinators} from "@swim/streamlet";
import type {AnyUri, Uri} from "@swim/uri";
import type {DownlinkContext} from "./DownlinkContext";
import type {DownlinkOwner} from "./DownlinkOwner";
import {DownlinkType, DownlinkObserver, DownlinkInit, DownlinkFlags, Downlink} from "./Downlink";
import {ValueDownlinkModel} from "./ValueDownlinkModel";

/** @public */
export type ValueDownlinkWillSet<V, VU = never> = (newValue: V, downlink: ValueDownlink<V, VU>) => V | void;
/** @public */
export type VaueDownlinkDidSet<V, VU = never> = (newValue: V, oldValue: V, downlink: ValueDownlink<V, VU>) => void;

/** @public */
export interface ValueDownlinkObserver<V, VU = never> extends DownlinkObserver {
  willSet?: ValueDownlinkWillSet<V, VU>;
  didSet?: VaueDownlinkDidSet<V, VU>;
}

/** @public */
export interface ValueDownlinkInit<V, VU = never> extends ValueDownlinkObserver<V, VU>, DownlinkInit {
  valueForm?: Form<V, VU>;
}

/** @public */
export class ValueDownlink<V, VU = never> extends Downlink implements Inlet<V>, Outlet<V> {
  /** @internal */
  constructor(context: DownlinkContext, owner: DownlinkOwner | null, init?: ValueDownlinkInit<V, VU>,
              hostUri?: Uri, nodeUri?: Uri, laneUri?: Uri, prio?: number, rate?: number,
              body?: Value, flags: number = DownlinkFlags.KeepLinkedSynced,
              observers?: ReadonlyArray<ValueDownlinkObserver<V, VU>> | ValueDownlinkObserver<V, VU>,
              valueForm?: Form<V, VU>, state0: Value = Value.absent()) {
    super(context, owner, init, hostUri, nodeUri, laneUri, prio, rate, body, flags, observers);
    if (init !== void 0) {
      const observer = this.observers[this.observers.length - 1]!;
      observer.willSet = init.willSet ?? observer.willSet;
      observer.didSet = init.didSet ?? observer.didSet;
      valueForm = init.valueForm !== void 0 ? init.valueForm : valueForm;
    }
    this.ownValueForm = valueForm !== void 0 ? valueForm : Form.forValue() as unknown as Form<V, VU>;
    this.state0 = state0;
    this.input = null;
    this.outputs = Arrays.empty;
    this.version = -1;
  }

  /** @internal */
  override readonly model!: ValueDownlinkModel | null;

  /** @internal */
  override observers!: ReadonlyArray<ValueDownlinkObserver<V, VU>>;

  /** @internal */
  readonly ownValueForm: Form<V, VU>;

  /** @internal */
  readonly state0: Value;

  override get type(): DownlinkType {
    return "value";
  }

  /** @internal */
  protected override copy<V, VU>(context: DownlinkContext, owner: DownlinkOwner | null,
                                 hostUri: Uri, nodeUri: Uri, laneUri: Uri, prio: number, rate: number,
                                 body: Value, flags: number, observers: ReadonlyArray<ValueDownlinkObserver<V, VU>>,
                                 valueForm?: Form<V, VU>, state0?: Value): ValueDownlink<V, VU> {
    if (arguments.length === 10) {
      state0 = this.state0;
      valueForm = this.ownValueForm as unknown as Form<V, VU>;
    }
    return new ValueDownlink(context, owner, void 0, hostUri, nodeUri, laneUri,
                             prio, rate, body, flags, observers, valueForm, state0);
  }

  valueForm(): Form<V, VU>;
  valueForm<V2, V2U = never>(valueForm: Form<V2, V2U>): ValueDownlink<V2, V2U>;
  valueForm<V2, V2U = never>(valueForm?: Form<V2, V2U>): Form<V, VU> | ValueDownlink<V2, V2U> {
    if (valueForm === void 0) {
      return this.ownValueForm;
    } else {
      return this.copy(this.context, this.owner, this.ownHostUri, this.ownNodeUri, this.ownLaneUri,
                       this.ownPrio, this.ownRate, this.ownBody, this.flags, this.observers as any,
                       valueForm, this.state0);
    }
  }

  get(): V {
    const value = this.model!.get();
    const object = value.coerce(this.ownValueForm);
    return object;
  }

  set(newObject: V | VU): void {
    const newValue = this.ownValueForm.mold(newObject);
    this.model!.set(newValue);
  }

  setState(state: Value): void {
    this.model!.setState(state);
  }

  override observe(observer: ValueDownlinkObserver<V, VU>): this {
    return super.observe(observer);
  }

  willSet(willSet: ValueDownlinkWillSet<V, VU>): this {
    return this.observe({willSet});
  }

  didSet(didSet: VaueDownlinkDidSet<V, VU>): this {
    return this.observe({didSet});
  }

  /** @internal */
  valueWillSet(newValue: Value): Value {
    let newObject: V | undefined;
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.willSet !== void 0) {
        if (newObject === void 0) {
          newObject = newValue.coerce(this.ownValueForm);
        }
        const newResult = observer.willSet(newObject, this);
        if (newResult !== void 0) {
          newObject = newResult;
          newValue = this.ownValueForm.mold(newObject);
        }
      }
    }
    return newValue;
  }

  /** @internal */
  valueDidSet(newValue: Value, oldValue: Value): void {
    let newObject: V | undefined;
    let oldObject: V | undefined;
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didSet !== void 0) {
        if (newObject === void 0) {
          newObject = newValue.coerce(this.ownValueForm);
        }
        if (oldObject === void 0) {
          oldObject = oldValue.coerce(this.ownValueForm);
        }
        observer.didSet(newObject, oldObject, this);
      }
    }
    this.decohere();
    this.recohere(0); // TODO: debounce update; track version
  }

  initialState(): Value;
  initialState(state0: Value): ValueDownlink<V, VU>;
  initialState(state0?: Value): Value | ValueDownlink<V, VU> {
    if (state0 === void 0) {
      return this.state0;
    } else {
      return this.copy(this.context, this.owner, this.ownHostUri, this.ownNodeUri, this.ownLaneUri,
                       this.ownPrio, this.ownRate, this.ownBody, this.flags, this.observers,
                       this.ownValueForm, state0);
    }
  }

  /** @internal */
  protected didAliasModel(): void {
    this.onLinkedResponse();
    this.valueDidSet(this.model!.get(), Value.absent());
    this.onSyncedResponse();
  }

  override open(): this {
    const laneUri = this.ownLaneUri;
    if (laneUri.isEmpty()) {
      throw new Error("no lane");
    }
    let nodeUri = this.ownNodeUri;
    if (nodeUri.isEmpty()) {
      throw new Error("no node");
    }
    let hostUri = this.ownHostUri;
    if (hostUri.isEmpty()) {
      hostUri = nodeUri.endpoint();
      nodeUri = hostUri.unresolve(nodeUri);
    }
    let model = this.context.getDownlink(hostUri, nodeUri, laneUri);
    if (model !== void 0) {
      if (!(model instanceof ValueDownlinkModel)) {
        throw new Error("downlink type mismatch");
      }
      model.addDownlink(this);
      (this as Mutable<this>).model = model as ValueDownlinkModel;
      setTimeout(this.didAliasModel.bind(this));
    } else {
      model = new ValueDownlinkModel(this.context, hostUri, nodeUri, laneUri, this.ownPrio,
                                     this.ownRate, this.ownBody, this.state0);
      model.addDownlink(this);
      this.context.openDownlink(model);
      (this as Mutable<this>).model = model as ValueDownlinkModel;
    }
    if (this.owner !== null) {
      this.owner.addDownlink(this);
    }
    return this;
  }

  readonly input: Outlet<V> | null;

  /** @internal */
  readonly outputs: ReadonlyArray<Inlet<V>>;

  /** @internal */
  readonly version: number;

  bindInput(newInput: Outlet<V> | null): void {
    const oldInput = this.input;
    if (oldInput !== newInput) {
      if (oldInput !== null) {
        oldInput.unbindOutput(this);
      }
      (this as Mutable<this>).input = newInput;
      if (newInput !== null) {
        newInput.bindOutput(this);
      }
    }
  }

  unbindInput(): void {
    const oldInput = this.input;
    if (oldInput !== null) {
      oldInput.unbindOutput(this);
      (this as Mutable<this>).input = null;
    }
  }

  disconnectInputs(): void {
    const oldInput = this.input;
    if (oldInput !== null) {
      oldInput.unbindOutput(this);
      (this as Mutable<this>).input = null;
      oldInput.disconnectInputs();
    }
  }

  outputIterator(): Cursor<Inlet<V>> {
    return Cursor.array(this.outputs);
  }

  bindOutput(output: Inlet<V>): void {
    (this as Mutable<this>).outputs = Arrays.inserted(output, this.outputs);
  }

  unbindOutput(output: Inlet<V>): void {
    (this as Mutable<this>).outputs = Arrays.removed(output, this.outputs);
  }

  unbindOutputs(): void {
    const oldOutputs = this.outputs;
    (this as Mutable<this>).outputs = Arrays.empty;
    for (let i = 0, n = oldOutputs.length; i < n; i += 1) {
      const output = oldOutputs[i]!;
      output.unbindInput();
    }
  }

  disconnectOutputs(): void {
    const oldOutputs = this.outputs;
    (this as Mutable<this>).outputs = Arrays.empty;
    for (let i = 0, n = oldOutputs.length; i < n; i += 1) {
      const output = oldOutputs[i]!;
      output.unbindInput();
      output.disconnectOutputs();
    }
  }

  decohereOutput(): void {
    this.decohere();
  }

  decohereInput(): void {
    this.decohere();
  }

  decohere(): void {
    if (this.version >= 0) {
      this.willDecohere();
      (this as Mutable<this>).version = -1;
      this.onDecohere();
      const outputs = this.outputs;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        outputs[i]!.decohereOutput();
      }
      this.didDecohere();
    }
  }

  recohereOutput(version: number): void {
    this.recohere(version);
  }

  recohereInput(version: number): void {
    this.recohere(version);
  }

  recohere(version: number): void {
    if (this.version < 0) {
      this.willRecohere(version);
      (this as Mutable<this>).version = version;
      if (this.input !== null) {
        this.input.recohereInput(version);
      }
      this.onRecohere(version);
      const outputs = this.outputs;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        outputs[i]!.recohereOutput(version);
      }
      this.didRecohere(version);
    }
  }

  protected willDecohere(): void {
    // hook
  }

  protected onDecohere(): void {
    // hook
  }

  protected didDecohere(): void {
    // hook
  }

  protected willRecohere(version: number): void {
    // hook
  }

  protected onRecohere(version: number): void {
    const input = this.input;
    if (input !== null) {
      const value = input.get();
      if (value !== void 0) {
        this.set(value);
      }
    }
  }

  protected didRecohere(version: number): void {
    // hook
  }
}
/** @public */
export interface ValueDownlink<V, VU> {
  hostUri(): Uri;
  hostUri(hostUri: AnyUri): ValueDownlink<V, VU>;

  nodeUri(): Uri;
  nodeUri(nodeUri: AnyUri): ValueDownlink<V, VU>;

  laneUri(): Uri;
  laneUri(laneUri: AnyUri): ValueDownlink<V, VU>;

  prio(): number;
  prio(prio: number): ValueDownlink<V, VU>;

  rate(): number;
  rate(rate: number): ValueDownlink<V, VU>;

  body(): Value;
  body(body: AnyValue): ValueDownlink<V, VU>;

  keepLinked(): boolean;
  keepLinked(keepLinked: boolean): ValueDownlink<V, VU>;

  keepSynced(): boolean;
  keepSynced(keepSynced: boolean): ValueDownlink<V, VU>;
}
/** @public */
export interface ValueDownlink<V, VU> extends OutletCombinators<V> {
}
OutletCombinators.define(ValueDownlink.prototype);
