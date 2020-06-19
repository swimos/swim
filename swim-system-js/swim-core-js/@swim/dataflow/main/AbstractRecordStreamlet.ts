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

import {AnyItem, Item, Field, Slot, AnyValue, Value, AnyText, Text, AnyNum, Num, Form} from "@swim/structure";
import {
  Inlet,
  Outlet,
  Inoutlet,
  StreamletContext,
  GenericStreamlet,
  AbstractStreamlet,
  StreamletScope,
  StreamletInlet,
  StreamletOutlet,
  StreamletInoutlet,
} from "@swim/streamlet";
import {RecordStreamlet} from "./RecordStreamlet";

export abstract class AbstractRecordStreamlet<I extends Value = Value, O extends Value = I> extends RecordStreamlet<I, O> implements GenericStreamlet<I, O> {
  protected scope: StreamletScope<O> | null;
  protected context: StreamletContext | null;
  /** @hidden */
  protected _version: number;

  constructor(scope: StreamletScope<O> | null = null) {
    super();
    this.scope = scope;
    this.context = null;
    this._version = -1;
  }

  streamletScope(): StreamletScope<O> | null {
    return this.scope;
  }

  setStreamletScope(scope: StreamletScope<O> | null): void {
    this.scope = scope;
  }

  streamletContext(): StreamletContext | null {
    if (this.context !== null) {
      return this.context;
    }
    const scope = this.streamletScope();
    if (scope !== null) {
      return scope.streamletContext();
    }
    return null;
  }

  setStreamletContext(context: StreamletContext | null): void {
    this.context = context;
  }

  isEmpty(): boolean {
    return this.length !== 0;
  }

  get length(): number {
    return AbstractStreamlet.reflectOutletCount(this.streamletClass());
  }

  has(key: AnyValue): boolean {
    if (key instanceof Text) {
      key = key.value;
    } else if (typeof key !== "string") {
      return false;
    }
    const outlet = this.outlet(key);
    return outlet !== null;
  }

  get(key: AnyValue): Value {
    if (key instanceof Text) {
      key = key.value;
    } else if (typeof key !== "string") {
      return Value.absent();
    }
    const outlet = this.outlet(key);
    if (outlet !== null) {
      const output = outlet.get();
      if (output !== void 0) {
        return output;
      }
    }
    return Value.absent();
  }

  getAttr(key: AnyText): Value {
    return Value.absent();
  }

  getSlot(key: AnyValue): Value {
    return this.get(key);
  }

  getField(key: AnyValue): Field | undefined {
    if (typeof key === "string") {
      key = Text.from(key);
    } else if (!(key instanceof Text)) {
      return void 0;
    }
    const value = this.get(key);
    if (value.isDefined()) {
      return Slot.of(key, value);
    }
    return void 0;
  }

  getItem(index: AnyNum): Item {
    if (index instanceof Num) {
      index = index.value;
    }
    const entry = AbstractStreamlet.reflectOutletIndex<I, O>(index, this, this.streamletClass());
    if (entry !== null) {
      const name = entry[0];
      let output = entry[1].get() as Value | undefined;
      if (output === void 0) {
        output = Value.extant();
      }
      return Slot.of(name, output);
    }
    return Item.absent();
  }

  set(key: AnyValue, newValue: AnyValue): this {
    throw new Error("unsupported");
  }

  setAttr(key: AnyText, newValue: AnyValue): this {
    throw new Error("unsupported");
  }

  setSlot(key: AnyValue, newValue: AnyValue): this {
    throw new Error("unsupported");
  }

  setItem(index: number, item: AnyItem): this {
    throw new Error("unsupported");
  }

  push(...items: AnyItem[]): number {
    throw new Error("unsupported");
  }

  splice(start: number, deleteCount?: number, ...newItems: AnyItem[]): Item[] {
    throw new Error("unsupported");
  }

  delete(key: AnyValue): Item {
    throw new Error("unsupported");
  }

  clear(): void {
    throw new Error("unsupported");
  }

  forEach<T, S = unknown>(callback: (this: S, item: Item, index: number) => T | void,
                          thisArg?: S): T | undefined {
    return AbstractStreamlet.reflectEachOutlet(this, this.streamletClass(), function (outlet: Outlet<O>, name: string, index: number): T | void {
      const output = outlet.get();
      if (output !== void 0) {
        const result = callback.call(thisArg, output, index);
        if (result !== void 0) {
          return result;
        }
      }
    }, this);
  }

  inlet(key: string): Inlet<I> | null;
  inlet<I2 extends I>(): Inlet<I2>;
  inlet(key?: string): Inlet<I> | null {
    if (key === void 0) {
      return new StreamletInlet<I>(this);
    } else {
      return AbstractStreamlet.reflectInletKey<I, O>(key, this, this.streamletClass());
    }
  }

  bindInput(key: string, input: Outlet<I>): void {
    const inlet = this.inlet(key);
    if (inlet === null) {
      throw new Error("" + key);
    }
    inlet.bindInput(input);
  }

