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

import {Iterator, Cursor} from "@swim/util";
import {BTree} from "@swim/collections";
import {Inlet} from "./Inlet";
import {Outlet} from "./Outlet";
import {KeyEffect} from "./KeyEffect";
import {MapOutlet} from "./MapOutlet";
import {MapInletOutlet} from "./MapInletOutlet";
import {MapValueFunction, WatchValueFunction} from "./function";

export abstract class AbstractMapInletOutlet<K, V, I, O> implements MapInletOutlet<K, V, I, O> {
  /** @hidden */
  protected _input: MapOutlet<K, V, I> | null;
  /** @hidden */
  protected _effects: BTree<K, KeyEffect>;
  /** @hidden */
  protected _outputs: ReadonlyArray<Inlet<O>> | null;
  /** @hidden */
  protected _version: number;

  constructor() {
    this._input = null;
    this._effects = new BTree();
    this._outputs = null;
    this._version = -1;
  }

  abstract get(): O | undefined;

  input(): MapOutlet<K, V, I> | null {
    return this._input;
  }

  bindInput(input: MapOutlet<K, V, I>): void {
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
    if (this._outputs === null) {
      const input = this._input;
      if (input !== null) {
        input.unbindOutput(this);
        this._input = null;
        input.disconnectInputs();
      }
    }
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
    const oldEffects = this._effects;
    if (oldEffects.get(key) !== effect) {
      this.willDecohereOutputKey(key, effect);
      this._effects = oldEffects.updated(key, effect);
      this._version = -1;
      this.onDecohereOutputKey(key, effect);
      const n = this._outputs !== null ? this._outputs.length : 0;
      for (let i = 0; i < n; i += 1) {
        const output = this._outputs![i];
        output.decohereOutput();
      }
      this.didDecohereOutputKey(key, effect);
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

  recohereOutputKey(key: K, version: number): void {
    if (this._version < 0) {
      const oldEffects = this._effects;
      const effect = oldEffects.get(key);
      if (effect !== void 0) {
        this.willRecohereOutputKey(key, effect, version);
        this._effects = oldEffects.removed(key);
        if (this._input !== null) {
          this._input.recohereInputKey(key, version);
        }
        this.onRecohereOutputKey(key, effect, version);
        this.didRecohereOutputKey(key, effect, version);
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
        this.recohereOutputKey(key, version);
      }, this);
      this._version = version;
      this.onRecohere(version);
      for (let i = 0, n = this._outputs !== null ? this._outputs.length : 0; i < n; i += 1) {
        this._outputs![i].recohereOutput(version);
      }
      this.didRecohere(version);
    }
  }

  protected willDecohereOutputKey(key: K, effect: KeyEffect): void {
    // hook
  }

  protected onDecohereOutputKey(key: K, effect: KeyEffect): void {
    // hook
  }

  protected didDecohereOutputKey(key: K, effect: KeyEffect): void {
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

  protected willRecohereOutputKey(key: K, effect: KeyEffect, version: number): void {
    // hook
  }

  protected onRecohereOutputKey(key: K, effect: KeyEffect, version: number): void {
    // hook
  }

  protected didRecohereOutputKey(key: K, effect: KeyEffect, version: number): void {
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

  memoize(): Outlet<O> {
    const combinator = new Outlet.MemoizeValueCombinator<O>();
    combinator.bindInput(this);
    return combinator;
  }

  map<O2>(func: MapValueFunction<O, O2>): Outlet<O2> {
    const combinator = new Outlet.MapValueCombinator<O, O2>(func);
    combinator.bindInput(this);
    return combinator;
  }

  watch(func: WatchValueFunction<O>): this {
    const combinator = new Outlet.WatchValueCombinator<O>(func);
    combinator.bindInput(this);
    return this;
  }
}
