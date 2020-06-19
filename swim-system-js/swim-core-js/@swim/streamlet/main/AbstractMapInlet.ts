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

import {BTree} from "@swim/collections";
import {KeyEffect} from "./KeyEffect";
import {MapInlet} from "./MapInlet";
import {MapOutlet} from "./MapOutlet";

export abstract class AbstractMapInlet<K, V, O> implements MapInlet<K, V, O> {
  /** @hidden */
  protected _input: MapOutlet<K, V, O> | null;
  /** @hidden */
  protected _effects: BTree<K, KeyEffect>;
  /** @hidden */
  protected _version: number;

  constructor() {
    this._input = null;
    this._effects = new BTree();
    this._version = -1;
  }

  input(): MapOutlet<K, V, O> | null {
    return this._input;
  }

  bindInput(input: MapOutlet<K, V, O> | null): void {
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
    const input = this._input;
    if (input !== null) {
      input.unbindOutput(this);
      this._input = null;
      input.disconnectInputs();
    }
  }

  disconnectOutputs(): void {
    // nop
  }

  decohereOutputKey(key: K, effect: KeyEffect): void {
    const oldEffects = this._effects;
    if (oldEffects.get(key) !== effect) {
      this.willDecohereOutputKey(key, effect);
      this._effects = oldEffects.updated(key, effect);
      this._version = -1;
      this.onDecohereOutputKey(key, effect);
      this.didDecohereOutputKey(key, effect);
    }
  }

  decohereOutput(): void {
    if (this._version >= 0) {
      this.willDecohereOutput();
      this._version = -1;
      this.onDecohereOutput();
      this.didDecohereOutput();
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
    if (this._version < 0) {
      this.willRecohereOutput(version);
      this._effects.forEach(function (key: K): void {
        this.recohereOutputKey(key, version);
      }, this);
      this._version = version;
      this.onRecohereOutput(version);
      this.didRecohereOutput(version);
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

  protected willDecohereOutput(): void {
    // hook
  }

  protected onDecohereOutput(): void {
    // hook
  }

  protected didDecohereOutput(): void {
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

  protected willRecohereOutput(version: number): void {
    // hook
  }

  protected onRecohereOutput(version: number): void {
    // hook
  }

  protected didRecohereOutput(version: number): void {
    // hook
  }
}