  unbindInput(key: string): void {
    const inlet = this.inlet(key);
    if (inlet === null) {
      throw new Error("" + key);
    }
    inlet.unbindInput();
  }

  outlet(key: string | Outlet<O>): Outlet<O> | null;
  outlet<O2 extends Value>(): Outlet<O2>;
  outlet(key?: string | Outlet<O>): Outlet<O> | null {
    if (key === void 0) {
      return new StreamletOutlet<O>(this);
    } else if (typeof key === "string") {
      return AbstractStreamlet.reflectOutletKey<I, O>(key, this, this.streamletClass());
    } else {
      return key;
    }
  }

  inoutlet<I2 extends I, O2 extends Value>(): Inoutlet<I2, O2> {
    return new StreamletInoutlet<I2, O2>(this as RecordStreamlet<I2, O2>);
  }

  decohere(): void {
    if (this._version >= 0) {
      this.willDecohere();
      this._version = -1;
      this.onDecohere();
      this.onDecohereOutlets();
      this.didDecohere();
    }
  }

  recohere(version: number): void {
    if (this._version < 0) {
      this.willRecohere(version);
      this._version = version;
      this.onRecohereInlets(version);
      this.onRecohere(version);
      this.onRecohereOutlets(version);
      this.didRecohere(version);
    }
  }

  getInput<I2 extends I>(inlet: Inlet<I2> | string): I2 | undefined;
  getInput<I2 extends I, E = I2>(inlet: Inlet<I2> | string, orElse: E): I2 | E;
  getInput<I2 extends I, E = I2>(inlet: Inlet<I2> | string, orElse?: E): I2 | E | undefined {
    if (typeof inlet === "string") {
      inlet = this.inlet(inlet) as Inlet<I2>;
    }
    let object: I2 | E | undefined;
    if (inlet !== null) {
      const input = inlet.input();
      if (input !== null) {
        object = input.get();
      }
    }
    if (object === void 0) {
      object = orElse;
    }
    return object;
  }

  castInput<T>(inlet: Inlet<I> | string, form: Form<T, unknown>): T | undefined;
  castInput<T, E = T>(inlet: Inlet<I> | string, form: Form<T, unknown>, orElse: E): T | E;
  castInput<T, E = T>(inlet: Inlet<I> | string, form: Form<T, unknown>, orElse?: E): T | E | undefined {
    const input = this.getInput(inlet);
    let object: T | E | undefined;
    if (input !== void 0) {
      object = form.cast(input);
    }
    if (object === void 0) {
      object = orElse;
    }
    return object;
  }

  coerceInput<T>(inlet: Inlet<I> | string, form: Form<T, unknown>): T;
  coerceInput<T, E = T>(inlet: Inlet<I> | string, form: Form<T, unknown>, orElse: E): T | E;
  coerceInput<T, E = T>(inlet: Inlet<I> | string, form: Form<T, unknown>, orElse?: E): T | E {
    const input = this.getInput(inlet);
    let object: T | E | undefined;
    if (input !== void 0) {
      object = form.cast(input);
    }
    if (object === void 0) {
      object = form.unit();
    }
    if (object === void 0) {
      object = orElse;
    }
    return object!;
  }

  getOutput(outlet: Outlet<O> | string): O | undefined {
    return void 0;
  }

  disconnectInputs(): void {
    AbstractStreamlet.disconnectInputs(this, this.streamletClass());
  }

  disconnectOutputs(): void {
    AbstractStreamlet.disconnectOutputs(this, this.streamletClass());
  }

  willDecohereInlet(inlet: Inlet<I>): void {
    // hook
  }

  didDecohereInlet(inlet: Inlet<I>): void {
    this.decohere();
  }

  willRecohereInlet(inlet: Inlet<I>, version: number): void {
    // hook
  }

  didRecohereInlet(inlet: Inlet<I>, version: number): void {
    this.recohere(version);
  }

  willDecohereOutlet(outlet: Outlet<O>): void {
    // hook
  }

  didDecohereOutlet(outlet: Outlet<O>): void {
    // hook
  }

  willRecohereOutlet(outlet: Outlet<O>, version: number): void {
    // hook
  }

  didRecohereOutlet(outlet: Outlet<O>, version: number): void {
    // hook
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

  protected onDecohereOutlets(): void {
    AbstractStreamlet.decohereOutlets(this, this.streamletClass());
  }

  protected willRecohere(version: number): void {
    // hook
  }

  protected onRecohereInlets(version: number): void {
    AbstractStreamlet.recohereInlets(version, this, this.streamletClass());
  }

  protected onRecohere(version: number): void {
    // hook
  }

  protected onRecohereOutlets(version: number): void {
    AbstractStreamlet.recohereOutlets(version, this, this.streamletClass());
  }

  protected didRecohere(version: number): void {
    // hook
  }
}
