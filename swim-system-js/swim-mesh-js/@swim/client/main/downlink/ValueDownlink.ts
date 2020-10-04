// Copyright 2015-2020 Swim inc.
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

import {Cursor} from "@swim/util";
import {Value, Form} from "@swim/structure";
import {Inlet, Outlet} from "@swim/streamlet";
import {MapValueFunction, MapValueCombinator} from "@swim/streamlet";
import {WatchValueFunction, WatchValueCombinator} from "@swim/streamlet";
import {Uri} from "@swim/uri";
import {DownlinkContext} from "./DownlinkContext";
import {DownlinkOwner} from "./DownlinkOwner";
import {DownlinkType, DownlinkObserver, DownlinkInit, DownlinkFlags, Downlink} from "./Downlink";
import {ValueDownlinkModel} from "./ValueDownlinkModel";

export type ValueDownlinkWillSet<V, VU = V> = (newValue: V, downlink: ValueDownlink<V, VU>) => V | void;
export type VaueDownlinkDidSet<V, VU = V> = (newValue: V, oldValue: V, downlink: ValueDownlink<V, VU>) => void;

export interface ValueDownlinkObserver<V, VU = V> extends DownlinkObserver {
  willSet?: ValueDownlinkWillSet<V, VU>;
  didSet?: VaueDownlinkDidSet<V, VU>;
}

export interface ValueDownlinkInit<V, VU = V> extends ValueDownlinkObserver<V, VU>, DownlinkInit {
  valueForm?: Form<V, VU>;
}

export class ValueDownlink<V, VU = V> extends Downlink implements Inlet<V>, Outlet<V> {
  /** @hidden */
  _observers: ReadonlyArray<ValueDownlinkObserver<V, VU>> | null;
  /** @hidden */
  _model: ValueDownlinkModel | null;
  /** @hidden */
  _valueForm: Form<V, VU>;
  /** @hidden */
  _state0: Value;
  /** @hidden */
  _input: Outlet<V> | null;
  /** @hidden */
  _outputs: ReadonlyArray<Inlet<V>> | null; // TODO: unify with observers
  /** @hidden */
  _version: number;

  /** @hidden */
  constructor(context: DownlinkContext, owner?: DownlinkOwner, init?: ValueDownlinkInit<V, VU>,
              hostUri?: Uri, nodeUri?: Uri, laneUri?: Uri, prio?: number, rate?: number,
              body?: Value, flags: number = DownlinkFlags.KeepLinkedSynced,
              observers?: ReadonlyArray<ValueDownlinkObserver<V, VU>> | ValueDownlinkObserver<V, VU> | null,
              valueForm?: Form<V, VU>, state0: Value = Value.absent()) {
    super(context, owner, init, hostUri, nodeUri, laneUri, prio, rate, body, flags, observers);
    if (init !== void 0) {
      const observer = this._observers![this._observers!.length - 1];
      observer.willSet = init.willSet || observer.willSet;
      observer.didSet = init.didSet || observer.didSet;
      valueForm = init.valueForm !== void 0 ? init.valueForm : valueForm;
    }
    this._valueForm = valueForm !== void 0 ? valueForm : Form.forValue() as any;
    this._state0 = state0;
    this._input = null;
    this._outputs = null;
    this._version = -1;
  }

  protected copy(context: DownlinkContext, owner: DownlinkOwner | undefined,
                 hostUri: Uri, nodeUri: Uri, laneUri: Uri, prio: number, rate: number,
                 body: Value, flags: number, observers: ReadonlyArray<ValueDownlinkObserver<V, VU>> | null,
                 valueForm?: Form<V, VU>, state0?: Value): this {
    if (arguments.length === 10) {
      state0 = this._state0;
      valueForm = this._valueForm;
    }
    return new ValueDownlink(context, owner, void 0, hostUri, nodeUri, laneUri,
                             prio, rate, body, flags, observers, valueForm, state0) as this;
  }

  type(): DownlinkType {
    return "value";
  }

