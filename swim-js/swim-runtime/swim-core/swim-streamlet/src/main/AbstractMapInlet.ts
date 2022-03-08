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

import type {Mutable} from "@swim/util";
import {BTree} from "@swim/collections";
import type {KeyEffect} from "./KeyEffect";
import type {MapInlet} from "./MapInlet";
import {MapOutlet} from "./MapOutlet";

/** @public */
export abstract class AbstractMapInlet<K, V, O> implements MapInlet<K, V, O> {
  constructor() {
    this.input = null;
    this.effects = new BTree();
    this.version = -1;
  }

  readonly input: MapOutlet<K, V, O> | null;

  /** @internal */
  readonly effects: BTree<K, KeyEffect>;

  /** @internal */
  readonly version: number;

  bindInput(newInput: MapOutlet<K, V, O> | null): void {
    if (!MapOutlet.is(newInput)) {
      throw new TypeError("" + newInput);
    }
    const oldInput = this.input;
    if (oldInput !== newInput) {
      if (oldInput !== null) {
        oldInput.unbindOutput(this);
      }
      (this as Mutable<this>).input = newInput;
      if (newInput !== null) {
        newInput.bindOutput(this);
      }
    }
  }

  unbindInput(): void {
    const oldInput = this.input;
    if (oldInput !== null) {
      oldInput.unbindOutput(this);
      (this as Mutable<this>).input = null;
    }
  }

  disconnectInputs(): void {
    const oldInput = this.input;
    if (oldInput !== null) {
      oldInput.unbindOutput(this);
      (this as Mutable<this>).input = null;
      oldInput.disconnectInputs();
    }
  }

  disconnectOutputs(): void {
    // nop
  }

  decohereOutputKey(key: K, effect: KeyEffect): void {
    const oldEffects = this.effects;
    if (oldEffects.get(key) !== effect) {
      this.willDecohereOutputKey(key, effect);
      (this as Mutable<this>).effects = oldEffects.updated(key, effect);
      (this as Mutable<this>).version = -1;
      this.onDecohereOutputKey(key, effect);
      this.didDecohereOutputKey(key, effect);
    }
  }

  decohereOutput(): void {
    if (this.version >= 0) {
      this.willDecohereOutput();
      (this as Mutable<this>).version = -1;
      this.onDecohereOutput();
      this.didDecohereOutput();
    }
  }

  recohereOutputKey(key: K, version: number): void {
    if (this.version < 0) {
      const oldEffects = this.effects;
      const effect = oldEffects.get(key);
      if (effect !== void 0) {
        this.willRecohereOutputKey(key, effect, version);
        (this as Mutable<this>).effects = oldEffects.removed(key);
        if (this.input !== null) {
          this.input.recohereInputKey(key, version);
        }
        this.onRecohereOutputKey(key, effect, version);
        this.didRecohereOutputKey(key, effect, version);
      }
    }
  }

  recohereOutput(version: number): void {
    if (this.version < 0) {
      this.willRecohereOutput(version);
      this.effects.forEach(function (key: K): void {
        this.recohereOutputKey(key, version);
      }, this);
      (this as Mutable<this>).version = version;
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
