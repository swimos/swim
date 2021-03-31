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

import {Arrays, Cursor, Map} from "@swim/util";
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

export abstract class AbstractRecordOutlet extends Record implements RecordOutlet {
  constructor() {
    super();
    Object.defineProperty(this, "effects", {
      value: new BTree(),
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "outlets", {
      value: new BTree(),
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "outputs", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "version", {
      value: -1,
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
  declare readonly effects: BTree<Value, KeyEffect>;

  /** @hidden */
  declare readonly outlets: BTree<Value, KeyOutlet<Value, Value>>;

  /** @hidden */
  declare readonly outputs: ReadonlyArray<Inlet<Record>>;

  /** @hidden */
  declare readonly version: number;

  get streamletScope(): StreamletScope<Value> | null {
    return null;
  }

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

  get(): Record;
  get(key: AnyValue): Value;
  get(key?: AnyValue): Record | Value {
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
      Object.defineProperty(this, "outlets", {
        value: oldOutlets.updated(key, outlet),
        enumerable: true,
        configurable: true,
      });
      this.decohereInputKey(key, KeyEffect.Update);
    }
    return outlet;
  }

  outputIterator(): Cursor<Inlet<Record>> {
    return Cursor.array(this.outputs);
  }

  bindOutput(output: Inlet<Record>): void {
    Object.defineProperty(this, "outputs", {
      value: Arrays.inserted(output, this.outputs),
      enumerable: true,
      configurable: true,
    });
  }

  unbindOutput(output: Inlet<Record>): void {
    Object.defineProperty(this, "outputs", {
      value: Arrays.removed(output, this.outputs),
      enumerable: true,
      configurable: true,
    });
  }

  unbindOutputs(): void {
    const oldOutlets = this.outlets;
    if (oldOutlets.isEmpty()) {
      Object.defineProperty(this, "outlets", {
        value: new BTree(),
        enumerable: true,
        configurable: true,
      });
      oldOutlets.forEach(function (key: Value, keyOutlet: KeyOutlet<Value, Value>) {
        keyOutlet.unbindOutputs();
      }, this);
    }
    const oldOutputs = this.outputs;
    Object.defineProperty(this, "outputs", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
    for (let i = 0, n = oldOutputs.length; i < n; i += 1) {
      const output = oldOutputs[i]!;
      output.unbindInput();
    }
  }

  disconnectOutputs(): void {
    const oldOutlets = this.outlets;
    if (oldOutlets.isEmpty()) {
      Object.defineProperty(this, "outlets", {
        value: new BTree(),
        enumerable: true,
        configurable: true,
      });
      oldOutlets.forEach(function (key: Value, keyOutlet: KeyOutlet<Value, Value>) {
        keyOutlet.disconnectOutputs();
      }, this);
    }
    const oldOutputs = this.outputs;
    Object.defineProperty(this, "outputs", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
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
      Object.defineProperty(this, "effects", {
        value: oldEffects.updated(key, effect),
        enumerable: true,
        configurable: true,
      });
      Object.defineProperty(this, "version", {
        value: -1,
        enumerable: true,
        configurable: true,
      });
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
      Object.defineProperty(this, "version", {
        value: -1,
        enumerable: true,
        configurable: true,
      });
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
        Object.defineProperty(this, "effects", {
          value: oldEffects.removed(key),
          enumerable: true,
          configurable: true,
        });
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
      Object.defineProperty(this, "version", {
        value: version,
        enumerable: true,
        configurable: true,
      });
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

  filter(predicate?: AnyItem): Selector;
  filter(func: FilterFieldsFunction<Value, Value>): MapOutlet<Value, Value, Map<Value, Value>>;
  filter(func: AnyItem | FilterFieldsFunction<Value, Value>): Selector | MapOutlet<Value, Value, Map<Value, Value>> {
    if (typeof func !== "function") {
      return super.filter(func as AnyItem);
    } else {
      const combinator = new FilterFieldsCombinator<Value, Value, Record>(func);
      combinator.bindInput(this);
      return combinator;
    }
  }
}
export interface AbstractRecordOutlet extends MapOutletCombinators<Value, Value, Record> {
}
MapOutletCombinators.define(AbstractRecordOutlet.prototype);
