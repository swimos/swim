// Copyright 2015-2019 SWIM.AI inc.
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
import {MapInletMapOutlet} from "./MapInletMapOutlet";
import {MapValueFunction, MapFieldValuesFunction} from "./function";
import {WatchValueFunction, WatchFieldsFunction} from "./function";

export abstract class AbstractMapInletMapOutlet<KI, KO, VI, VO, I, O> implements MapInletMapOutlet<KI, KO, VI, VO, I, O> {
  /** @hidden */
  protected _input: MapOutlet<KI, VI, I> | null;
  /** @hidden */
  protected _outputEffects: BTree<KI, KeyEffect>;
  /** @hidden */
  protected _inputEffects: BTree<KO, KeyEffect>;
  /** @hidden */
  protected _outlets: BTree<KO, KeyOutlet<KO, VO>>;
  /** @hidden */
  protected _outputs: ReadonlyArray<Inlet<O>> | null;
  /** @hidden */
  protected _version: number;

  constructor() {
    this._input = null;
    this._outputEffects = new BTree();
    this._inputEffects = new BTree();
    this._outlets = new BTree();
    this._outputs = null;
    this._version = -1;
  }

  abstract has(key: KO): boolean;

  abstract get(): O;

  abstract get(key: KO): VO | undefined;

  abstract keyIterator(): Iterator<KO>;

  input(): MapOutlet<KI, VI, I> | null {
    return this._input;
  }

  bindInput(input: MapOutlet<KI, VI, I>): void {
    if (!MapOutlet.is(input)) {
      throw new TypeError("" + input);
    }
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
    if (this._outputs === null && this._outlets.isEmpty()) {
      const input = this._input;
      if (input !== null) {
        input.unbindOutput(this);
        this._input = null;
        input.disconnectInputs();
      }
    }
  }