  valueForm(): Form<V, VU>;
  valueForm<V2, V2U = V2>(valueForm: Form<V2, V2U>): ValueDownlink<V2, V2U>;
  valueForm<V2, V2U = V2>(valueForm?: Form<V2, V2U>): Form<V, VU> | ValueDownlink<V2, V2U> {
    if (valueForm === void 0) {
      return this._valueForm;
    } else {
      return this.copy(this._context, this._owner, this._hostUri, this._nodeUri, this._laneUri,
                       this._prio, this._rate, this._body, this._flags, this._observers,
                       valueForm as any, this._state0) as any;
    }
  }

  get(): V {
    const value = this._model!.get();
    const object = value.coerce(this._valueForm);
    return object;
  }

  set(newObject: V | VU): void {
    const newValue = this._valueForm.mold(newObject);
    this._model!.set(newValue);
  }

  setState(state: Value): void {
    this._model!.setState(state);
  }

  observe(observer: ValueDownlinkObserver<V, VU>): this {
    return super.observe(observer);
  }

  willSet(willSet: ValueDownlinkWillSet<V, VU>): this {
    return this.observe({willSet});
  }

  didSet(didSet: VaueDownlinkDidSet<V, VU>): this {
    return this.observe({didSet});
  }

  /** @hidden */
  valueWillSet(newValue: Value): Value {
    const observers = this._observers;
    const n = observers !== null ? observers.length : 0;
    let newObject: V | undefined;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.willSet !== void 0) {
        if (newObject === void 0) {
          newObject = newValue.coerce(this._valueForm);
        }
        const newResult = observer.willSet(newObject, this);
        if (newResult !== void 0) {
          newObject = newResult;
          newValue = this._valueForm.mold(newObject);
        }
      }
    }
    return newValue;
  }

  /** @hidden */
  valueDidSet(newValue: Value, oldValue: Value) {
    const observers = this._observers;
    const n = observers !== null ? observers.length : 0;
    let newObject: V | undefined;
    let oldObject: V | undefined;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didSet !== void 0) {
        if (newObject === void 0) {
          newObject = newValue.coerce(this._valueForm);
        }
        if (oldObject === void 0) {
          oldObject = oldValue.coerce(this._valueForm);
        }
        observer.didSet(newObject, oldObject, this);
      }
    }
    this.decohere();
    this.recohere(0); // TODO: debounce update; track version
  }

  initialState(): Value;
  initialState(state0: Value): this;
  initialState(state0?: Value): Value | this {
    if (state0 === void 0) {
      return this._state0;
    } else {
      return this.copy(this._context, this._owner, this._hostUri, this._nodeUri, this._laneUri,
                       this._prio, this._rate, this._body, this._flags, this._observers,
                       this._valueForm, state0);
    }
  }

  /** @hidden */
  protected didAliasModel(): void {
    this.onLinkedResponse();
    this.valueDidSet(this._model!.get(), Value.absent());
    this.onSyncedResponse();
  }

  open(): this {
    const laneUri = this._laneUri;
    if (laneUri.isEmpty()) {
      throw new Error("no lane");
    }
    let nodeUri = this._nodeUri;
    if (nodeUri.isEmpty()) {
      throw new Error("no node");
    }
    let hostUri = this._hostUri;
    if (hostUri.isEmpty()) {
      hostUri = nodeUri.endpoint();
      nodeUri = hostUri.unresolve(nodeUri);
    }
    let model = this._context.getDownlink(hostUri, nodeUri, laneUri);
    if (model !== void 0) {
      if (!(model instanceof ValueDownlinkModel)) {
        throw new Error("downlink type mismatch");
      }
      model.addDownlink(this);
      this._model = model as ValueDownlinkModel;
      setTimeout(this.didAliasModel.bind(this));
    } else {
      model = new ValueDownlinkModel(this._context, hostUri, nodeUri, laneUri, this._prio,
                                     this._rate, this._body, this._state0);
      model.addDownlink(this);
      this._context.openDownlink(model);
      this._model = model as ValueDownlinkModel;
    }
    if (this._owner !== void 0) {
      this._owner.addDownlink(this);
    }
    return this;
  }

  input(): Outlet<V> | null {
    return this._input;
  }

  bindInput(input: Outlet<V> | null): void {
    if (this._input !== null) {
      this._input.unbindOutput(this);
    }
    this._input = input;
    if (this._input !== null) {
      this._input.bindOutput(this);
    }
  }

  unbindInput(): void {
    if (this._input !== null) {
      this._input.unbindOutput(this);
    }
    this._input = null;
  }

  disconnectInputs(): void {
    const input = this._input;
    if (input !== null) {
      input.unbindOutput(this);
      this._input = null;
      input.disconnectInputs();
    }
  }

  outputIterator(): Cursor<Inlet<V>> {
    return this._outputs !== null ? Cursor.array(this._outputs) : Cursor.empty();
  }

  bindOutput(output: Inlet<V>): void {
    const oldOutputs = this._outputs;
    const n = oldOutputs !== null ? oldOutputs.length : 0;
    const newOutputs = new Array<Inlet<V>>(n + 1);
    for (let i = 0; i < n; i += 1) {
      newOutputs[i] = oldOutputs![i];
    }
    newOutputs[n] = output;
    this._outputs = newOutputs;
  }

  unbindOutput(output: Inlet<V>): void {
    const oldOutputs = this._outputs;
    const n = oldOutputs !== null ? oldOutputs.length : 0;
    for (let i = 0; i < n; i += 1) {
      if (oldOutputs![i] === output) {
        if (n > 1) {
          const newOutputs = new Array<Inlet<V>>(n - 1);
          for (let j = 0; j < i; j += 1) {
            newOutputs[j] = oldOutputs![j];
          }
          for (let j = i; j < n - 1; j += 1) {
            newOutputs[j] = oldOutputs![j + 1];
          }
          this._outputs = newOutputs;
        } else {
          this._outputs = null;
        }
        break;
      }
    }
  }

  unbindOutputs(): void {
    const oldOutputs = this._outputs;
    if (oldOutputs !== null) {
      this._outputs = null;
      for (let i = 0, n = oldOutputs.length; i < n; i += 1) {
        oldOutputs[i].unbindInput();
      }
    }
  }

  disconnectOutputs(): void {
    const outputs = this._outputs;
    if (outputs !== null) {
      this._outputs = null;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        const output = outputs[i];
        output.unbindInput();
        output.disconnectOutputs();
      }
    }
  }

  decohereOutput(): void {
    this.decohere();
  }

  decohereInput(): void {
    this.decohere();
  }

  decohere(): void {
    if (this._version >= 0) {
      this.willDecohere();
      this._version = -1;
      this.onDecohere();
      const n = this._outputs !== null ? this._outputs.length : 0;
      for (let i = 0; i < n; i += 1) {
        this._outputs![i].decohereOutput();
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
    if (this._version < 0) {
      this.willRecohere(version);
      this._version = version;
      if (this._input !== null) {
        this._input.recohereInput(version);
      }
      this.onRecohere(version);
      const n = this._outputs !== null ? this._outputs.length : 0;
      for (let i = 0; i < n; i += 1) {
        this._outputs![i].recohereOutput(version);
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
    if (this._input !== null) {
      const value = this._input.get();
      if (value !== void 0) {
        this.set(value);
      }
    }
  }

  protected didRecohere(version: number): void {
    // hook
  }

  memoize(): Outlet<V> {
    return this;
  }

  map<V2>(func: MapValueFunction<V, V2>): Outlet<V2> {
    const combinator = new MapValueCombinator<V, V2>(func);
    combinator.bindInput(this);
    return combinator;
  }

  watch(func: WatchValueFunction<V>): this {
    const combinator = new WatchValueCombinator<V>(func);
    combinator.bindInput(this);
    return this;
  }
}
