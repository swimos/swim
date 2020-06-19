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

import {Iterator, Cursor, Map} from "@swim/util";
import {BTree} from "@swim/collections";
import {Inlet} from "./Inlet";
import {Outlet} from "./Outlet";
import {KeyEffect} from "./KeyEffect";
import {MapInlet} from "./MapInlet";
import {MapOutlet} from "./MapOutlet";
import {KeyOutlet} from "./KeyOutlet";
import {MapInoutlet} from "./MapInoutlet";
import {FilterFieldsFunction} from "./function";
import {MapValueFunction, MapFieldValuesFunction} from "./function";
import {WatchValueFunction, WatchFieldsFunction} from "./function";

export abstract class AbstractMapInoutlet<K, VI, VO, I, O> implements MapInoutlet<K, VI, VO, I, O> {
  /** @hidden */
  protected _input: MapOutlet<K, VI, I> | null;
  /** @hidden */
  protected _effects: BTree<K, KeyEffect>;
  /** @hidden */
  protected _outlets: BTree<K, KeyOutlet<K, VO>>;
  /** @hidden */
  protected _outputs: ReadonlyArray<Inlet<O>> | null;
  /** @hidden */
  protected _version: number;

  constructor() {
    this._input = null;
    this._effects = new BTree();
    this._outlets = new BTree();
    this._outputs = null;
    this._version = -1;
  }

  abstract has(key: K): boolean;

  abstract get(): O | undefined;

  abstract get(key: K): VO | undefined;

  abstract keyIterator(): Iterator<K>;

  input(): MapOutlet<K, VI, I> | null {
    return this._input;
  }

  bindInput(input: MapOutlet<K, VI, I>): void {
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

  outlet(key: K): Outlet<VO> {
    let outlet = this._outlets.get(key);
    if (outlet === void 0) {
      outlet = new KeyOutlet<K, VO>(this, key);
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
      outlets.forEach(function (key: K, keyOutlet: KeyOutlet<K, VO>) {
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
        outlets.forEach(function (key: K, keyOutlet: KeyOutlet<K, VO>) {
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

  decohereOutputKey(key: K, effect: KeyEffect): void {
    this.decohereKey(key, effect);
  }

  decohereInputKey(key: K, effect: KeyEffect): void {
    this.decohereKey(key, effect);
  }

  decohereKey(key: K, effect: KeyEffect): void {
    const oldEffects = this._effects;
    if (oldEffects.get(key) !== effect) {
      this.willDecohereKey(key, effect);
      this._effects = oldEffects.updated(key, effect);
      this._version = -1;
      this.onDecohereKey(key, effect);
      const n = this._outputs !== null ? this._outputs.length : 0;
      for (let i = 0; i < n; i += 1) {
        const output = this._outputs![i];
        if (MapInlet.is(output)) {
          output.decohereOutputKey(key, effect);
        } else {
          output.decohereOutput();
        }
      }
      const outlet = this._outlets.get(key);
      if (outlet !== void 0) {
        outlet.decohereInput();
      }
      this.didDecohereKey(key, effect);
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
      this._outlets.forEach(function (key: K, outlet: KeyOutlet<K, VO>): void {
        outlet.decohereInput();
      }, this);
      this.didDecohere();
    }
  }

  recohereOutputKey(key: K, version: number): void {
    this.recohereKey(key, version);
  }

  recohereInputKey(key: K, version: number): void {
    this.recohereKey(key, version);
  }

  recohereKey(key: K, version: number): void {
    if (this._version < 0) {
      const oldEffects = this._effects;
      const effect = oldEffects.get(key);
      if (effect !== void 0) {
        this.willRecohereKey(key, effect, version);
        this._effects = oldEffects.removed(key);
        if (this._input !== null) {
          this._input.recohereInputKey(key, version);
        }
        this.onRecohereKey(key, effect, version);
        for (let i = 0, n = this._outputs !== null ? this._outputs.length : 0; i < n; i += 1) {
          const output = this._outputs![i];
          if (MapInlet.is(output)) {
            output.recohereOutputKey(key, version);
          }
        }
        const outlet = this._outlets.get(key);
        if (outlet !== void 0) {
          outlet.recohereInput(version);
        }
        this.didRecohereKey(key, effect, version);
      }
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
      this._effects.forEach(function (key: K): void {
        this.recohereKey(key, version);
      }, this);
      this._version = version;
      this.onRecohere(version);
      for (let i = 0, n = this._outputs !== null ? this._outputs.length : 0; i < n; i += 1) {
        this._outputs![i].recohereOutput(version);
      }
      this.didRecohere(version);
    }
  }

  protected willDecohereKey(key: K, effect: KeyEffect): void {
    // hook
  }

  protected onDecohereKey(key: K, effect: KeyEffect): void {
    // hook
  }

  protected didDecohereKey(key: K, effect: KeyEffect): void {
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

  protected willRecohereKey(key: K, effect: KeyEffect, version: number): void {
    // hook
  }

  protected onRecohereKey(key: K, effect: KeyEffect, version: number): void {
    // hook
  }

  protected didRecohereKey(key: K, effect: KeyEffect, version: number): void {
    // hook
  }

  protected willRecohere(version: number): void {
    // hook
  }

  protected onRecohere(version: number): void {
    // hook
  }

  protected didRecohere(version: number): void {
    // hook
  }

  memoize(): MapOutlet<K, VO, O> {
    const combinator = new MapOutlet.MemoizeMapCombinator<K, VO, O>();
    combinator.bindInput(this);
    return combinator;
  }

  filter(func: FilterFieldsFunction<K, VO>): MapOutlet<K, VO, Map<K, VO>> {
    const combinator = new MapOutlet.FilterFieldsCombinator<K, VO, O>(func);
    combinator.bindInput(this);
    return combinator;
  }

  map<O2>(func: MapValueFunction<O, O2>): Outlet<O2>;
  map<V2>(func: MapFieldValuesFunction<K, VO, V2>): MapOutlet<K, V2, Map<K, V2>>;
  map<V2>(func: MapValueFunction<O, V2> | MapFieldValuesFunction<K, VO, V2>): Outlet<V2> | MapOutlet<K, V2, Map<K, V2>> {
    if (func.length === 1) {
      const combinator = new Outlet.MapValueCombinator<O, V2>(func as MapValueFunction<O, V2>);
      combinator.bindInput(this);
      return combinator;
    } else {
      const combinator = new MapOutlet.MapFieldValuesCombinator<K, VO, V2, O>(func as MapFieldValuesFunction<K, VO, V2>);
      combinator.bindInput(this);
      return combinator;
    }
  }

  reduce<U>(identity: U, accumulator: (result: U, element: VO) => U, combiner: (result: U, result2: U) => U): Outlet<U> {
    const combinator = new MapOutlet.ReduceFieldsCombinator<K, VO, O, U>(identity, accumulator, combiner);
    combinator.bindInput(this);
    return combinator;
  }

  watch(func: WatchValueFunction<O>): this;
  watch(func: WatchFieldsFunction<K, VO>): this;
  watch(func: WatchValueFunction<O> | WatchFieldsFunction<K, VO>): this {
    if (func.length === 1) {
      const combinator = new Outlet.WatchValueCombinator<O>(func as WatchValueFunction<O>);
      combinator.bindInput(this);
      return this;
    } else {
      const combinator = new MapOutlet.WatchFieldsCombinator<K, VO, O>(func as WatchFieldsFunction<K, VO>);
      combinator.bindInput(this);
      return this;
    }
  }
}