  outlet(key: KO): Outlet<VO> {
    let outlet = this._outlets.get(key);
    if (outlet === void 0) {
      outlet = new KeyOutlet<KO, VO>(this, key);
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
      outlets.forEach(function (key: KO, keyOutlet: KeyOutlet<KO, VO>) {
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
    if (this._input === null) {
      const outlets = this._outlets;
      if (outlets.isEmpty()) {
        this._outlets = new BTree();
        outlets.forEach(function (key: KO, keyOutlet: KeyOutlet<KO, VO>) {
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
  }
  invalidateOutputKey(key: KI, effect: KeyEffect): void {
    const oldOutputEffects = this._outputEffects;
    if (oldOutputEffects.get(key) !== effect) {
      this.willInvalidateOutputKey(key, effect);
      this._outputEffects = oldOutputEffects.updated(key, effect);
      this._version = -1;
      this.onInvalidateOutputKey(key, effect);
      this.didInvalidateOutputKey(key, effect);
    }
  }

  invalidateInputKey(key: KO, effect: KeyEffect): void {
    const oldInputEffects = this._inputEffects;
    if (oldInputEffects.get(key) !== effect) {
      this.willInvalidateInputKey(key, effect);
      this._inputEffects = oldInputEffects.updated(key, effect);
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

  invalidateOutput(): void {
    this.invalidate();
  }

  invalidateInput(): void {
    this.invalidate();
  }

  invalidate(): void {
    if (this._version >= 0) {
      this.willInvalidate();
      this._version = -1;
      this.onInvalidate();
      const n = this._outputs !== null ? this._outputs.length : 0;
      for (let i = 0; i < n; i += 1) {
        this._outputs![i].invalidateOutput();
      }
      this._outlets.forEach(function (key: KO, outlet: KeyOutlet<KO, VO>): void {
        outlet.invalidateInput();
      }, this);
      this.didInvalidate();
    }
  }

  reconcileOutputKey(key: KI, version: number): void {
    if (this._version < 0) {
      const oldOutputEffects = this._outputEffects;
      const effect = oldOutputEffects.get(key);
      if (effect !== void 0) {
        this.willReconcileOutputKey(key, effect, version);
        this._outputEffects = oldOutputEffects.removed(key);
        if (this._input !== null) {
          this._input.reconcileInputKey(key, version);
        }
        this.onReconcileOutputKey(key, effect, version);
        this.didReconcileOutputKey(key, effect, version);
      }
    }
  }

  reconcileInputKey(key: KO, version: number): void {
    if (this._version < 0) {
      const oldInputEffects = this._inputEffects;
      const oldEffect = oldInputEffects.get(key);
      if (oldEffect !== void 0) {
        const newEffect = this.willReconcileInputKey(key, oldEffect, version);
        if (oldEffect !== newEffect) {
          this.invalidateInputKey(key, newEffect);
        }
        this._inputEffects = oldInputEffects.removed(key);
        this.onReconcileInputKey(key, newEffect, version);
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
        this.didReconcileInputKey(key, newEffect, version);
      }
    }
  }

  reconcileOutput(version: number): void {
    this.reconcile(version);
  }

  reconcileInput(version: number): void {
    this.reconcile(version);
  }

  reconcile(version: number): void {
    if (this._version < 0) {
      this.willReconcile(version);
      this._outputEffects.forEach(function (key: KI): void {
        this.reconcileOutputKey(key, version);
      }, this);
      this._inputEffects.forEach(function (key: KO): void {
        this.reconcileInputKey(key, version);
      }, this);
      this._version = version;
      this.onReconcile(version);
      for (let i = 0, n = this._outputs !== null ? this._outputs.length : 0; i < n; i += 1) {
        this._outputs![i].reconcileOutput(version);
      }
      this.didReconcile(version);
    }
  }

  protected willInvalidateOutputKey(key: KI, effect: KeyEffect): void {
    // stub
  }

  protected onInvalidateOutputKey(key: KI, effect: KeyEffect): void {
    // stub
  }

  protected didInvalidateOutputKey(key: KI, effect: KeyEffect): void {
    // stub
  }

  protected willInvalidateInputKey(key: KO, effect: KeyEffect): void {
    // stub
  }

  protected onInvalidateInputKey(key: KO, effect: KeyEffect): void {
    // stub
  }

  protected didInvalidateInputKey(key: KO, effect: KeyEffect): void {
    // stub
  }

  protected willInvalidate(): void {
    // stub
  }

  protected onInvalidate(): void {
    // stub
  }

  protected didInvalidate(): void {
    // stub
  }

  protected willReconcileOutputKey(key: KI, effect: KeyEffect, version: number): void {
    // stub
  }

  protected onReconcileOutputKey(key: KI, effect: KeyEffect, version: number): void {
    // stub
  }

  protected didReconcileOutputKey(key: KI, effect: KeyEffect, version: number): void {
    // stub
  }

  protected willReconcileInputKey(key: KO, effect: KeyEffect, version: number): KeyEffect {
    return effect;
  }

  protected onReconcileInputKey(key: KO, effect: KeyEffect, version: number): void {
    // stub
  }

  protected didReconcileInputKey(key: KO, effect: KeyEffect, version: number): void {
    // stub
  }

  protected willReconcile(version: number): void {
    // stub
  }

  protected onReconcile(version: number): void {
    // stub
  }

  protected didReconcile(version: number): void {
    // stub
  }

  memoize(): MapOutlet<KO, VO, O> {
    const combinator = new MapOutlet.MemoizeMapCombinator<KO, VO, O>();
    combinator.bindInput(this);
    return combinator;
  }

  filter(func: FilterFieldsFunction<KO, VO>): MapOutlet<KO, VO, Map<KO, VO>> {
    const combinator = new MapOutlet.FilterFieldsCombinator<KO, VO, O>(func);
    combinator.bindInput(this);
    return combinator;
  }

  map<O2>(func: MapValueFunction<O, O2>): Outlet<O2>;
  map<V2>(func: MapFieldValuesFunction<KO, VO, V2>): MapOutlet<KO, V2, Map<KO, V2>>;
  map<V2>(func: MapValueFunction<O, V2> | MapFieldValuesFunction<KO, VO, V2>): Outlet<V2> | MapOutlet<KO, V2, Map<KO, V2>> {
    if (func.length === 1) {
      const combinator = new Outlet.MapValueCombinator<O, V2>(func as MapValueFunction<O, V2>);
      combinator.bindInput(this);
      return combinator;
    } else {
      const combinator = new MapOutlet.MapFieldValuesCombinator<KO, VO, V2, O>(func as MapFieldValuesFunction<KO, VO, V2>);
      combinator.bindInput(this);
      return combinator;
    }
  }

  reduce<U>(identity: U, accumulator: (result: U, element: VO) => U, combiner: (result: U, result2: U) => U): Outlet<U> {
    const combinator = new MapOutlet.ReduceFieldsCombinator<KO, VO, O, U>(identity, accumulator, combiner);
    combinator.bindInput(this);
    return combinator;
  }

  watch(func: WatchValueFunction<O>): this;
  watch(func: WatchFieldsFunction<KO, VO>): this;
  watch(func: WatchValueFunction<O> | WatchFieldsFunction<KO, VO>): this {
    if (func.length === 1) {
      const combinator = new Outlet.WatchValueCombinator<O>(func as WatchValueFunction<O>);
      combinator.bindInput(this);
      return this;
    } else {
      const combinator = new MapOutlet.WatchFieldsCombinator<KO, VO, O>(func as WatchFieldsFunction<KO, VO>);
      combinator.bindInput(this);
      return this;
    }
  }
}
