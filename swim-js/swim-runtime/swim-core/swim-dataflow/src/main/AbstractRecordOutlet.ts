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

import {Mutable, Arrays, Cursor, Map} from "@swim/util";
import {BTree} from "@swim/collections";
import {AnyItem, Item, Field, AnyValue, Value, Record, Text, Selector} from "@swim/structure";
import {
  Inlet,
  Outlet,
  KeyEffect,
  MapInlet,
  MapOutlet,
  MapOutletCombinators,
  KeyOutlet,
  StreamletContext,
  StreamletScope,
  FilterFieldsFunction,
  FilterFieldsCombinator,
} from "@swim/streamlet";
import {RecordOutlet} from "./RecordOutlet";
import {RecordStreamlet} from "./"; // forward import

/** @public */
export abstract class AbstractRecordOutlet extends Record implements RecordOutlet {
  constructor() {
    super();
    this.effects = new BTree();
    this.outlets = new BTree();
    this.outputs = Arrays.empty;
    this.version = -1;
  }

  /** @internal */
  readonly effects: BTree<Value, KeyEffect>;

  /** @internal */
  readonly outlets: BTree<Value, KeyOutlet<Value, Value>>;

  /** @internal */
  readonly outputs: ReadonlyArray<Inlet<Record>>;

  /** @internal */
  readonly version: number;

  declare readonly streamletScope: StreamletScope<Value> | null; // getter defined below to work around useDefineForClassFields lunacy

  get streamletContext(): StreamletContext | null {
    const scope = this.streamletScope;
    if (scope !== null) {
      return scope.streamletContext;
    }
    return null;
  }

  hasOwn(key: AnyValue): boolean {
    return this.has(key);
  }

  override get(): Record;
  override get(key: AnyValue): Value;
  override get(key?: AnyValue): Record | Value {
    if (key === void 0) {
      return this;
    } else {
      return super.get(key);
    }
  }

  abstract keyIterator(): Cursor<Value>;

  outlet(key: Value | string): Outlet<Value> {
    if (typeof key === "string") {
      key = Text.from(key);
    }
    if (!this.hasOwn(key)) {
      const scope = this.streamletScope;
      if (RecordOutlet.is(scope) && scope.has(key)) {
        // TODO: Support dynamic shadowing?
        return scope.outlet(key);
      }
    }
    const oldOutlets = this.outlets;
    let outlet = oldOutlets.get(key);
    if (outlet === void 0) {
      outlet = new KeyOutlet<Value, Value>(this, key);
      (this as Mutable<this>).outlets = oldOutlets.updated(key, outlet);
      this.decohereInputKey(key, KeyEffect.Update);
    }
    return outlet;
  }

  outputIterator(): Cursor<Inlet<Record>> {
    return Cursor.array(this.outputs);
  }

  bindOutput(output: Inlet<Record>): void {
    (this as Mutable<this>).outputs = Arrays.inserted(output, this.outputs);
  }

  unbindOutput(output: Inlet<Record>): void {
    (this as Mutable<this>).outputs = Arrays.removed(output, this.outputs);
  }

  unbindOutputs(): void {
    const oldOutlets = this.outlets;
    if (oldOutlets.isEmpty()) {
      (this as Mutable<this>).outlets = new BTree();
      oldOutlets.forEach(function (key: Value, keyOutlet: KeyOutlet<Value, Value>) {
        keyOutlet.unbindOutputs();
      }, this);
    }
    const oldOutputs = this.outputs;
    (this as Mutable<this>).outputs = Arrays.empty;
    for (let i = 0, n = oldOutputs.length; i < n; i += 1) {
      const output = oldOutputs[i]!;
      output.unbindInput();
    }
  }

  disconnectOutputs(): void {
    const oldOutlets = this.outlets;
    if (oldOutlets.isEmpty()) {
      (this as Mutable<this>).outlets = new BTree();
      oldOutlets.forEach(function (key: Value, keyOutlet: KeyOutlet<Value, Value>) {
        keyOutlet.disconnectOutputs();
      }, this);
    }
    const oldOutputs = this.outputs;
    (this as Mutable<this>).outputs = Arrays.empty;
    for (let i = 0, n = oldOutputs.length; i < n; i += 1) {
      const output = oldOutputs[i]!;
      output.unbindInput();
      output.disconnectOutputs();
    }
    this.forEach(function (member: Item): void {
      if (member instanceof Field) {
        member = member.toValue();
      }
      if (member instanceof AbstractRecordOutlet) {
        member.disconnectOutputs();
      } else if (member instanceof RecordStreamlet) {
        member.disconnectOutputs();
      } else if (RecordOutlet.is(member)) {
        member.disconnectOutputs();
      }
    }, this);
  }

  disconnectInputs(): void {
    // nop
  }

