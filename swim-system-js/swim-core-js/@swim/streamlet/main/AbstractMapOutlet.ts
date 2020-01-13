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

import {Iterator, Cursor, Map} from "@swim/util";
import {BTree} from "@swim/collections";
import {Inlet} from "./Inlet";
import {Outlet} from "./Outlet";
import {KeyEffect} from "./KeyEffect";
import {MapInlet} from "./MapInlet";
import {MapOutlet} from "./MapOutlet";
import {KeyOutlet} from "./KeyOutlet";
import {FilterFieldsFunction} from "./function";
import {MapValueFunction, MapFieldValuesFunction} from "./function";
import {WatchValueFunction, WatchFieldsFunction} from "./function";

export abstract class AbstractMapOutlet<K, V, O> implements MapOutlet<K, V, O> {
  /** @hidden */
  protected _effects: BTree<K, KeyEffect>;
  /** @hidden */
  protected _outlets: BTree<K, KeyOutlet<K, V>>;
  /** @hidden */
  protected _outputs: ReadonlyArray<Inlet<O>> | null;
  /** @hidden */
  protected _version: number;

  constructor() {
    this._effects = new BTree();
    this._outlets = new BTree();
    this._outputs = null;
    this._version = -1;
  }

  abstract has(key: K): boolean;

  abstract get(): O | undefined;

  abstract get(key: K): V | undefined;

  abstract keyIterator(): Iterator<K>;

  outlet(key: K): Outlet<V> {
    let outlet = this._outlets.get(key);
    if (outlet === void 0) {
      outlet = new KeyOutlet<K, V>(this, key);
      this._outlets = this._outlets.updated(key, outlet);
    }
    return outlet;
  }

  outputIterator(): Iterator<Inlet<O>> {
    return this._outputs !== null ? Cursor.array(this._outputs) : Cursor.empty();
  }

  bindOutput(output: Inlet<O>): void {
    const oldOutputs = this._outputs;
    const n = oldOutputs !== null ? oldOutputs.length : 0;
    const newOutputs = new Array<Inlet<O>>(n + 1);
    for (let i = 0; i < n; i += 1) {
      newOutputs[i] = oldOutputs![i];
    }
    newOutputs[n] = output;
    this._outputs = newOutputs;
  }

  unbindOutput(output: Inlet<O>): void {
    const oldOutputs = this._outputs;
    const n = oldOutputs !== null ? oldOutputs.length : 0;
    for (let i = 0; i < n; i += 1) {
      if (oldOutputs![i] === output) {
        if (n > 1) {
          const newOutputs = new Array<Inlet<O>>(n - 1);
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
      outlets.forEach(function (key: K, keyOutlet: KeyOutlet<K, V>) {
        keyOutlet.unbindOutputs();
      }, this);
    }
    const outputs = this._outputs;
    if (outputs !== null) {
      this._outputs = null;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        const output = outputs[i];
        output.unbindInput();
      }
    }
  }

  disconnectOutputs(): void {
    const outlets = this._outlets;
    if (outlets.isEmpty()) {
      this._outlets = new BTree();
      outlets.forEach(function (key: K, keyOutlet: KeyOutlet<K, V>) {
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
  }

  disconnectInputs(): void {
    // nop
  }

  invalidateInputKey(key: K, effect: KeyEffect): void {
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
      this._outlets.forEach(function (key: K, outlet: KeyOutlet<K, V>): void {
        outlet.invalidateInput();
      }, this);
      this.didInvalidateInput();
    }
  }

  reconcileInputKey(key: K, version: number): void {
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
      this._effects.forEach(function (key: K): void {
        this.reconcileInputKey(key, version);
      }, this);
      this._version = version;
      this.onReconcileInput(version);
      for (let i = 0, n = this._outputs !== null ? this._outputs.length : 0; i < n; i += 1) {
        this._outputs![i].reconcileOutput(version);
      }
      this.didReconcileInput(version);
    }
  }

  protected willInvalidateInputKey(key: K, effect: KeyEffect): void {
    // stub
  }

  protected onInvalidateInputKey(key: K, effect: KeyEffect): void {
    // stub
  }

  protected didInvalidateInputKey(key: K, effect: KeyEffect): void {
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

  protected willReconcileInputKey(key: K, effect: KeyEffect, version: number): void {
    // stub
  }

  protected onReconcileInputKey(key: K, effect: KeyEffect, version: number): void {
    // stub
  }

  protected didReconcileInputKey(key: K, effect: KeyEffect, version: number): void {
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

  memoize(): MapOutlet<K, V, O> {
    const combinator = new MapOutlet.MemoizeMapCombinator<K, V, O>();
    combinator.bindInput(this);
    return combinator;
  }

  filter(func: FilterFieldsFunction<K, V>): MapOutlet<K, V, Map<K, V>> {
    const combinator = new MapOutlet.FilterFieldsCombinator<K, V, O>(func);
    combinator.bindInput(this);
    return combinator;
  }

  map<O2>(func: MapValueFunction<O, O2>): Outlet<O2>;
  map<V2>(func: MapFieldValuesFunction<K, V, V2>): MapOutlet<K, V2, Map<K, V2>>;
  map<V2>(func: MapValueFunction<O, V2> | MapFieldValuesFunction<K, V, V2>): Outlet<V2> | MapOutlet<K, V2, Map<K, V2>> {
    if (func.length === 1) {
      const combinator = new Outlet.MapValueCombinator<O, V2>(func as MapValueFunction<O, V2>);
      combinator.bindInput(this);
      return combinator;
    } else {
      const combinator = new MapOutlet.MapFieldValuesCombinator<K, V, V2, O>(func as MapFieldValuesFunction<K, V, V2>);
      combinator.bindInput(this);
      return combinator;
    }
  }

  reduce<U>(identity: U, accumulator: (result: U, element: V) => U, combiner: (result: U, result2: U) => U): Outlet<U> {
    const combinator = new MapOutlet.ReduceFieldsCombinator<K, V, O, U>(identity, accumulator, combiner);
    combinator.bindInput(this);
    return combinator;
  }

  watch(func: WatchValueFunction<O>): this;
  watch(func: WatchFieldsFunction<K, V>): this;
  watch(func: WatchValueFunction<O> | WatchFieldsFunction<K, V>): this {
    if (func.length === 1) {
      const combinator = new Outlet.WatchValueCombinator<O>(func as WatchValueFunction<O>);
      combinator.bindInput(this);
      return this;
    } else {
      const combinator = new MapOutlet.WatchFieldsCombinator<K, V, O>(func as WatchFieldsFunction<K, V>);
      combinator.bindInput(this);
      return this;
    }
  }
}
