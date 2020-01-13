// Copyright 2015-2020 SWIM.AI inc.
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

import {Cursor, Map} from "@swim/util";
import {BTree} from "@swim/collections";
import {AnyItem, Item, Field, AnyValue, Value, Record, Text, Selector} from "@swim/structure";
import {Inlet, Outlet, KeyEffect, MapInlet, MapOutlet, KeyOutlet, StreamletContext, StreamletScope} from "@swim/streamlet";
import {MemoizeMapCombinator} from "@swim/streamlet";
import {FilterFieldsFunction, FilterFieldsCombinator} from "@swim/streamlet";
import {MapValueFunction, MapValueCombinator} from "@swim/streamlet";
import {MapFieldValuesFunction, MapFieldValuesCombinator} from "@swim/streamlet";
import {ReduceFieldsCombinator} from "@swim/streamlet";
import {WatchValueFunction, WatchValueCombinator} from "@swim/streamlet";
import {WatchFieldsFunction, WatchFieldsCombinator} from "@swim/streamlet";
import {RecordOutlet} from "./RecordOutlet";

export abstract class AbstractRecordOutlet extends Record implements RecordOutlet {
  /** @hidden */
  protected _effects: BTree<Value, KeyEffect>;
  /** @hidden */
  protected _outlets: BTree<Value, KeyOutlet<Value, Value>>;
  /** @hidden */
  protected _outputs: ReadonlyArray<Inlet<Record>> | null;
  /** @hidden */
  protected _version: number;

  constructor() {
    super();
    this._effects = new BTree();
    this._outlets = new BTree();
    this._outputs = null;
    this._version = -1;
  }

  streamletScope(): StreamletScope<Value> | null {
    return null;
  }

  streamletContext(): StreamletContext | null {
    const scope = this.streamletScope();
    if (scope !== null) {
      return scope.streamletContext();
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
      const scope = this.streamletScope();
      if (RecordOutlet.is(scope) && scope.has(key)) {
        // TODO: Support dynamic shadowing?
        return scope.outlet(key);
      }
    }
    let outlet = this._outlets.get(key);
    if (outlet === void 0) {
      outlet = new KeyOutlet<Value, Value>(this, key);
      this._outlets = this._outlets.updated(key, outlet);
      this.invalidateInputKey(key, KeyEffect.Update);
    }
    return outlet;
  }

  outputIterator(): Cursor<Inlet<Record>> {
    return this._outputs !== null ? Cursor.array(this._outputs) : Cursor.empty();
  }

  bindOutput(output: Inlet<Record>): void {
    const oldOutputs = this._outputs;
    const n = oldOutputs !== null ? oldOutputs.length : 0;
    const newOutputs = new Array<Inlet<Record>>(n + 1);
    for (let i = 0; i < n; i += 1) {
      newOutputs[i] = oldOutputs![i];
    }
    newOutputs[n] = output;
    this._outputs = newOutputs;
  }

