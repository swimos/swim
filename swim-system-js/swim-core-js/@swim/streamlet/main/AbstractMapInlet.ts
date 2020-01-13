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
    if (this._input != null) {
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

  invalidateOutputKey(key: K, effect: KeyEffect): void {
    const oldEffects = this._effects;
    if (oldEffects.get(key) !== effect) {
      this.willInvalidateOutputKey(key, effect);
      this._effects = oldEffects.updated(key, effect);
      this._version = -1;
      this.onInvalidateOutputKey(key, effect);
      this.didInvalidateOutputKey(key, effect);
    }
  }

  invalidateOutput(): void {
    if (this._version >= 0) {
      this.willInvalidateOutput();
      this._version = -1;
      this.onInvalidateOutput();
      this.didInvalidateOutput();
    }
  }

  reconcileOutputKey(key: K, version: number): void {
    if (this._version < 0) {
      const oldEffects = this._effects;
      const effect = oldEffects.get(key);
      if (effect !== void 0) {
        this.willReconcileOutputKey(key, effect, version);
        this._effects = oldEffects.removed(key);
        if (this._input !== null) {
          this._input.reconcileInputKey(key, version);
        }
        this.onReconcileOutputKey(key, effect, version);
        this.didReconcileOutputKey(key, effect, version);
      }
    }
  }

  reconcileOutput(version: number): void {
    if (this._version < 0) {
      this.willReconcileOutput(version);
      this._effects.forEach(function (key: K): void {
        this.reconcileOutputKey(key, version);
      }, this);
      this._version = version;
      this.onReconcileOutput(version);
      this.didReconcileOutput(version);
    }
  }

  protected willInvalidateOutputKey(key: K, effect: KeyEffect): void {
    // stub
  }

  protected onInvalidateOutputKey(key: K, effect: KeyEffect): void {
    // stub
  }

  protected didInvalidateOutputKey(key: K, effect: KeyEffect): void {
    // stub
  }

  protected willInvalidateOutput(): void {
    // stub
  }

  protected onInvalidateOutput(): void {
    // stub
  }

  protected didInvalidateOutput(): void {
    // stub
  }

  protected willReconcileOutputKey(key: K, effect: KeyEffect, version: number): void {
    // stub
  }

  protected onReconcileOutputKey(key: K, effect: KeyEffect, version: number): void {
    // stub
  }

  protected didReconcileOutputKey(key: K, effect: KeyEffect, version: number): void {
    // stub
  }

  protected willReconcileOutput(version: number): void {
    // stub
  }

  protected onReconcileOutput(version: number): void {
    // stub
  }

  protected didReconcileOutput(version: number): void {
    // stub
  }
}
