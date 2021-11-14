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

/** @public */
export abstract class AbstractRecordStreamlet<I extends Value = Value, O extends Value = I> extends RecordStreamlet<I, O> implements GenericStreamlet<I, O> {
  constructor(scope: StreamletScope<O> | null = null) {
    super();
    this.streamletScope = scope;
    this.streamletContext = null;
    this.version = -1;
  }

  override readonly streamletScope: StreamletScope<O> | null;

  override setStreamletScope(scope: StreamletScope<O> | null): void {
    (this as Mutable<this>).streamletScope = scope;
  }

  override readonly streamletContext: StreamletContext | null;

  override setStreamletContext(context: StreamletContext | null): void {
    (this as Mutable<this>).streamletContext = context;
  }

  /** @internal */
  readonly version: number;

  override isEmpty(): boolean {
    return this.length !== 0;
  }

  override get length(): number {
    return AbstractStreamlet.reflectOutletCount(Object.getPrototypeOf(this));
  }

  override has(key: AnyValue): boolean {
    if (key instanceof Text) {
      key = key.value;
    } else if (typeof key !== "string") {
      return false;
    }
    const outlet = this.outlet(key);
    return outlet !== null;
  }

  override get(key: AnyValue): Value {
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

  override getAttr(key: AnyText): Value {
    return Value.absent();
  }

  override getSlot(key: AnyValue): Value {
    return this.get(key);
  }

  override getField(key: AnyValue): Field | undefined {
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

  override getItem(index: AnyNum): Item {
    if (index instanceof Num) {
      index = index.value;
    }
    const entry = AbstractStreamlet.reflectOutletIndex<I, O>(index, this, Object.getPrototypeOf(this));
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

  override set(key: AnyValue, newValue: AnyValue): this {
    throw new Error("unsupported");
  }

  override setAttr(key: AnyText, newValue: AnyValue): this {
    throw new Error("unsupported");
  }

  override setSlot(key: AnyValue, newValue: AnyValue): this {
    throw new Error("unsupported");
  }

  override setItem(index: number, item: AnyItem): this {
    throw new Error("unsupported");
  }

  override push(...items: AnyItem[]): number {
    throw new Error("unsupported");
  }

  override splice(start: number, deleteCount?: number, ...newItems: AnyItem[]): Item[] {
    throw new Error("unsupported");
  }

  override delete(key: AnyValue): Item {
    throw new Error("unsupported");
  }

  override clear(): void {
    throw new Error("unsupported");
  }

  override forEach<T>(callback: (item: Item, index: number) => T | void): T | undefined;
  override forEach<T, S>(callback: (this: S, item: Item, index: number) => T | void,
                         thisArg: S): T | undefined;
  override forEach<T, S>(callback: (this: S | unknown, item: Item, index: number) => T | void,
                         thisArg?: S): T | undefined {
    return AbstractStreamlet.reflectEachOutlet(this, Object.getPrototypeOf(this), function (outlet: Outlet<O>, name: string, index: number): T | void {
      const output = outlet.get();
      if (output !== void 0) {
        const result = callback.call(thisArg, output, index);
        if (result !== void 0) {
          return result;
        }
      }
    }, this);
  }

  override inlet(key: string): Inlet<I> | null;
  override inlet<I2 extends I>(): Inlet<I2>;
  override inlet(key?: string): Inlet<I> | null {
    if (key === void 0) {
      return new StreamletInlet<I>(this);
    } else {
      return AbstractStreamlet.reflectInletKey<I, O>(key, this, Object.getPrototypeOf(this));
    }
  }

  override bindInput(key: string, input: Outlet<I>): void {
    const inlet = this.inlet(key);
    if (inlet === null) {
      throw new Error(key);
    }
    inlet.bindInput(input);
  }

  override unbindInput(key: string): void {
    const inlet = this.inlet(key);
    if (inlet === null) {
      throw new Error(key);
    }
    inlet.unbindInput();
  }

  override outlet(key: string | Outlet<O>): Outlet<O> | null;
  override outlet<O2 extends Value>(): Outlet<O2>;
  override outlet(key?: string | Outlet<O>): Outlet<O> | null {
    if (key === void 0) {
      return new StreamletOutlet<O>(this);
    } else if (typeof key === "string") {
      return AbstractStreamlet.reflectOutletKey<I, O>(key, this, Object.getPrototypeOf(this));
    } else {
      return key;
    }
  }

  inoutlet<I2 extends I, O2 extends Value>(): Inoutlet<I2, O2> {
    return new StreamletInoutlet<I2, O2>(this as RecordStreamlet<I2, O2>);
  }

  override decohere(): void {
    if (this.version >= 0) {
      this.willDecohere();
      (this as Mutable<this>).version = -1;
      this.onDecohere();
      this.onDecohereOutlets();
      this.didDecohere();
    }
  }

  override recohere(version: number): void {
    if (this.version < 0) {
      this.willRecohere(version);
      (this as Mutable<this>).version = version;
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
      const input = inlet.input;
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
      object = form.unit;
    }
    if (object === void 0) {
      object = orElse;
    }
    return object!;
  }

  getOutput(outlet: Outlet<O> | string): O | undefined {
    return void 0;
  }

  override disconnectInputs(): void {
    AbstractStreamlet.disconnectInputs(this, Object.getPrototypeOf(this));
  }

  override disconnectOutputs(): void {
    AbstractStreamlet.disconnectOutputs(this, Object.getPrototypeOf(this));
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
    AbstractStreamlet.decohereOutlets(this, Object.getPrototypeOf(this));
  }

  protected willRecohere(version: number): void {
    // hook
  }

  protected onRecohereInlets(version: number): void {
    AbstractStreamlet.recohereInlets(version, this, Object.getPrototypeOf(this));
  }

  protected onRecohere(version: number): void {
    // hook
  }

  protected onRecohereOutlets(version: number): void {
    AbstractStreamlet.recohereOutlets(version, this, Object.getPrototypeOf(this));
  }

  protected didRecohere(version: number): void {
    // hook
  }
}