  unbindOutput(output: Inlet<Record>): void {
    const oldOutputs = this._outputs;
    const n = oldOutputs !== null ? oldOutputs.length : 0;
    for (let i = 0; i < n; i += 1) {
      if (oldOutputs![i] === output) {
        if (n > 1) {
          const newOutputs = new Array<Inlet<Record>>(n - 1);
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
    const outlets = this._outlets;
    if (outlets.isEmpty()) {
      this._outlets = new BTree();
      outlets.forEach(function (key: Value, keyOutlet: KeyOutlet<Value, Value>) {
        keyOutlet.unbindOutputs();
      }, this);
    }
    const oldOutputs = this._outputs;
    if (oldOutputs !== null) {
      this._outputs = null;
      for (let i = 0, n = oldOutputs.length; i < n; i += 1) {
        oldOutputs[i].unbindInput();
      }
    }
  }

  disconnectOutputs(): void {
    const outlets = this._outlets;
    if (outlets.isEmpty()) {
      this._outlets = new BTree();
      outlets.forEach(function (key: Value, keyOutlet: KeyOutlet<Value, Value>) {
        keyOutlet.disconnectOutputs();
      }, this);
    }
    const outputs = this._outputs;
    if (outputs !== null) {
      this._outputs = null;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        const output = outputs[i];
        output.unbindInput();
        output.disconnectOutputs();
      }
    }
    this.forEach(function (member: Item): void {
      if (member instanceof Field) {
        member = member.toValue();
      }
      if (member instanceof AbstractRecordOutlet) {
        member.disconnectOutputs();
      } else if (member instanceof RecordOutlet.Streamlet) {
        member.disconnectOutputs();
      } else if (RecordOutlet.is(member)) {
        member.disconnectOutputs();
      }
    }, this);
  }

  disconnectInputs(): void {
    // nop
  }

  invalidateInputKey(key: Value, effect: KeyEffect): void {
    const oldEffects = this._effects;
    if (oldEffects.get(key) !== effect) {
      this.willInvalidateInputKey(key, effect);
      this._effects = oldEffects.updated(key, effect);
      this._version = -1;
      this.onInvalidateInputKey(key, effect);
      const n = this._outputs !== null ? this._outputs.length : 0;
      for (let i = 0; i < n; i += 1) {
        const output = this._outputs![i];
        if (MapInlet.is(output)) {
          output.invalidateOutputKey(key, effect);
        } else {
          output.invalidateOutput();
        }
      }
      const outlet = this._outlets.get(key);
      if (outlet !== void 0) {
        outlet.invalidateInput();
      }
      this.didInvalidateInputKey(key, effect);
    }
  }

  invalidateInput(): void {
    if (this._version >= 0) {
      this.willInvalidateInput();
      this._version = -1;
      this.onInvalidateInput();
      const n = this._outputs !== null ? this._outputs.length : 0;
      for (let i = 0; i < n; i += 1) {
        this._outputs![i].invalidateOutput();
      }
      this._outlets.forEach(function (key: Value, outlet: KeyOutlet<Value, Value>): void {
        outlet.invalidateInput();
      }, this);
      this.didInvalidateInput();
    }
  }

  reconcileInputKey(key: Value, version: number): void {
    if (this._version < 0) {
      const oldEffects = this._effects;
      const effect = oldEffects.get(key);
      if (effect !== void 0) {
        this.willReconcileInputKey(key, effect, version);
        this._effects = oldEffects.removed(key);
        this.onReconcileInputKey(key, effect, version);
        for (let i = 0, n = this._outputs !== null ? this._outputs.length : 0; i < n; i += 1) {
          const output = this._outputs![i];
          if (MapInlet.is(output)) {
            output.reconcileOutputKey(key, version);
          }
        }
        const outlet = this._outlets.get(key);
        if (outlet !== void 0) {
          outlet.reconcileInput(version);
        }
        this.didReconcileInputKey(key, effect, version);
      }
    }
  }

  reconcileInput(version: number): void {
    if (this._version < 0) {
      this.willReconcileInput(version);
      this._effects.forEach(function (key: Value): void {
        this.reconcileInputKey(key, version);
      }, this);
      this._version = version;
      this.onReconcileInput(version);
      for (let i = 0, n = this._outputs !== null ? this._outputs.length : 0; i < n; i += 1) {
        this._outputs![i].reconcileOutput(version);
      }
      this.forEach(function (member: Item): void {
        if (member instanceof Field) {
          member = member.toValue();
        }
        if (member instanceof AbstractRecordOutlet) {
          member.reconcileInput(version);
        } else if (member instanceof RecordOutlet.Streamlet) {
          member.reconcile(version);
        } else if (RecordOutlet.is(member)) {
          member.reconcileInput(version);
        }
      }, this);
      this.didReconcileInput(version);
    }
  }

  protected willInvalidateInputKey(key: Value, effect: KeyEffect): void {
    // stub
  }

  protected onInvalidateInputKey(key: Value, effect: KeyEffect): void {
    // stub
  }

  protected didInvalidateInputKey(key: Value, effect: KeyEffect): void {
    // stub
  }

  protected willInvalidateInput(): void {
    // stub
  }

  protected onInvalidateInput(): void {
    // stub
  }

  protected didInvalidateInput(): void {
    // stub
  }

  protected willReconcileInputKey(key: Value, effect: KeyEffect, version: number): void {
    // stub
  }

  protected onReconcileInputKey(key: Value, effect: KeyEffect, version: number): void {
    // stub
  }

  protected didReconcileInputKey(key: Value, effect: KeyEffect, version: number): void {
    // stub
  }

  protected willReconcileInput(version: number): void {
    // stub
  }

  protected onReconcileInput(version: number): void {
    // stub
  }

  protected didReconcileInput(version: number): void {
    // stub
  }

  memoize(): MapOutlet<Value, Value, Record> {
    const combinator = new MemoizeMapCombinator<Value, Value, Record>();
    combinator.bindInput(this);
    return combinator;
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

  map<O2>(func: MapValueFunction<Record, O2>): Outlet<O2>;
  map<V2>(func: MapFieldValuesFunction<Value, Value, V2>): MapOutlet<Value, V2, Map<Value, V2>>;
  map<V2>(func: MapValueFunction<Record, V2> | MapFieldValuesFunction<Value, Value, V2>): Outlet<V2> | MapOutlet<Value, V2, Map<Value, V2>> {
    if (func.length === 1) {
      const combinator = new MapValueCombinator<Record, V2>(func as MapValueFunction<Record, V2>);
      combinator.bindInput(this);
      return combinator;
    } else {
      const combinator = new MapFieldValuesCombinator<Value, Value, V2, Record>(func as MapFieldValuesFunction<Value, Value, V2>);
      combinator.bindInput(this);
      return combinator;
    }
  }

  reduce<U>(identity: U, accumulator: (result: U, element: Value) => U, combiner: (result: U, result2: U) => U): Outlet<U> {
    const combinator = new ReduceFieldsCombinator<Value, Value, Record, U>(identity, accumulator, combiner);
    combinator.bindInput(this);
    return combinator;
  }

  watch(func: WatchValueFunction<Record>): this;
  watch(func: WatchFieldsFunction<Value, Value>): this;
  watch(func: WatchValueFunction<Record> | WatchFieldsFunction<Value, Value>): this {
    if (func.length === 1) {
      const combinator = new WatchValueCombinator<Record>(func as WatchValueFunction<Record>);
      combinator.bindInput(this);
      return this;
    } else {
      const combinator = new WatchFieldsCombinator<Value, Value, Record>(func as WatchFieldsFunction<Value, Value>);
      combinator.bindInput(this);
      return this;
    }
  }
}