  decohereInputKey(key: Value, effect: KeyEffect): void {
    const oldEffects = this.effects;
    if (oldEffects.get(key) !== effect) {
      this.willDecohereInputKey(key, effect);
      (this as Mutable<this>).effects = oldEffects.updated(key, effect);
      (this as Mutable<this>).version = -1;
      this.onDecohereInputKey(key, effect);
      const outputs = this.outputs;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        const output = outputs[i]!;
        if (MapInlet.is(output)) {
          output.decohereOutputKey(key, effect);
        } else {
          output.decohereOutput();
        }
      }
      const outlet = this.outlets.get(key);
      if (outlet !== void 0) {
        outlet.decohereInput();
      }
      this.didDecohereInputKey(key, effect);
    }
  }

  decohereInput(): void {
    if (this.version >= 0) {
      this.willDecohereInput();
      (this as Mutable<this>).version = -1;
      this.onDecohereInput();
      const outputs = this.outputs;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        const output = outputs[i]!;
        output.decohereOutput();
      }
      this.outlets.forEach(function (key: Value, outlet: KeyOutlet<Value, Value>): void {
        outlet.decohereInput();
      }, this);
      this.didDecohereInput();
    }
  }

  recohereInputKey(key: Value, version: number): void {
    if (this.version < 0) {
      const oldEffects = this.effects;
      const effect = oldEffects.get(key);
      if (effect !== void 0) {
        this.willRecohereInputKey(key, effect, version);
        (this as Mutable<this>).effects = oldEffects.removed(key);
        this.onRecohereInputKey(key, effect, version);
        const outputs = this.outputs;
        for (let i = 0, n = outputs.length; i < n; i += 1) {
          const output = outputs[i];
          if (MapInlet.is(output)) {
            output.recohereOutputKey(key, version);
          }
        }
        const outlet = this.outlets.get(key);
        if (outlet !== void 0) {
          outlet.recohereInput(version);
        }
        this.didRecohereInputKey(key, effect, version);
      }
    }
  }

  recohereInput(version: number): void {
    if (this.version < 0) {
      this.willRecohereInput(version);
      this.effects.forEach(function (key: Value): void {
        this.recohereInputKey(key, version);
      }, this);
      (this as Mutable<this>).version = version;
      this.onRecohereInput(version);
      const outputs = this.outputs;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        const output = outputs[i]!;
        output.recohereOutput(version);
      }
      this.forEach(function (member: Item): void {
        if (member instanceof Field) {
          member = member.toValue();
        }
        if (member instanceof AbstractRecordOutlet) {
          member.recohereInput(version);
        } else if (member instanceof RecordStreamlet) {
          member.recohere(version);
        } else if (RecordOutlet.is(member)) {
          member.recohereInput(version);
        }
      }, this);
      this.didRecohereInput(version);
    }
  }

  protected willDecohereInputKey(key: Value, effect: KeyEffect): void {
    // hook
  }

  protected onDecohereInputKey(key: Value, effect: KeyEffect): void {
    // hook
  }

  protected didDecohereInputKey(key: Value, effect: KeyEffect): void {
    // hook
  }

  protected willDecohereInput(): void {
    // hook
  }

  protected onDecohereInput(): void {
    // hook
  }

  protected didDecohereInput(): void {
    // hook
  }

  protected willRecohereInputKey(key: Value, effect: KeyEffect, version: number): void {
    // hook
  }

  protected onRecohereInputKey(key: Value, effect: KeyEffect, version: number): void {
    // hook
  }

  protected didRecohereInputKey(key: Value, effect: KeyEffect, version: number): void {
    // hook
  }

  protected willRecohereInput(version: number): void {
    // hook
  }

  protected onRecohereInput(version: number): void {
    // hook
  }

  protected didRecohereInput(version: number): void {
    // hook
  }

  override filter(predicate?: AnyItem): Selector;
  override filter(func: FilterFieldsFunction<Value, Value>): MapOutlet<Value, Value, Map<Value, Value>>;
  override filter(func: AnyItem | FilterFieldsFunction<Value, Value>): Selector | MapOutlet<Value, Value, Map<Value, Value>> {
    if (typeof func !== "function") {
      return super.filter(func as AnyItem);
    } else {
      const combinator = new FilterFieldsCombinator<Value, Value, Record>(func);
      combinator.bindInput(this);
      return combinator;
    }
  }
}
Object.defineProperty(AbstractRecordOutlet.prototype, "streamletScope", {
  get(this: AbstractRecordOutlet): StreamletScope<Value> | null {
    return null;
  },
  configurable: true,
});
/** @public */
export interface AbstractRecordOutlet extends MapOutletCombinators<Value, Value, Record> {
}
MapOutletCombinators.define(AbstractRecordOutlet.prototype);
